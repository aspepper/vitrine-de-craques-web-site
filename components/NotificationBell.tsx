"use client";

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(3); // Dummy data

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount}
        </span>
      )}
    </Button>
  );
}
