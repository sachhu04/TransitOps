import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Route, 
  Settings, 
  Wrench, 
  Fuel, 
  BarChart3,
  Map,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fleet", href: "/fleet", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Trips", href: "/trips", icon: Route },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Fuel & Expenses", href: "/fuel", icon: Fuel },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string; role: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const roleDisplay = user?.role ? user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'User';

  return (
    <div className="hidden md:flex flex-col w-[260px] bg-card border-r border-border">
      {/* Brand */}
      <div className="h-[72px] flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Map className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">TransitOps</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
        {navigation.map((item) => {
          // RBAC Logic
          if (user?.role === 'FLEET_MANAGER' && ['Trips', 'Fuel & Expenses'].includes(item.name)) return null;
          if (user?.role === 'DISPATCHER' && ['Drivers', 'Fuel & Expenses', 'Analytics', 'Settings', 'Maintenance'].includes(item.name)) return null;
          if (user?.role === 'SAFETY_OFFICER' && ['Fleet', 'Fuel & Expenses', 'Analytics', 'Settings'].includes(item.name)) return null;
          if (user?.role === 'FINANCIAL_ANALYST' && ['Trips', 'Drivers', 'Settings'].includes(item.name)) return null;

          const isActive = router.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User / Footer area */}
      <div className="p-4 border-t border-border flex justify-between items-center">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-full bg-muted flex items-center justify-center border border-border text-primary font-medium">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name || 'Loading...'}</span>
            <span className="text-xs text-muted-foreground truncate">{roleDisplay}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
