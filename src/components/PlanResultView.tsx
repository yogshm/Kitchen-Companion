import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Coffee, 
  Sun, 
  Moon, 
  CheckSquare, 
  ShoppingBag, 
  Replace, 
  Coins, 
  Clock, 
  Heart, 
  Sparkles, 
  Download, 
  Plus, 
  Bookmark, 
  Trash,
  RotateCcw,
  Zap,
  Info
} from "lucide-react";
import { AIResponse, MealPlan, MealPlanFormValues } from "../types";
import { jsPDF } from "jspdf";

interface PlanResultViewProps {
  response: AIResponse;
  planFormValues?: MealPlanFormValues;
  onSave: () => void;
  onRegenerate: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export default function PlanResultView({ 
  response, 
  planFormValues, 
  onSave, 
  onRegenerate, 
  isSaving, 
  isSaved 
}: PlanResultViewProps) {
  // Local state for tracking ticked items in checklists
  const [checkedTodo, setCheckedTodo] = useState<{ [key: number]: boolean }>({});
  const [checkedGrocery, setCheckedGrocery] = useState<{ [key: number]: boolean }>({});

  const toggleTodo = (idx: number) => {
    setCheckedTodo(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleGrocery = (idx: number) => {
    setCheckedGrocery(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Safe split values for list items (in case backend sends string vs array)
  const todoList = Array.isArray(response.todoList) ? response.todoList : [];
  const groceryList = Array.isArray(response.groceryList) ? response.groceryList : [];
  const substitutions = Array.isArray(response.substitutions) ? response.substitutions : [];

  // Budget status calculations
  const budgetLimit = planFormValues?.budget || 30;
  const rawCostString = response.estimatedCost || "$0.00";
  const numCost = parseFloat(rawCostString.replace(/[^0-9.]/g, "")) || 0;
  const isBudgetSafe = numCost <= budgetLimit;
  const budgetRatio = Math.min(100, Math.round((numCost / budgetLimit) * 100));

  // Export to PDF function via jsPDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      // Primary visual layout
      doc.setFillColor(3, 7, 18); // Dark background header
      doc.rect(0, 0, 210, 30, "F");

      doc.setTextColor(16, 185, 129); // Emerald color
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AI COOKING ASSISTANT", 15, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("PromptWars Challenge Custom Plan", 145, 20);

      y = 40;
      doc.setTextColor(31, 41, 55); // Slate
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Diet Type: ${planFormValues?.dietType || "General"} | Feeds: ${planFormValues?.peopleCount || 1} | Daily Budget Limit: $${budgetLimit}`, 15, y);
      y += 5;
      doc.line(15, y, 195, y);
      y += 10;

      // Meals
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("Daily Meal Plan", 15, y);
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.setFont("helvetica", "bold");
      doc.text("Breakfast:", 15, y);
      doc.setFont("helvetica", "normal");
      const bText = doc.splitTextToSize(response.breakfast, 175);
      doc.text(bText, 38, y);
      y += (bText.length * 5) + 5;

      doc.setFont("helvetica", "bold");
      doc.text("Lunch:", 15, y);
      doc.setFont("helvetica", "normal");
      const lText = doc.splitTextToSize(response.lunch, 175);
      doc.text(lText, 38, y);
      y += (lText.length * 5) + 5;

      doc.setFont("helvetica", "bold");
      doc.text("Dinner:", 15, y);
      doc.setFont("helvetica", "normal");
      const dText = doc.splitTextToSize(response.dinner, 175);
      doc.text(dText, 38, y);
      y += (dText.length * 5) + 12;

      // Check if page limit reached
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Sidebar Lists
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.setFont("helvetica", "bold");
      doc.text("Cooking & Prep Schedule", 15, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      todoList.forEach((todo, idx) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(`[ ]  ${todo}`, 18, y);
        y += 6;
      });
      y += 5;

      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("Grocery Shopping Checklist", 15, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      groceryList.forEach((item, idx) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(`[ ]  ${item}`, 18, y);
        y += 6;
      });
      y += 5;

      if (y > 250) { doc.addPage(); y = 20; }

      // Substitutions
      if (substitutions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text("Recommended Substitutions", 15, y);
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        substitutions.forEach((sub, idx) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`* ${sub}`, 18, y);
          y += 6;
        });
        y += 5;
      }

      if (y > 250) { doc.addPage(); y = 20; }

      // Budget & Nutrition
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("Financial & Dietary Analysis", 15, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`Est. Cumulative Cost: ${response.estimatedCost}`, 15, y);
      y += 6;
      doc.text(`Nutrition Info Summary: ${response.nutritionSummary}`, 15, y);
      y += 6;
      const budgetText = doc.splitTextToSize(`Budget Summary: ${response.budgetAnalysis}`, 175);
      doc.text(budgetText, 15, y);

      // Save PDF
      doc.save("Kitchen_AI_Cooking_Plan.pdf");
    } catch (error) {
      console.error("PDF generation failure", error);
      alert("Failed to export as PDF directly. Fallback: print using CMD+P or select save as PDF.");
    }
  };

  return (
    <div id="results-deck" className="space-y-6">
      {/* Top Banner Control Board */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 rounded-2xl bg-slate-900 border border-slate-800 gap-4 glow-emerald-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-100 text-lg">AI Plan Instantiated</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Custom analysis crafted perfectly in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-save-plan-results"
            onClick={onSave}
            disabled={isSaving || isSaved}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer
              ${isSaved 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default" 
                : "bg-emerald-500 text-slate-950 border-transparent hover:bg-emerald-400"}`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
            {isSaving ? "Saving..." : isSaved ? "Plan Saved" : "Save Plan"}
          </button>
          
          <button
            id="btn-pdf-results"
            onClick={exportToPDF}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>

          <button
            id="btn-regenerate-results"
            onClick={onRegenerate}
            className="p-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/20 rounded-xl transition cursor-pointer"
            title="Re-generate using same parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Budget Status + Health Index summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Budget Status Indicator Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" /> Financial Viability
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase
              ${isBudgetSafe 
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}
            >
              {isBudgetSafe ? "Fit Budget" : "Tight Budget"}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Est. Accumulative Cost</p>
                <h4 className="font-display font-extrabold text-2xl text-slate-100">{rawCostString}</h4>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Input Budget</p>
                <h5 className="font-display font-bold text-slate-300">${budgetLimit}</h5>
              </div>
            </div>
            {/* Visual meter bar */}
            <div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden flex">
                <div 
                  style={{ width: `${budgetRatio}%` }}
                  className={`h-full rounded-full transition-all duration-500
                    ${isBudgetSafe ? "bg-emerald-500" : "bg-amber-500"}`}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 text-right mt-1.5">
                {budgetRatio}% of allocated budget limit exhausted
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-950">
              {response.budgetAnalysis}
            </p>
          </div>
        </div>

        {/* Nutritional Summary Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-rose-400" /> Nutrition Profile (Est.)
          </span>
          <div className="space-y-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-950 h-32 overflow-y-auto flex items-center">
              <p className="text-sm font-semibold text-slate-200 text-center w-full whitespace-pre-wrap leading-relaxed">
                {response.nutritionSummary || "Calculation pending database metadata."}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
              <p className="text-[10px] text-emerald-400/90 leading-tight">
                Metabolic indexes customized according to chosen diet parameter: <b className="uppercase">{planFormValues?.dietType}</b>.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule & Time Efficiency optimization */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-emerald-400" /> Time & Schedule Optimization
          </span>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Cook Time Budget</span>
              <span className="text-xs font-semibold text-slate-300 font-mono">{planFormValues?.availableTime || 45} mins</span>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-950 h-28 overflow-y-auto">
              <p className="mb-2 font-semibold text-emerald-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" /> Prep Efficiency:
              </p>
              {response.prepSuggestions || "Consolidate seasoning and marinades first to shave cooking intervals."}
            </div>
            <div className="text-[11px] text-slate-400 italic">
              * {response.scheduleOptimization || "Meals optimized directly around your daily commuting schedule."}
            </div>
          </div>
        </div>
      </div>

      {/* Meals Carousel of Cards */}
      <h4 className="font-display font-extrabold text-slate-100 text-lg border-b border-slate-900 pb-2 mt-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" /> Structured Daily Menu
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Breakfast Card */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden hover:border-emerald-500/15 transition group flex flex-col">
          <div className="p-4 px-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-b border-slate-900 flex items-center justify-between">
            <h5 className="font-display font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              1. Breakfast Plan
            </h5>
            <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-emerald-400">AM Phase</span>
          </div>
          {/* Gourmet Thumbnail banner */}
          <div className="h-44 overflow-hidden border-b border-slate-900/60 relative">
            <img 
              src="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80" 
              alt="Gourmet Breakfast Toast with Eggs and Fresh Greens" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line select-none select-text flex-1">
            {response.breakfast}
          </div>
        </div>

        {/* Lunch Card */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden hover:border-emerald-500/15 transition group flex flex-col">
          <div className="p-4 px-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-b border-slate-900 flex items-center justify-between">
            <h5 className="font-display font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
              <Sun className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              2. Midday Lunch
            </h5>
            <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-emerald-400">Midday Phase</span>
          </div>
          {/* Gourmet Thumbnail banner */}
          <div className="h-44 overflow-hidden border-b border-slate-900/60 relative">
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" 
              alt="Gourmet Nourish Salad and Protein Lunch Bowl" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line select-none select-text flex-1">
            {response.lunch}
          </div>
        </div>

        {/* Dinner Card */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden hover:border-emerald-500/15 transition group flex flex-col">
          <div className="p-4 px-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-b border-slate-900 flex items-center justify-between">
            <h5 className="font-display font-bold text-sm tracking-wide text-slate-100 flex items-center gap-2">
              <Moon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              3. Dinner Plan
            </h5>
            <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-emerald-400">PM Phase</span>
          </div>
          {/* Gourmet Thumbnail banner */}
          <div className="h-44 overflow-hidden border-b border-slate-900/60 relative">
            <img 
              src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80" 
              alt="Pan-seared Salmon Fillet with Fire-Roasted Vegetables" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line select-none select-text flex-1">
            {response.dinner}
          </div>
        </div>
      </div>

      {/* Grid lists: Schedules/Checklist & Grocery lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Cooking checklist */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h4 className="font-display font-bold text-slate-100 text-sm tracking-wide mb-4 flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="flex items-center gap-2"><CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> Cooking Checklist</span>
            <span className="text-[10px] font-mono text-slate-500">
              {Object.values(checkedTodo).filter(Boolean).length} / {todoList.length} completed
            </span>
          </h4>
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {todoList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No tasks compiled. Specify details in form.</p>
            ) : (
              todoList.map((todo, idx) => {
                const checked = checkedTodo[idx] || false;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTodo(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-xs leading-relaxed
                      ${checked 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/70 line-through" 
                        : "bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800"}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded border flex-shrink-0 flex items-center justify-center transition
                      ${checked ? "bg-emerald-500 border-transparent text-slate-950" : "border-slate-800"}`}
                    >
                      {checked && <div className="w-2.5 h-2.5 bg-slate-950 rounded-[2px]" />}
                    </div>
                    <span>{todo}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Grocery shopping list */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h4 className="font-display font-bold text-slate-100 text-sm tracking-wide mb-4 flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="flex items-center gap-2"><ShoppingBag className="w-4.5 h-4.5 text-emerald-400" /> Consolidated Grocery List</span>
            <span className="text-[10px] font-mono text-slate-500">
              {Object.values(checkedGrocery).filter(Boolean).length} / {groceryList.length} packed
            </span>
          </h4>
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {groceryList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No grocery items compiled.</p>
            ) : (
              groceryList.map((item, idx) => {
                const checked = checkedGrocery[idx] || false;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleGrocery(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-xs
                      ${checked 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/70 line-through" 
                        : "bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800"}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded border flex-shrink-0 flex items-center justify-center transition
                      ${checked ? "bg-emerald-500 border-transparent text-slate-950" : "border-slate-800"}`}
                    >
                      {checked && <div className="w-2.5 h-2.5 bg-slate-950 rounded-[2px]" />}
                    </div>
                    <span>{item}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ingredient substitutions section */}
      {substitutions.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 mt-4">
          <h4 className="font-display font-bold text-slate-100 text-sm tracking-wide mb-3 flex items-center gap-2">
            <Replace className="w-4.5 h-4.5 text-emerald-400" /> Smart Pantry Substitutions
          </h4>
          <p className="text-xs text-slate-500 mb-4 font-mono">Recommended replacement configurations for missing kitchen items:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {substitutions.map((sub, idx) => (
              <div 
                key={idx}
                className="p-3.5 px-4 bg-slate-950/50 border border-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed"
              >
                {sub}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
