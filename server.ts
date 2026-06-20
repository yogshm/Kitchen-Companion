import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Gemini SDK client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required on the server");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// API endpoint for generating a meal plan
app.post("/api/generate-meal-plan", async (req, res) => {
  try {
    const {
      peopleCount,
      workSchedule,
      busyDay,
      availableTime,
      budget,
      dietType,
      ingredients,
      likes,
      dislikes,
    } = req.body;

    const systemPrompt = `You are an expert AI chef and culinary planner.
Generate a complete, personalized cooking plan and schedule based on the user's details.
Return ONLY a valid JSON object matching the exact structure below. Do not wrap in markdown \`\`\`json blocks - return just the raw JSON text.

Expected JSON Structure:
{
  "breakfast": "Provide breakfast plan with title and short instructions.",
  "lunch": "Provide lunch plan with title and short instructions.",
  "dinner": "Provide dinner plan with title and short instructions.",
  "todoList": [
    "Step 1 to-do item with time estimates",
    "Step 2 to-do item with time estimates",
    "Step 3 to-do item with time estimates"
  ],
  "groceryList": [
    "Item 1 (estimated price)",
    "Item 2 (estimated price)",
    "Item 3 (estimated price)"
  ],
  "substitutions": [
    "If ingredient X is missing, swap with Y",
    "Substitute Z for W to meet dietary preferences/budget"
  ],
  "budgetAnalysis": "Explain how the plan fits the budget.",
  "estimatedCost": "Include the estimated cost, e.g. $14.50",
  "nutritionSummary": "Protein: ...g, Carbs: ...g, Fat: ...g, Calories: ...kcal (total or per meal estimate)",
  "prepSuggestions": "A couple of quick daily meal-prep efficiency suggestions",
  "scheduleOptimization": "How to fit this cooking schedule around their work hours"
}

User Context:
- People count: ${peopleCount || "1"} people.
- Work schedule: ${workSchedule || "None/Flexible"}
- Is a busy day?: ${busyDay ? "Yes" : "No"}
- Available cooking time: ${availableTime || "60"} minutes total.
- Daily budget: $${budget || "20"} total.
- Diet Type/Preferences: ${dietType || "Flexible"}
- Available ingredients at home: ${ingredients || "None specified"}
- Food preferences (likes): ${likes || "None specified"}
- Food preferences (dislikes): ${dislikes || "None specified"}

Focus on making the meal plan extremely realistic, delicious, fully detailed yet quick to complete within the specified ${availableTime || "60"} minutes. Be mindful of the budget: $${budget}! The meals must feed ${peopleCount || "1"} people.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    // Clean up response if the model wrapped it in markdown json block anyway
    let cleanedJsonText = responseText.trim();
    if (cleanedJsonText.startsWith("```json")) {
      cleanedJsonText = cleanedJsonText.substring(7);
    }
    if (cleanedJsonText.endsWith("```")) {
      cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
    }
    cleanedJsonText = cleanedJsonText.trim();

    const outputJson = JSON.parse(cleanedJsonText);
    res.json(outputJson);
  } catch (err: any) {
    console.error("Meal plan generation error:", err);
    res.status(500).json({
      error: err.message || "Failed to generate meal plan.",
    });
  }
});

// Configure Vite or production static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Cooking Assistant Server is running on port ${PORT}`);
  });
}

startServer();
