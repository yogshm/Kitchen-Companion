import React from "react";
import { User as FirebaseUser } from "firebase/auth";
import { 
  User, 
  Mail, 
  Award, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  Heart,
  TrendingUp,
  ChefHat
} from "lucide-react";
import { MealPlan } from "../types";

interface ProfileViewProps {
  user: FirebaseUser | null;
  savedPlansCount: number;
  onClearAllPlans: () => Promise<void>;
}

export default function ProfileView({ user, savedPlansCount, onClearAllPlans }: ProfileViewProps) {
  // Determine user qualification tier based on generated plans count
  const getSubClass = (count: number) => {
    if (count >= 15) return { title: "Grandmaster Culinary Architect", icon: <ChefHat className="w-5 h-5 text-yellow-400" /> };
    if (count >= 8) return { title: "Senior AI Prep Chef", icon: <Award className="w-5 h-5 text-emerald-400" /> };
    if (count >= 3) return { title: "Kitchen Automation Cadet", icon: <Flame className="w-5 h-5 text-teal-400" /> };
    return { title: "Culinary Intern", icon: <ShieldCheck className="w-5 h-5 text-slate-400" /> };
  };

  const badgeObj = getSubClass(savedPlansCount);

  const handleClearHistory = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to purge all meal planning files stored inside your database? This cannot be undone.")) {
      return;
    }
    await onClearAllPlans();
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="pb-4 border-b border-slate-900/40">
        <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          Chef Account Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your credentials, ranking level, and database storage statistics.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-900/60 shadow-xl space-y-6 relative overflow-hidden">
        {/* Ambient top glowing line */}
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-teal-500/10 via-emerald-500/30 to-transparent" />

        {/* User Identity Banner */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-display font-extrabold text-2xl shadow-inner">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "C"}
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-100 text-lg">{user?.displayName || "Culinary Pilot"}</h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email || "No email located"}
            </p>
          </div>
        </div>

        {/* Ranking parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rank Badge */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              {badgeObj.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Culinary Class</span>
              <h5 className="text-xs font-bold text-slate-300 leading-tight mt-0.5">{badgeObj.title}</h5>
            </div>
          </div>

          {/* Database stats */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Cataloged</span>
              <h5 className="text-xs font-bold text-slate-300 mt-0.5">{savedPlansCount} meal reports</h5>
            </div>
          </div>
        </div>

        {/* Achievements / Metrics */}
        <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-950">
          <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Challenge Badges
          </h4>
          <div className="flex flex-col gap-2.5 pt-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" /> Healthy Pantry Logger
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/5 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10">UNLOCKED</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <ChefHat className="w-3.5 h-3.5 text-yellow-500/80" /> Budget Optimiser Master
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/5 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10">UNLOCKED</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 5-Day Consecutive Planner
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border
                ${savedPlansCount >= 5 
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" 
                  : "bg-slate-950 text-slate-600 border-transparent"}`}
              >
                {savedPlansCount >= 5 ? "UNLOCKED" : `${savedPlansCount}/5 PLANS`}
              </span>
            </div>
          </div>
        </div>

        {/* Purge block */}
        <div className="pt-4 border-t border-slate-950 space-y-3">
          <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            Zone of Hazard
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            Purging your personal plan records wipes all metadata in Firestore profile tables immediately.
          </p>
          <button
            id="btn-purge-history"
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-500/5 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-transparent text-rose-400 text-xs font-bold rounded-xl transition duration-300 cursor-pointer"
          >
            Purge Saved History Log
          </button>
        </div>
      </div>
    </div>
  );
}
