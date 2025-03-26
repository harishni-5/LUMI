"use client";

import { Sidebar } from "./components/sidebar";
import { TabContent } from "./components/dashboard-components";
import { TopBar } from "./components/top-bar";
import { useState, useEffect } from "react";
import { TabType } from "./components/sidebar";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userRole, setUserRole] = useState<'admin' | 'faculty' | 'student'>('faculty');
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && ["overview", "exams", "questions", "students", "results", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Get user role from URL param (for demo purposes)
    const role = searchParams.get("role");
    if (role && ["admin", "faculty", "student"].includes(role)) {
      setUserRole(role as 'admin' | 'faculty' | 'student');
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Role switcher for demo purposes
  const handleRoleChange = (role: 'admin' | 'faculty' | 'student') => {
    setUserRole(role);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Role Selector (for demo purposes) */}
      <div className="fixed top-2 right-2 z-50 bg-card shadow-md rounded-lg p-2 text-xs">
        <div className="flex items-center gap-2">
          <span>View as:</span>
          <select 
            value={userRole} 
            onChange={(e) => handleRoleChange(e.target.value as any)}
            className="border rounded px-1 py-0.5 text-xs"
          >
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          userRole={userRole} 
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <TopBar />
          <main className="container mx-auto px-4 py-6">
            <TabContent activeTab={activeTab} userRole={userRole} />
          </main>
        </div>
      </div>
    </div>
  );
}
  