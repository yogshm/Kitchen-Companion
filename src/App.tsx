import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  writeBatch,
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./lib/firebase";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import StatsBanner from "./components/StatsBanner";
import PlanForm from "./components/PlanForm";
import PlanResultView from "./components/PlanResultView";
import HistoryList from "./components/HistoryList";
import ProfileView from "./components/ProfileView";

import { 
  MealPlan, 
  MealPlanFormValues, 
  AIResponse,
  UserProfile 
} from "./types";
import { 
  Flame, 
  Sparkles, 
  UtensilsCrossed, 
  Clock, 
  Info, 
  History, 
  ArrowRight, 
  Zap, 
  Check, 
  AlertCircle 
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [showAuthMode, setShowAuthMode] = useState<"landing" | "login" | "register">("landing");

  // Sidebar section tracking
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  // Plan generation database states
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [currentPlanResponse, setCurrentPlanResponse] = useState<AIResponse | null>(null);
  const [currentPlanFormValues, setCurrentPlanFormValues] = useState<MealPlanFormValues | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeResultsId, setActiveResultsId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string>("");

  // Hydration progress tracking
  const [todayWaterMl, setTodayWaterMl] = useState<number>(0);

  // Sync today's active water intake log from Firestore
  useEffect(() => {
    if (!user) {
      setTodayWaterMl(0);
      return;
    }

    if (user.uid === "demo-guest-user") {
      const todayStr = new Date().toISOString().split("T")[0];
      const saved = localStorage.getItem(`water_log_${todayStr}`);
      setTodayWaterMl(saved ? parseInt(saved, 10) : 0);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "water_logs", `${user.uid}_${todayStr}`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTodayWaterMl(docSnap.data().amountMl || 0);
      } else {
        setTodayWaterMl(0);
      }
    }, (error) => {
      console.error("Firestore loaded water logs error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Update today's active water logs in real-time
  const handleUpdateWater = async (newAmountMl: number) => {
    if (!user) return;
    const amount = Math.max(0, newAmountMl);

    if (user.uid === "demo-guest-user") {
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`water_log_${todayStr}`, amount.toString());
      setTodayWaterMl(amount);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "water_logs", `${user.uid}_${todayStr}`);
    
    try {
      await setDoc(docRef, {
        userId: user.uid,
        date: todayStr,
        amountMl: amount,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      console.error("Firestore updated water logs error:", err);
    }
  };

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setShowAuthMode("landing"); // Logged in
      } else {
        // Automatically default to the fully customized guest chef session to bypass login gating entirely!
        setUser({
          uid: "demo-guest-user",
          displayName: "Guest Chef",
          email: "guest@culina.ai"
        } as any);
        setShowAuthMode("landing");
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore meal plans for the current logged-in user
  useEffect(() => {
    if (!user) {
      setPlans([]);
      return;
    }

    if (user.uid === "demo-guest-user") {
      const savedPlans = localStorage.getItem("demo_meal_plans");
      if (savedPlans) {
        try {
          setPlans(JSON.parse(savedPlans));
        } catch {
          setPlans([]);
        }
      } else {
        setPlans([]);
      }
      return;
    }

    // In-memory sort prevents complex index requirement problems
    const q = query(
      collection(db, "meal_plans"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansList: any[] = [];
      snapshot.forEach((doc) => {
        plansList.push({ id: doc.id, ...doc.data() });
      });
      // Sort desc by createdAt
      plansList.sort((a, b) => {
        const aSec = a.createdAt?.seconds || 0;
        const bSec = b.createdAt?.seconds || 0;
        return bSec - aSec;
      });
      setPlans(plansList);
    }, (error) => {
      console.error("Firestore loading error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle main plan generation calling our custom back-end API route
  const handleGeneratePlan = async (formValues: MealPlanFormValues) => {
    setIsGenerating(true);
    setGenerationError("");
    setCurrentPlanResponse(null);
    setCurrentPlanFormValues(formValues);
    setIsSaved(false);
    setActiveResultsId(null);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.error || "Generation endpoint returned non-ok status");
      }

      const parsedResponse: AIResponse = await response.json();
      setCurrentPlanResponse(parsedResponse);
    } catch (err: any) {
      console.error("Error generating plan:", err);
      setGenerationError(err.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current dynamic plan to database
  const handleSavePlan = async () => {
    if (!user || !currentPlanResponse || !currentPlanFormValues) return;
    setIsSaving(true);
    try {
      const planPayload = {
        userId: user.uid,
        peopleCount: currentPlanFormValues.peopleCount,
        workSchedule: currentPlanFormValues.workSchedule,
        busyDay: currentPlanFormValues.busyDay,
        availableTime: currentPlanFormValues.availableTime,
        budget: currentPlanFormValues.budget,
        dietType: currentPlanFormValues.dietType,
        activityLevel: currentPlanFormValues.activityLevel || "Moderately Active",
        ingredients: currentPlanFormValues.ingredients,
        likes: currentPlanFormValues.likes,
        dislikes: currentPlanFormValues.dislikes,
        aiResponse: currentPlanResponse,
        createdAt: user.uid === "demo-guest-user" 
          ? { seconds: Math.floor(Date.now() / 1000) } 
          : serverTimestamp()
      };

      if (user.uid === "demo-guest-user") {
        const savedPlans = localStorage.getItem("demo_meal_plans");
        const list = savedPlans ? JSON.parse(savedPlans) : [];
        const newId = `demo_plan_${Date.now()}`;
        const newPlan = { id: newId, ...planPayload };
        const updated = [newPlan, ...list];
        localStorage.setItem("demo_meal_plans", JSON.stringify(updated));
        setPlans(updated);
        setActiveResultsId(newId);
        setIsSaved(true);
        return;
      }

      const docRef = await addDoc(collection(db, "meal_plans"), planPayload);
      setActiveResultsId(docRef.id);
      setIsSaved(true);
    } catch (err: any) {
      console.error("Failed to save meal plan", err);
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete plan doc from Firestore
  const handleDeletePlan = async (id: string) => {
    try {
      if (user?.uid === "demo-guest-user") {
        const savedPlans = localStorage.getItem("demo_meal_plans");
        const list = savedPlans ? JSON.parse(savedPlans) : [];
        const updated = list.filter((p: any) => p.id !== id);
        localStorage.setItem("demo_meal_plans", JSON.stringify(updated));
        setPlans(updated);
        if (activeResultsId === id) {
          setIsSaved(false);
          setActiveResultsId(null);
        }
        return;
      }

      await deleteDoc(doc(db, "meal_plans", id));
      if (activeResultsId === id) {
        setIsSaved(false);
        setActiveResultsId(null);
      }
    } catch (err: any) {
      console.error("Deletion issue", err);
      alert("Failed to delete record: " + err.message);
    }
  };

  // Clear entire user meal plans in a single batch
  const handleClearAllPlans = async () => {
    if (!user) return;
    try {
      if (user.uid === "demo-guest-user") {
        localStorage.removeItem("demo_meal_plans");
        setPlans([]);
        setIsSaved(false);
        setActiveResultsId(null);
        setCurrentPlanResponse(null);
        setCurrentPlanFormValues(null);
        return;
      }

      const q = query(collection(db, "meal_plans"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setIsSaved(false);
      setActiveResultsId(null);
      setCurrentPlanResponse(null);
      setCurrentPlanFormValues(null);
    } catch (err: any) {
      console.error("History purge issue", err);
      alert("Failure to purge records: " + err.message);
    }
  };

  // Select item from history to view cards
  const handleSelectHistoryPlan = (plan: MealPlan) => {
    setCurrentPlanResponse(plan.aiResponse);
    setCurrentPlanFormValues({
      peopleCount: plan.peopleCount,
      workSchedule: plan.workSchedule,
      busyDay: plan.busyDay,
      availableTime: plan.availableTime,
      budget: plan.budget,
      dietType: plan.dietType,
      ingredients: plan.ingredients,
      likes: plan.likes || "",
      dislikes: plan.dislikes || ""
    });
    setActiveResultsId(plan.id);
    setIsSaved(true);
    setActiveSection("generate"); // Go straight to visual cards
  };

  // Logout / Reset Workspace hook
  const handleLogout = async () => {
    try {
      if (user?.uid === "demo-guest-user") {
        const todayStr = new Date().toISOString().split("T")[0];
        localStorage.removeItem("demo_meal_plans");
        localStorage.removeItem(`water_log_${todayStr}`);
        setPlans([]);
        setTodayWaterMl(0);
        setCurrentPlanResponse(null);
        setCurrentPlanFormValues(null);
        setIsSaved(false);
        setActiveSection("dashboard");
        return;
      }
      await signOut(auth);
      // Reset full local states
      setCurrentPlanResponse(null);
      setCurrentPlanFormValues(null);
      setIsSaved(false);
      setActiveSection("dashboard");
    } catch (err) {
      console.error("Logout or Reset issue", err);
    }
  };

  // Render auth screens first if checking
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center animate-pulse">
            <Flame className="w-8 h-8 text-emerald-400 fill-emerald-400/20" />
          </div>
          <p className="text-sm font-mono text-emerald-500">Connecting to Cloud Ingress...</p>
        </div>
      </div>
    );
  }

  // Not logged in routing
  if (!user) {
    if (showAuthMode === "landing") {
      return <LandingPage onGetStarted={(mode) => setShowAuthMode(mode)} />;
    } else {
      return (
        <AuthPage 
          initialMode={showAuthMode === "login" ? "login" : "register"}
          onSuccess={() => setShowAuthMode("landing")}
          onBackToLanding={() => setShowAuthMode("landing")}
          onGuestLogin={() => {
            setUser({
              uid: "demo-guest-user",
              displayName: "Demo Chef",
              email: "demo@cooking.assistant"
            } as any);
            setShowAuthMode("landing");
          }}
        />
      );
    }
  }

  // AUTHENTICATED SYSTEM LAYOUT
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      {/* Background Decorative highlights */}
      <div className="absolute top-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[25%] w-[450px] h-[450px] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none" />

      {/* Persistent / Responsive Side Navigation */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Board Wrapper */}
      <div className="flex-1 min-h-screen overflow-y-auto px-6 py-6 md:py-8 flex flex-col max-w-7xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {activeSection === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              {/* Profile greeting banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-900/60 gap-4">
                <div>
                  <h1 className="font-display font-extrabold text-2xl tracking-tight text-slate-100">
                    Hello, Chef <span className="text-emerald-400 font-bold">{user?.displayName || "Automation Intern"}</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Orchestrate meal-prep efficiency, financial stats, and custom grocery items flawlessly.
                  </p>
                </div>
                <button
                  id="btn-fast-plan"
                  onClick={() => {
                    setCurrentPlanResponse(null);
                    setCurrentPlanFormValues(null);
                    setIsSaved(false);
                    setActiveSection("generate");
                  }}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/15 cursor-pointer leading-tight flex items-center gap-1.5"
                >
                  <PlusCircleIcon className="w-4 h-4" /> Assemble Food Plan
                </button>
              </div>

              {/* Bento statistic deck */}
              <StatsBanner 
                plans={plans} 
                waterIntakeMl={todayWaterMl} 
                onUpdateWater={handleUpdateWater} 
              />

              {/* Dashboard sections (Split grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Interactive Quick Actions & Schedules tips */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Sched optimization info widget */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-900/80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <h3 className="font-display font-bold text-sm tracking-wide text-slate-200 mb-2.5 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400 animate-pulse" /> Weekly Meal Plan Prep Strategies
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Save cooking hours by consolidating veggie preps and marination on Sunday evenings. 
                      Let the AI read your daily work hours to compute when you have maximum cooking windows!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                        <span className="font-semibold text-emerald-400 text-xs block mb-0.5">Budget Saving Loop:</span>
                        Map available spices (like rosemary, garlic powder) before buying fresh duplicates.
                      </div>
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                        <span className="font-semibold text-emerald-400 text-xs block mb-0.5">Time Compression:</span>
                        Select high protein diet configurations to automatically prompt quick stir-fry plans.
                      </div>
                    </div>
                  </div>

                  {/* Bullet Quick Tips */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-900/80">
                    <h3 className="font-display font-bold text-sm tracking-wide text-slate-200 mb-3.5 flex items-center gap-2">
                      <UtensilsCrossed className="w-4.5 h-4.5 text-emerald-400" /> Dynamic Prompting Logic
                    </h3>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Specify all random pantry vegetables (even stems or roots) to receive maximum waste-saving substitutes.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Work commutes can be added directly into the schedule text field to coordinate slower crockpot preps.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Exported PDFs contain clear checkout boxes representing a real-life physical grocery sheet!</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Recent plans tracker */}
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-slate-200 text-sm tracking-wide flex items-center justify-between">
                    <span>Recent Saved Plans</span>
                    <button 
                      onClick={() => setActiveSection("history")}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      View All &rarr;
                    </button>
                  </h4>
                  {plans.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/10 text-xs text-slate-500">
                      Saved plans appear here dynamically. Click Assemble to map your first plan!
                    </div>
                  ) : (
                    plans.slice(0, 3).map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => handleSelectHistoryPlan(plan)}
                        className="p-4 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition duration-200"
                      >
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition">
                            {plan.dietType} Plan ({plan.peopleCount} {plan.peopleCount === 1 ? "Person" : "People"})
                          </h5>
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5 flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-emerald-500/60" /> {plan.availableTime} mins | Budget ${plan.budget}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition duration-200" />
                      </div>
                    ))
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {activeSection === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Show Loader Spinner during async wait */}
              {isGenerating && (
                <div className="min-h-[400px] flex flex-col items-center justify-center space-y-5">
                  <div className="relative">
                    {/* Ring loading */}
                    <div className="w-14 h-14 border-2 border-emerald-500/10 border-t-emerald-400 rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <h3 className="font-display font-medium text-slate-200 text-sm">Consulting Culinary Brain...</h3>
                    <p className="text-[11px] font-mono text-emerald-500/80 uppercase tracking-widest animate-pulse">Running advanced matrix-plan optimization</p>
                  </div>
                </div>
              )}

              {/* Show errors gracefully if prompt execution fails */}
              {generationError && (
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-rose-300 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-display font-semibold text-sm">Orchestration Error</h4>
                      <p className="text-xs text-slate-400 leading-normal mt-1">{generationError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGenerationError("")}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-emerald-500 hover:text-slate-950 text-red-300 font-mono text-[10px] rounded border border-red-500/30 transition uppercase font-bold"
                  >
                    Reset Form
                  </button>
                </div>
              )}

              {/* Show Input plan form if result or loader is silent */}
              {!isGenerating && !currentPlanResponse && !generationError && (
                <PlanForm 
                  onSubmit={handleGeneratePlan} 
                  loading={isGenerating} 
                />
              )}

              {/* Show Output Visual Card deck if result loaded successfully */}
              {!isGenerating && currentPlanResponse && !generationError && (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setCurrentPlanResponse(null);
                      setCurrentPlanFormValues(null);
                      setIsSaved(false);
                      setActiveResultsId(null);
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-400 transition"
                  >
                    &larr; Start New Meal Configuration Form
                  </button>
                  <PlanResultView
                    response={currentPlanResponse}
                    planFormValues={currentPlanFormValues || undefined}
                    onSave={handleSavePlan}
                    onRegenerate={() => {
                      if (currentPlanFormValues) {
                        handleGeneratePlan(currentPlanFormValues);
                      }
                    }}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeSection === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <HistoryList 
                plans={plans} 
                onSelect={handleSelectHistoryPlan} 
                onDelete={handleDeletePlan} 
              />
            </motion.div>
          )}

          {activeSection === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileView 
                user={user} 
                savedPlansCount={plans.length} 
                onClearAllPlans={handleClearAllPlans} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Icon fallbacks for lucide matching typescript build standard
function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
