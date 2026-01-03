import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/badge';

interface SubscriptionTimerProps {
  subscriptionEndDate: string | null | undefined;
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export function SubscriptionTimer({ 
  subscriptionEndDate, 
  variant = 'default',
  className = '' 
}: SubscriptionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    years: number;
    months: number;
    days: number;
    hours: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!subscriptionEndDate) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const endDate = new Date(subscriptionEndDate);
      const now = new Date();
      
      if (endDate <= now) {
        setTimeRemaining({ years: 0, months: 0, days: 0, hours: 0, expired: true });
        return;
      }

      // Start with years
      let years = endDate.getFullYear() - now.getFullYear();
      let tempDate = new Date(now.getTime());
      tempDate.setFullYear(now.getFullYear() + years);
      
      if (tempDate > endDate) {
        years--;
        tempDate.setFullYear(now.getFullYear() + years);
      }

      // Calculate months
      let months = 0;
      const testMonth = new Date(tempDate);
      testMonth.setMonth(testMonth.getMonth() + 1);
      while (testMonth <= endDate) {
        months++;
        tempDate.setMonth(tempDate.getMonth() + 1);
        testMonth.setMonth(testMonth.getMonth() + 1);
      }

      // Calculate days
      let days = 0;
      const testDay = new Date(tempDate);
      testDay.setDate(testDay.getDate() + 1);
      while (testDay <= endDate) {
        days++;
        tempDate.setDate(tempDate.getDate() + 1);
        testDay.setDate(testDay.getDate() + 1);
      }

      // Calculate hours (remaining time difference)
      const hours = Math.floor((endDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60));

      setTimeRemaining({ years, months, days, hours, expired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [subscriptionEndDate]);

  if (!subscriptionEndDate || !timeRemaining) {
    return null;
  }

  if (timeRemaining.expired) {
    return (
      <Badge 
        variant="destructive" 
        className={`flex items-center gap-1 ${className}`}
      >
        <Clock className="h-3 w-3" />
        <span>Expired</span>
      </Badge>
    );
  }

  const formatTime = () => {
    const parts: string[] = [];
    if (timeRemaining.years > 0) parts.push(`${timeRemaining.years}y`);
    if (timeRemaining.months > 0) parts.push(`${timeRemaining.months}mo`);
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0 || parts.length === 0) parts.push(`${timeRemaining.hours}h`);
    return parts.join(' ');
  };

  const getVariant = () => {
    const totalDays = timeRemaining.years * 365 + timeRemaining.months * 30 + timeRemaining.days;
    if (totalDays < 30) return "destructive";
    if (totalDays < 90) return "secondary";
    return "default";
  };

  if (variant === 'compact') {
    return (
      <Badge 
        variant={getVariant()}
        className={`flex items-center gap-1 text-xs ${className}`}
      >
        <Clock className="h-3 w-3" />
        <span>{formatTime()}</span>
      </Badge>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`flex flex-col items-end ${className}`}>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <Clock className="h-3 w-3" />
          <span>Subscription</span>
        </div>
        <Badge 
          variant={getVariant()}
          className="text-xs"
        >
          {formatTime()}
        </Badge>
      </div>
    );
  }

  // Default variant - full display
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Badge variant={getVariant()}>
          {formatTime()}
        </Badge>
        <span className="text-sm text-muted-foreground">remaining</span>
      </div>
    </div>
  );
}

