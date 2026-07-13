import React, { useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";

export default function TopNav() {
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

  // Format initials
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  // Format role
  const roleDisplay = user?.role ? user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'User';

  return (
    <header className="h-[72px] bg-card border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
      {/* Left section - Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search shipments, vehicles, drivers..." 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      {/* Right section - Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <ModeToggle />

        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">{user?.name || 'Loading...'}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20">{roleDisplay}</Badge>
          </div>
          <Avatar className="w-9 h-9 border border-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
