import React from "react";
import { 
  Sparkles, 
  Utensils, 
  Clock, 
  DollarSign, 
  Flame,
  Scale,
  Droplet,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";
import { MealPlan } from "../types";

interface StatsBannerProps {
  plans: MealPlan[];
  waterIntakeMl: number;
  onUpdateWater: (newAmountMl: number) => void;
}

export default function StatsBanner({ plans, waterIntakeMl, onUpdateWater }: StatsBannerProps) {
  const plansCount = plans.length;

  const averageBudget = plansCount > 0 
    ? (plans.reduce((acc, p) => acc + (Number(p.budget) || 0), 0) / plansCount).toFixed(1)
    : "0";

  // Compute most frequent diet
  const dietFrequencies: { [key: string]: number } = {};
  plans.forEach(p => {
    dietFrequencies[p.dietType] = (dietFrequencies[p.dietType] || 0) + 1;
  });
  let favoriteDiet = "None";
  let maxCount = 0;
  Object.entries(dietFrequencies).forEach(([diet, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteDiet = diet;
    }
  });

  // Calculate busy-day ratio
  const busyCount = plans.filter(p => p.busyDay).length;
  const busyRatio = plansCount > 0 
    ? Math.round((busyCount / plansCount) * 100) 
    : 0;

  // Compute dynamic water target based on latest activityLevel and work schedule
  const latestPlan = plans[0];
  const activityLevel = latestPlan?.activityLevel || "Moderately Active";
  const busyDay = latestPlan?.busyDay !== undefined ? latestPlan.busyDay : false;
  const workSchedule = latestPlan?.workSchedule || "None/Flexible";

  // Base hydration matching biological baseline
  let waterTargetMl = 2000;
  if (activityLevel === "Lightly Active") {
    waterTargetMl = 2400;
  } else if (activityLevel === "Moderately Active") {
    waterTargetMl = 2800;
  } else if (activityLevel === "Highly Active") {
    waterTargetMl = 3200;
  }

  // Adding hydration booster from schedule complexity
  if (busyDay) {
    waterTargetMl += 400; // Multi-tasking running around drains reserves
  }

  const lowerSchedule = workSchedule.toLowerCase();
  if (
    lowerSchedule.includes("commute") || 
    lowerSchedule.includes("12 hour") || 
    lowerSchedule.includes("10 hour") || 
    lowerSchedule.includes("long") || 
    lowerSchedule.includes("night") ||
    lowerSchedule.includes("physical")
  ) {
    waterTargetMl += 200; // Stress / high-exposure commutes require water support
  }

  const progressPercent = Math.min(100, Math.round((waterIntakeMl / waterTargetMl) * 100));
  const targetCups = Math.round(waterTargetMl / 250);
  const currentCups = (waterIntakeMl / 250).toFixed(1);

  // Render bento statistics cards
  const stats = [
    {
      label: "Plans Automated",
      value: plansCount,
      change: `AI generated plans`,
      icon: <Utensils className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/10 to-teal-500/5",
      borderColor: "border-emerald-500/10"
    },
    {
      label: "Avg Daily Budget",
      value: `$${averageBudget}`,
      change: `${plansCount > 0 ? "Optimized ingredients" : "No budget inputs yet"}`,
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      color: "from-teal-500/10 to-emerald-500/5",
      borderColor: "border-teal-500/10"
    },
    {
      label: "Preferred Core Diet",
      value: favoriteDiet,
      change: maxCount > 0 ? `Selected ${maxCount} time(s)` : "Configure options",
      icon: <Scale className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/10 to-emerald-500/5",
      borderColor: "border-emerald-500/10"
    },
    {
      label: "Schedule Hardened",
      value: `${busyRatio}%`,
      change: `${busyCount} busy days automated`,
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/10 to-emerald-600/5",
      borderColor: "border-emerald-500/10"
    }
  ];

  return (
    <div className="space-y-5 mb-8">
      {/* 4 Cards Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} flex items-center justify-between shadow-lg backdrop-blur-md hover:border-emerald-500/20 transition duration-300`}
          >
            <div className="space-y-1.5 overflow-hidden">
              <span className="text-xs font-medium text-slate-400 block tracking-tight truncate">{stat.label}</span>
              <h3 className="font-display font-bold text-2xl text-slate-100 truncate">{stat.value}</h3>
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-emerald-500/5 shadow-inner">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Hydration Tracker Block */}
      <div className="glass-panel p-5 md:p-6 rounded-2xl border border-sky-500/10 bg-gradient-to-br from-sky-950/10 through-slate-900/5 to-slate-950/30 shadow-xl relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-4 border-b border-slate-900/40 relative z-10">
          <div>
            <span className="text-[10px] font-mono font-semibold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 animate-pulse text-sky-400 fill-sky-400/25" />
              Dynamic Hydration Tracker
            </span>
            <h2 className="font-display font-bold text-lg text-slate-100 mt-1 flex items-center gap-2">
              Daily Water Target: <span className="text-sky-400">{waterTargetMl} ml</span> <span className="text-sm font-normal text-slate-400">({targetCups} cups)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Water baseline of <span className="text-slate-300 font-medium">{activityLevel}</span> calculated: {busyDay ? "+400ml busy bonus" : "Standard activity target"} {lowerSchedule.includes("commute") || lowerSchedule.includes("12 hour") || lowerSchedule.includes("10 hour") ? "+200ml schedule boost" : ""}.
            </p>
          </div>

          {/* Quick Stats bubble */}
          <div className="bg-slate-950/40 border border-slate-900 px-4 py-2.5 rounded-xl text-center flex gap-4 min-w-[200px] justify-around">
            <div>
              <span className="text-[9px] font-mono text-slate-500 block uppercase">Intake</span>
              <span className="text-sm font-bold text-sky-400">{waterIntakeMl} <span className="text-[10px] text-slate-400 font-normal">ml</span></span>
            </div>
            <div className="border-r border-slate-900" />
            <div>
              <span className="text-[9px] font-mono text-slate-500 block uppercase">Cups</span>
              <span className="text-sm font-bold text-sky-400">{currentCups} <span className="text-[10px] text-slate-400 font-normal">/ {targetCups}</span></span>
            </div>
          </div>
        </div>

        {/* Action Controls & Progress Bar */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
          
          {/* Progress Bar & percentage */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium font-mono">My Daily Log</span>
              <span className="text-sky-400 font-semibold">{progressPercent}% Achieved</span>
            </div>
            <div className="h-3.5 w-full bg-slate-950/80 border border-slate-900 rounded-full overflow-hidden p-[2px]">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-sky-600 via-sky-400 to-teal-400 shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick tracker buttons */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2">
            {/* Decrease button */}
            <button
              title="Remove 250ml (1 cup)"
              onClick={() => onUpdateWater(waterIntakeMl - 250)}
              disabled={waterIntakeMl <= 0}
              className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-red-500/10 border border-slate-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* +1 Cup button */}
            <button
              onClick={() => onUpdateWater(waterIntakeMl + 250)}
              className="px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Cup <span className="text-[10px] opacity-70">(250ml)</span></span>
            </button>

            {/* +2 Cups/Bottle button */}
            <button
              onClick={() => onUpdateWater(waterIntakeMl + 500)}
              className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+Bottle <span className="text-[10px] opacity-70">(500ml)</span></span>
            </button>

            {/* Reset button */}
            <button
              title="Reset today's hydration"
              onClick={() => {
                if (confirm("Are you sure you want to reset your water hydration log?")) {
                  onUpdateWater(0);
                }
              }}
              disabled={waterIntakeMl === 0}
              className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-700 text-slate-500 hover:text-slate-300 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
