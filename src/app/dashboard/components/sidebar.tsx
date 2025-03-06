"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileAudio,
  CheckSquare,
  Settings,
  BarChart2,
  Users,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart2 },
  { name: "Meetings", href: "/dashboard/meetings", icon: FileAudio },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4">
      {/* Logo */}
      <div className="flex items-center px-3 py-4">
        <span className="text-xl font-bold">IRIS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">john@example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
} 