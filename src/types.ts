export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: any;
}

export type DietType = "Vegetarian" | "Non Vegetarian" | "Vegan" | "High Protein" | "Weight Loss";
export type ActivityLevel = "Sedentary" | "Lightly Active" | "Moderately Active" | "Highly Active";

export interface MealPlanFormValues {
  peopleCount: number;
  workSchedule: string;
  busyDay: boolean;
  availableTime: number;
  budget: number;
  dietType: DietType;
  activityLevel?: ActivityLevel;
  ingredients: string;
  likes: string;
  dislikes: string;
}

export interface AIResponse {
  breakfast: string;
  lunch: string;
  dinner: string;
  todoList: string[];
  groceryList: string[];
  substitutions: string[];
  budgetAnalysis: string;
  estimatedCost: string;
  nutritionSummary: string;
  prepSuggestions?: string;
  scheduleOptimization?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  peopleCount: number;
  workSchedule: string;
  busyDay: boolean;
  availableTime: number;
  budget: number;
  dietType: DietType;
  activityLevel?: ActivityLevel;
  ingredients: string;
  likes: string;
  dislikes: string;
  aiResponse: AIResponse;
  createdAt: any;
}
