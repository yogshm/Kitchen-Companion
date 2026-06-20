import React from "react";
import { 
  Flame, 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  user: FirebaseUser | null;
  onLogout: () => void;
}

export default function Sidebar({ activeSection, setActiveSection, user, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "generate", label: "Generate Plan", icon: <PlusCircle className="w-5 h-5" /> },
    { id: "history", label: "History Log", icon: <History className="w-5 h-5" /> },
    { id: "profile", label: "My Profile", icon: <User className="w-5 h-5" /> },
  ];

  const handleNav = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile top bar representing header */}
      <div className="md:hidden w-full flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-900/60 backdrop-blur-md relative z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
          </div>
          <span className="font-display font-medium text-md text-slate-100">Cooking AI</span>
        </div>
        <button 
          id="btn-mobile-menu"
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar background drawer for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Actual Sidebar layout - persistent on desktop, drawers on mobile */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 glass-panel border-r border-slate-900/80 p-6 flex flex-col justify-between z-35 transition-transform duration-300 md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center glow-emerald-sm">
              <Flame className="w-5.5 h-5.5 text-emerald-400 fill-emerald-400/10" />
            </div>
            <span className="font-display font-bold text-lg tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Kitchen Companion
            </span>
          </div>

          {/* User profile brief */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center font-display font-bold text-sm">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || "Chef Intern"}</h4>
              <p className="text-[10px] font-mono text-emerald-500 uppercase flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Prompt Cadet
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`btn-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 cursor-pointer
                    ${active 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 glow-emerald-sm" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"}
                  `}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-4">
          <div className="text-[10px] font-mono text-slate-500 bg-slate-900/30 p-2 text-center rounded border border-slate-900/20">
            PromptWars build 1.1.2
          </div>
          <button
            id="btn-logout"
            onClick={() => {
              if (user?.uid === "demo-guest-user") {
                if (confirm("Are you sure you want to reset your local workspace? This will clear all local meal plans and hydration logs.")) {
                  onLogout();
                }
              } else {
                onLogout();
              }
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-rose-400 border border-transparent hover:border-red-500/10 transition duration-200 cursor-pointer text-left"
          >
            <LogOut className="w-5 h-5 text-slate-500" />
            <span>{user?.uid === "demo-guest-user" ? "Reset Session" : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
