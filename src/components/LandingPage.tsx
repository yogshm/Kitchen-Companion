import React from "react";
import { motion } from "motion/react";
import { 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  UtensilsCrossed, 
  Calculator, 
  Clock, 
  Layers, 
  ArrowRight,
  TrendingDown
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: (mode: "login" | "register") => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const features = [
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-emerald-400" />,
      title: "Personalized Meal Plans",
      description: "Generates step-by-step custom breakfast, lunch, and dinner plans matching your preferred diets.",
    },
    {
      icon: <Calculator className="w-6 h-6 text-emerald-400" />,
      title: "Smart Budget Tracking",
      description: "Analyzes feasibility of daily budgets relative to current ingredient prices and people count.",
    },
    {
      icon: <Clock className="w-6 h-6 text-emerald-400" />,
      title: "Schedule Auto-Optimization",
      description: "Aligns required cooking times with busy work schedules, guaranteeing stress-free preps.",
    },
    {
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      title: "Smart Substitions",
      description: "Missed something in your pantry? Get instant fallback suggestions for any missing ingredients.",
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-emerald-400" />,
      title: "No-Waste Grocery Lists",
      description: "Automatically aggregates required materials into a unified grocery shopping checklist.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      title: "Gemini AI Powered",
      description: "Tailored insights computed dynamically by high-speed models for realistic household cooking.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center glow-emerald-sm">
            <Flame className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            PromptWars Cooking
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            id="btn-login-nav"
            onClick={() => onGetStarted("login")} 
            className="px-5 py-2 text-sm font-medium hover:text-emerald-400 transition"
          >
            Login
          </button>
          <button 
            id="btn-register-nav"
            onClick={() => onGetStarted("register")} 
            className="px-5 py-2 text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition duration-300 shadow-emerald-500/5 glow-emerald-sm"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24 relative z-10 flex-1 flex flex-col justify-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs font-mono mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            PromptWars Challenge Edition v1.0
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            AI Cooking <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Assistant
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Generate personalized meal plans, grocery lists, substitutions and budget analysis instantly. Zero waste, zero stress.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <button
              id="btn-get-started-cta"
              onClick={() => onGetStarted("register")}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition duration-300 shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
            <button
              id="btn-learn-more-cta"
              onClick={() => {
                const el = document.getElementById("features-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium rounded-2xl transition duration-300"
            >
              Learn More
            </button>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            id="features-section"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 border-t border-slate-900 text-left"
          >
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 backdrop-blur-sm hover:border-emerald-500/30 transition duration-300 flex flex-col gap-3 group"
              >
                <div className="p-3 bg-emerald-500/5 w-fit rounded-xl border border-emerald-500/10 group-hover:bg-emerald-500/10 transition duration-300">
                  {feat.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-8 relative z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AI Cooking Assistant. Created for the PromptWars Challenge.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onGetStarted("login")} className="hover:text-emerald-400 transition">Privacy Policy</button>
            <button onClick={() => onGetStarted("login")} className="hover:text-emerald-400 transition">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
