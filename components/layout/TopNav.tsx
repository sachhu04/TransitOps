import React, { useEffect, useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandMenu } from '@/components/ui/command-menu';

export default function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser));
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.length);
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (e) {
        console.error('Failed to fetch notifications');
      }
    };

    fetchNotifications();
  }, []);

  const handleResolve = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notifications/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (e) {
      console.error('Failed to resolve notification');
    }
  };

  // Format initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  // Format role
  const roleDisplay = user?.role
    ? user.role
        .replace('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : 'User';

  return (
    <header className="h-[72px] bg-card backdrop-blur-xl border-b border-white/10 dark:border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
      {/* Left section - Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative max-w-md w-full hidden sm:block">
          <CommandMenu />
        </div>
      </div>

      {/* Right section - Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <Popover>
          <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 bg-popover border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                {unreadCount} New
              </Badge>
            </div>
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden flex flex-col">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h5
                          className={`text-sm font-medium ${notif.type === 'warning' ? 'text-orange-500' : 'text-foreground'}`}
                        >
                          {notif.title}
                        </h5>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] shrink-0"
                          onClick={() => handleResolve(notif.id)}
                        >
                          {notif.id.startsWith('driver-')
                            ? 'Renew'
                            : notif.id.startsWith('vehicle-')
                              ? 'Available'
                              : 'Dismiss'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ModeToggle />

        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">{user?.name || 'Loading...'}</span>
            <Badge
              variant="secondary"
              className="text-[10px] h-4 px-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20"
            >
              {roleDisplay}
            </Badge>
          </div>
          <Avatar className="w-9 h-9 border border-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
