import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Coins, 
  Activity, 
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Clock,
  Sparkles,
  Inbox
} from "lucide-react";
import { MealPlan } from "../types";

interface HistoryListProps {
  plans: MealPlan[];
  onSelect: (plan: MealPlan) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function HistoryList({ plans, onSelect, onDelete }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPlans = plans.filter(p => {
    const stringSearchRaw = `${p.dietType} ${p.ingredients} ${p.aiResponse.breakfast} ${p.aiResponse.lunch} ${p.aiResponse.dinner}`;
    return stringSearchRaw.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this historical meal plan? This is irreversible.")) {
      return;
    }
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Recently";
    try {
      // Firebase timestamp conversion
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "Saved recently";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900/60">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Previous Cooking Roadmaps
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, resume, or audit your previous personalized diet plan responses.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <input
            id="input-search-history"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ingredients, diets..."
            className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Grid of history items */}
      {filteredPlans.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl border border-slate-900 flex flex-col items-center justify-center gap-3">
          <Inbox className="w-12 h-12 text-slate-600 stroke-1" />
          <div>
            <h4 className="font-display font-semibold text-slate-300">No History Plans Located</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchTerm 
                ? "Try relaxing your search spelling or review full criteria." 
                : "Submit the primary generation form to initiate your very first meal schedule."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelect(plan)}
              className="glass-panel p-5 rounded-2xl border border-slate-900/80 hover:border-emerald-500/20 hover:bg-slate-900/30 transition duration-300 group cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              {/* Highlight line */}
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/10 group-hover:bg-emerald-500/30 transition" />

              <div className="pl-2 space-y-3">
                {/* Date and actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(plan.createdAt)}
                  </span>
                  <button
                    id={`btn-delete-plan-${plan.id}`}
                    onClick={(e) => handleDelete(plan.id, e)}
                    disabled={deletingId === plan.id}
                    className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-slate-950 hover:border-red-500/20 text-rose-400 opacity-60 hover:opacity-100 transition duration-200"
                    title="Delete permanently"
                  >
                    {deletingId === plan.id ? (
                      <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Primary plan tags */}
                <div>
                  <h4 className="font-display font-medium text-sm text-slate-200 leading-tight group-hover:text-emerald-400 transition">
                    Custom Plan for {plan.peopleCount} {plan.peopleCount === 1 ? "Person" : "People"}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 rounded">
                      {plan.dietType}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 rounded flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {plan.availableTime}m prep
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 rounded flex items-center gap-0.5">
                      <Coins className="w-2.5 h-2.5" /> {plan.aiResponse.estimatedCost || "Budget safe"}
                    </span>
                  </div>
                </div>

                {/* Pantry Preview */}
                {plan.ingredients && (
                  <p className="text-xs text-slate-400 leading-normal line-clamp-2 italic bg-slate-950/20 p-2.5 rounded border border-slate-950">
                    Pantry: {plan.ingredients}
                  </p>
                )}
              </div>

              {/* Enter prompt button */}
              <div className="pl-2 pt-2 border-t border-slate-950 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition">
                <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Restore elements
                </span>
                <div className="flex items-center gap-1 group-hover:translate-x-1.5 transition duration-200">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
