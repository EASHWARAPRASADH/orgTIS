/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { OrgChart } from "./components/OrgChart";
import { AdminPanel } from "./components/AdminPanel";
import { INITIAL_EMPLOYEES } from "./constants";
import { Employee } from "./types";
import { LayoutDashboard, Settings, Users, Share2, Download, Info, Menu, X, LogIn, LogOut, ShieldCheck, Database, Mail } from "lucide-react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<"chart" | "admin">("chart");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Authentication
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time data sync and seeding
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('displayOrder', { ascending: true });

      if (error) {
        console.error("Error fetching employees:", error);
        return;
      }

      // Check if core hierarchy is present (Seeding logic)
      const hasCore = data && data.length > 0 && 
                      data.some(emp => emp.id === "arun") && 
                      data.some(emp => emp.id === "padmavathy");

      if (!data || data.length === 0 || !hasCore) {
        // Seed initial data if empty
        setEmployees(INITIAL_EMPLOYEES);
        
        try {
          const { error: seedError } = await supabase
            .from('employees')
            .upsert(INITIAL_EMPLOYEES);
          
          if (seedError) throw seedError;
          console.log("Database seeded successfully");
        } catch (e) {
          console.error("Auto-seeding failed:", e);
        }
      } else {
        setEmployees(data as Employee[]);
      }
      setIsLoading(false);
    };

    fetchEmployees();

    // Subscribe to changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        () => {
          fetchEmployees(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddEmployee = async (newEmp: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .insert([newEmp]);
      if (error) throw error;
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee. Make sure you are an authorized admin.");
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updatedEmp)
        .eq('id', updatedEmp.id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee.");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee? This will move their direct reports to the top level.")) {
      return;
    }

    try {
      console.log(`Attempting to delete employee with ID: ${id}`);
      
      // Handle children by moving them to top level in a single efficient query
      const { error: updateError } = await supabase
        .from('employees')
        .update({ managerId: null })
        .eq('managerId', id);
      
      if (updateError) {
        console.error("Error updating children:", updateError);
        throw updateError;
      }

      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error("Error deleting from Supabase:", deleteError);
        throw deleteError;
      }
      
      console.log("Delete successful");
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      alert(`Failed to delete employee: ${error.message || "Unknown error"}`);
    }
  };

  const handleReorderEmployees = async (newEmployees: Employee[]) => {
    try {
      // Supabase upsert handles bulk updates if IDs match
      const { error } = await supabase
        .from('employees')
        .upsert(newEmployees.map(emp => ({
          id: emp.id,
          displayOrder: emp.displayOrder
        })));
      if (error) throw error;
    } catch (error) {
      console.error("Error reordering employees:", error);
    }
  };

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setEmail("");
      setPassword("");
      setIsLoginModalOpen(false);
    } catch (error: any) {
      console.error("Login Error:", error);
      setLoginError(error.message || "Invalid email or password");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const ADMIN_EMAILS = [
    "itsupport@technosprint.net"
  ];

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const isMobile = windowWidth <= 768;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Initializing ProOrg...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col items-center"
        >
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 p-4">
              <img 
                src="/assets/logo.png" 
                alt="Branding" 
                className="w-full h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              ProOrg Chart
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Technosprint Info Solutions</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Security Password</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg text-center"
              >
                {loginError}
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
            >
              Sign In to View
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 w-full text-center">
            <p className="text-[10px] text-gray-400 font-medium">
              Restricted Corporate Portal • TechnoSprint Info Solutions © 2026
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-gray-900/30 z-40 md:hidden touch-none"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? 260 : (isSidebarOpen ? 260 : 80),
          x: isMobile && !isSidebarOpen ? -260 : 0
        }}
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col h-full shadow-xl md:shadow-sm transition-all duration-300 ease-in-out z-50 overflow-hidden",
          isMobile ? "fixed inset-y-0 left-0" : "relative shrink-0"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-3 transition-opacity duration-300", !isSidebarOpen && !isMobile && "opacity-0 invisible w-0")}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <img 
                src="/assets/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-gray-900 whitespace-nowrap">ProOrg</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors shrink-0"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Org Chart" 
            active={activeTab === "chart"} 
            onClick={() => setActiveTab("chart")}
            collapsed={!isSidebarOpen}
          />
          {isAdmin && (
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Admin Panel" 
              active={activeTab === "admin"} 
              onClick={() => setActiveTab("admin")}
              collapsed={!isSidebarOpen}
            />
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100 space-y-4">
          {user ? (
            <div className={cn("flex items-center gap-3 p-2 bg-gray-50 rounded-xl", !isSidebarOpen && "justify-center bg-transparent")}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                {user.email?.[0].toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                  <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:text-red-600">Sign Out</button>
                </div>
              )}
            </div>
          )}

          <div className={cn("bg-blue-50 rounded-xl p-4 transition-all duration-300", !isSidebarOpen && "p-2 bg-transparent")}>
            {isSidebarOpen ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Cloud Sync</span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  All changes are saved in real-time to the cloud database.
                </p>
              </>
            ) : (
              <div className="flex justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Company Logo */}
            <img 
              src="/assets/logo.png" 
              alt="Technosprint Logo" 
              className="h-10 md:h-12 w-auto object-contain drop-shadow-sm"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />

            <div className="hidden md:flex flex-col">
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
                ProOrg Chart
              </h2>
              <p className="text-[9px] font-bold text-gray-400 tracking-[0.1em] uppercase">Technosprint Info Solutions</p>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block mx-2" />
            
            <span className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {employees.length} Members
            </span>
            {isAdmin && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 hidden md:block" />
                Admin
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export PDF</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white shadow-sm" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative">
            <OrgChart employees={employees} />
          </div>
          
          <AnimatePresence>
            {activeTab === "admin" && isAdmin && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 right-0 z-30"
              >
                <AdminPanel 
                  employees={employees}
                  onAdd={handleAddEmployee}
                  onUpdate={handleUpdateEmployee}
                  onDelete={handleDeleteEmployee}
                  onReorder={handleReorderEmployees}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

function NavItem({ icon, label, active, onClick, collapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
        collapsed && "justify-center px-0"
      )}
    >
      <div className={cn("transition-transform duration-200 group-hover:scale-110", active && "scale-110")}>
        {icon}
      </div>
      {!collapsed && (
        <span className={cn("text-sm font-bold tracking-tight transition-opacity duration-200", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")}>
          {label}
        </span>
      )}
      {active && !collapsed && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
        />
      )}
      {collapsed && active && (
        <div className="absolute right-0 w-1 h-6 bg-blue-600 rounded-l-full" />
      )}
    </button>
  );
}
