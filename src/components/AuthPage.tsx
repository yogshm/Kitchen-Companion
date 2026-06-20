import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Flame, Mail, Lock, User, AlertCircle, Calendar, Sparkles } from "lucide-react";

interface AuthPageProps {
  initialMode: "login" | "register";
  onSuccess: () => void;
  onBackToLanding: () => void;
  onGuestLogin?: () => void;
}

export default function AuthPage({ initialMode, onSuccess, onBackToLanding, onGuestLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === "login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isAuthBlocked, setIsAuthBlocked] = useState<boolean>(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsAuthBlocked(false);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Validation
        if (!name.trim()) {
          throw new Error("Full name is required.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set User Name in Auth Profile
        await updateProfile(user, { displayName: name });

        // Save User Details in Firestore profiles
        await setDoc(doc(db, "profiles", user.uid), {
          id: user.uid,
          name: name,
          email: email,
          createdAt: serverTimestamp()
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth process error:", err);
      let friendlyMessage = err.message;
      if (err.code === "auth/operation-not-allowed") {
        friendlyMessage = "Firebase Authentication error: 'Email/Password' provider is not enabled on this project. Please activate it in the Firebase Console (Authentication > Sign-in method tab).";
        setIsAuthBlocked(true);
      } else if (err.code === "auth/user-not-found") {
        friendlyMessage = "No user found with this email.";
      } else if (err.code === "auth/wrong-password") {
        friendlyMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email address is already registered.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Invalid email format.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      {/* Background Decorative Rings/Blobs */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-emerald-600/5 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <button 
            onClick={onBackToLanding}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/20 mb-6 transition"
          >
            <Flame className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
            <span className="font-display font-medium text-sm text-slate-300 group-hover:text-emerald-400 transition">
              AI Cooking Assistant
            </span>
          </button>
          <h2 className="font-display text-3xl font-extrabold text-center tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-400 text-sm text-center mt-1">
            {isLogin ? "Unlock personalized schedules & grocery plans" : "Start your AI culinary adventure today"}
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 glow-emerald-sm">
          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex flex-col gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-200">Authentication Setup Required</p>
                  <p className="text-xs leading-relaxed text-slate-300">{error}</p>
                </div>
              </div>

              {isAuthBlocked && onGuestLogin && (
                <div className="pt-2.5 border-t border-rose-500/10 space-y-2">
                  <p className="text-xs text-slate-400">
                    Want to bypass this configuration in a single click? Log in to our local real-time sandbox client:
                  </p>
                  <button
                    id="btn-guest-login-error-bypass"
                    type="button"
                    onClick={onGuestLogin}
                    className="w-full py-2.5 bg-gradient-to-r from-sky-500/15 to-teal-500/15 hover:from-sky-500/30 hover:to-teal-500/30 border border-sky-500/40 hover:border-sky-500/60 text-sky-300 hover:text-sky-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                    <span>Enter Instantly (Demo Guest Mode)</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    id="input-name"
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full glass-input pl-11 pr-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono tracking-wider uppercase text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="input-email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full glass-input pl-11 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-400">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => setError("For security reasons, password resetting is handled via OAuth or official email flows. Email mbyogesh07@gmail.com for help.")}
                    className="text-xs text-emerald-400 hover:underline hover:text-emerald-300 transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  id="input-password"
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  {isLogin ? "Sign In" : "Register Now"}
                </>
              )}
            </button>
          </form>

          {/* Toggle Block */}
          <div className="mt-6 pt-6 border-t border-slate-900 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
            <button
              id="btn-auth-toggle"
              type="button"
              disabled={loading}
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-emerald-400 font-medium hover:underline hover:text-emerald-300 transition"
            >
              {isLogin ? "Create one here" : "Sign in here"}
            </button>
          </div>

          {onGuestLogin && (
            <div className="mt-4 pt-4 border-t border-slate-900/60">
              <button
                id="btn-guest-login"
                type="button"
                onClick={onGuestLogin}
                className="w-full py-3 bg-gradient-to-r from-sky-500/10 to-teal-500/10 hover:from-sky-500/20 hover:to-teal-500/20 border border-sky-500/30 hover:border-sky-500/50 text-sky-300 hover:text-sky-200 font-medium rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Bypass / Continue as Demo Guest Chef</span>
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={onBackToLanding}
          className="mt-6 w-full text-center text-xs text-slate-500 hover:text-emerald-400 transition"
        >
          &larr; Back to Landing Page
        </button>
      </motion.div>
    </div>
  );
}
