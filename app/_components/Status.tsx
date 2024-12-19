"use client";

import { useEffect, useState } from "react";
import { MdOnlinePrediction } from "react-icons/md";
import { getCurrentStats } from "@/lib/database.action";

interface UserStats {
  activeUsers: number;
  totalRegistered: number;
  timestamp: string;
}

export default function Status() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    activeUsers: 0,
    totalRegistered: 0,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    let isMounted = true;

    const updateStats = async () => {
      if (!isMounted) return;

      try {
        const result = await getCurrentStats();
        if (result.success && result.data && isMounted) {
          // Type guard to ensure data has the correct shape
          const statsData: UserStats = {
            activeUsers: result.data.activeUsers,
            totalRegistered: result.data.totalRegistered,
            timestamp: result.data.timestamp,
          };

          setStats(statsData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial update
    updateStats();

    // Calculate time until next 4-minute interval
    const now = new Date();
    const secondsUntilNextInterval =
      240 - ((now.getMinutes() % 4) * 60 + now.getSeconds());
    const millisecondsUntilNextInterval = secondsUntilNextInterval * 1000;

    // Initial setTimeout to sync with 4-minute intervals
    const initialTimeout = setTimeout(() => {
      updateStats();
      // Start the regular interval after initial sync
      const interval = setInterval(updateStats, 240000);
      return () => clearInterval(interval);
    }, millisecondsUntilNextInterval);

    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
    };
  }, []);
  return (
    <div className="px-8 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MdOnlinePrediction className="text-emerald-500 w-5 h-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-200 text-sm font-medium">
              Online Users
            </span>
            <div className="flex items-center">
              {isLoading ? (
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <span className="text-emerald-500 text-xs">
                  {stats.activeUsers.toLocaleString()} active now
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-gray-200 text-sm font-medium">Total Users</span>
          {isLoading ? (
            <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <span className="text-gray-400 text-xs">
              {stats.totalRegistered.toLocaleString()} registered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
