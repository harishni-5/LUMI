"use client";

import { Sidebar } from "./components/sidebar";
import { MainContent } from "./components/main-content";
import { TopBar } from "./components/top-bar";
import { MobileNav } from "./components/mobile-nav";
import { useState, useEffect } from "react";
import { TabType } from "./components/sidebar";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && ["overview", "meetings", "tasks", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation - Only visible on small screens */}
      <div className="lg:hidden">
        <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <TopBar />
          <main className="container mx-auto px-4 py-6">
            <MainContent initialActiveTab={activeTab} onTabChange={handleTabChange} />
          </main>
        </div>
      </div>
    </div>
  );
}
  