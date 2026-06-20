import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Clock, 
  DollarSign, 
  Check, 
  Sparkles, 
  Compass, 
  Activity, 
  Heart, 
  HeartOff,
  Plus,
  BookOpen,
  Droplet
} from "lucide-react";
import { MealPlanFormValues, DietType, ActivityLevel } from "../types";

interface PlanFormProps {
  onSubmit: (values: MealPlanFormValues) => void;
  loading: boolean;
}

export default function PlanForm({ onSubmit, loading }: PlanFormProps) {
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [workSchedule, setWorkSchedule] = useState<string>("9 AM to 5 PM");
  const [busyDay, setBusyDay] = useState<boolean>(false);
  const [availableTime, setAvailableTime] = useState<number>(45);
  const [budget, setBudget] = useState<number>(25);
  const [dietType, setDietType] = useState<DietType>("Vegetarian");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("Moderately Active");
  const [ingredients, setIngredients] = useState<string>("");
  const [likes, setLikes] = useState<string>("");
  const [dislikes, setDislikes] = useState<string>("");

  const dietOptions: DietType[] = [
    "Vegetarian",
    "Non Vegetarian",
    "Vegan",
    "High Protein",
    "Weight Loss"
  ];

  const activityOptions: ActivityLevel[] = [
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Highly Active"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      peopleCount,
      workSchedule,
      busyDay,
      availableTime,
      budget,
      dietType,
      activityLevel,
      ingredients,
      likes,
      dislikes
    });
  };

  const loadExample = () => {
    setPeopleCount(3);
    setWorkSchedule("8:30 AM to 6 PM (Commuting)");
    setBusyDay(true);
    setAvailableTime(30);
    setBudget(35);
    setDietType("High Protein");
    setActivityLevel("Highly Active");
    setIngredients("Chicken breasts, canned chickpeas, spinach, eggs, olive oil, garlic, brown rice, whole wheat bread");
    setLikes("Spicy flavor profiles, roasted vegetables, light seasonings");
    setDislikes("Mushrooms, excessive cilantro");
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-900/60 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-12 w-48 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-900/40">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            Plan Your Culinary Day
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fill out your pantry details and schedule to orchestrate an optimized system.
          </p>
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-mono transition"
        >
          Auto Fill Example
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: People & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400/80" /> Number of People
            </label>
            <input
              id="input-people-count"
              type="number"
              min={1}
              max={20}
              required
              disabled={loading}
              value={peopleCount}
              onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="e.g. 2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400/80" /> Food Budget ($ per day)
            </label>
            <input
              id="input-budget"
              type="number"
              min={1}
              max={1000}
              required
              disabled={loading}
              value={budget}
              onChange={(e) => setBudget(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="e.g. 30"
            />
          </div>
        </div>

        {/* Row 2: Schedule & Cooking Time & Busy toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              Work Schedule Info
            </label>
            <input
              id="input-schedule"
              type="text"
              required
              disabled={loading}
              value={workSchedule}
              onChange={(e) => setWorkSchedule(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="e.g. 9 AM to 5 PM"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400/80" /> Available Time (mins)
            </label>
            <input
              id="input-available-time"
              type="number"
              min={5}
              max={300}
              required
              disabled={loading}
              value={availableTime}
              onChange={(e) => setAvailableTime(Math.max(5, parseInt(e.target.value) || 5))}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="e.g. 45"
            />
          </div>

          <div className="space-y-2 flex flex-col justify-end">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center justify-between mb-2">
              Busy day intensity
            </label>
            <button
              id="btn-toggle-busy"
              type="button"
              disabled={loading}
              onClick={() => setBusyDay(!busyDay)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium border flex items-center justify-between transition duration-200 cursor-pointer
                ${busyDay 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                  : "bg-slate-900/30 border-slate-950 text-slate-400 hover:border-slate-800"}`}
            >
              <span>Schedule optimized?</span>
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${busyDay ? "bg-amber-400" : "bg-slate-700"}`} />
            </button>
          </div>
        </div>

        {/* Option diet selection chips */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400/80" /> Primary Dietary Regime
          </label>
          <div className="flex flex-wrap gap-2.5">
            {dietOptions.map((opt) => {
              const active = dietType === opt;
              return (
                <button
                  key={opt}
                  id={`btn-diet-${opt.toLowerCase().replace(" ", "-")}`}
                  type="button"
                  disabled={loading}
                  onClick={() => setDietType(opt)}
                  className={`
                    px-4 py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer duration-150
                    ${active 
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 glow-emerald-sm" 
                      : "bg-slate-900/30 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"}
                  `}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Option activity level selection chips */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-sky-400/80 animate-bounce" /> Core Physical Activity (Hydration Auto-Calculator)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {activityOptions.map((opt) => {
              const active = activityLevel === opt;
              return (
                <button
                  key={opt}
                  id={`btn-activity-${opt.toLowerCase().replace(" ", "-")}`}
                  type="button"
                  disabled={loading}
                  onClick={() => setActivityLevel(opt)}
                  className={`
                    px-4 py-2.5 rounded-xl text-xs font-medium border transition cursor-pointer duration-150
                    ${active 
                      ? "bg-sky-500/15 border-sky-500/40 text-sky-400 glow-sky-sm" 
                      : "bg-slate-900/30 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"}
                  `}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* pantry ingredient list text area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400/80" /> Available Ingredients at Home
            </label>
            <span className="text-[10px] font-mono text-slate-500">Separated by commas</span>
          </div>
          <textarea
            id="textarea-pantry-ingredients"
            rows={3}
            disabled={loading}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full glass-input px-4 py-3 rounded-xl text-sm resize-none"
            placeholder="e.g. Tomatoes, whole milk, chicken breasts, penne pasta, cheddar cheese..."
          />
        </div>

        {/* Preferences Likes/Dislikes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-emerald-400/70" /> Ingredient / Spice Likes (Optional)
            </label>
            <input
              id="input-likes"
              type="text"
              disabled={loading}
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="e.g. Garlic, Rosemary, Spicy food"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <HeartOff className="w-4 h-4 text-rose-500/70" /> Dislikes / Allergens (Optional)
            </label>
            <input
              id="input-dislikes"
              type="text"
              disabled={loading}
              value={dislikes}
              onChange={(e) => setDislikes(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-sm"
              placeholder="e.g. Cilantro, Shellfish, Bell peppers"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          id="btn-generate-plan"
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Orchestrating Culinary Roadmap...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Generate AI Cooking Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
