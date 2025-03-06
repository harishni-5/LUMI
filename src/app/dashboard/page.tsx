import { Sidebar } from "./components/sidebar";
import { MainContent } from "./components/main-content";
import { TopBar } from "./components/top-bar";
import { MobileNav } from "./components/mobile-nav";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation - Only visible on small screens */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <TopBar />
          <main className="container mx-auto px-4 py-6">
            <MainContent />
          </main>
        </div>
      </div>
    </div>
  );
}
  