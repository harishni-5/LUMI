"use client";

import { Bell, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

export function TopBar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center px-4">
        {/* Search */}
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings, tasks..."
              className="pl-8"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
          </Button>

          {/* User Menu */}
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <span className="hidden sm:inline-block">John Doe</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 