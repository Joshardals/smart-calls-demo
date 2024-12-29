"use client";

import { useEffect, useState } from "react";
import { MdOnlinePrediction } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { getCurrentStats } from "@/lib/database.action";

interface UserStats {
  activeUsers: number;
  totalRegistered: number;
  timestamp: string;
  lastRegistrationUpdate: string;
}

interface StatsResponse {
  success: boolean;
  data?: UserStats;
  msg?: string;
}

export default function Status() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    activeUsers: 0,
    totalRegistered: 0,
    timestamp: new Date().toISOString(),
    lastRegistrationUpdate: new Date().toISOString(),
  });

  useEffect(() => {
    let isMounted = true;

    const updateStats = async () => {
      if (!isMounted) return;

      try {
        const result: StatsResponse = await getCurrentStats();
        if (result.success && result.data && isMounted) {
          setStats(result.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute -right-7 -translate-x-1/2 -top-8 bg-[#111111] border border-[#08a0dd]/20 rounded-t-lg px-4 py-2 group transition-all duration-300 hover:bg-[#161616] flex items-center space-x-3`}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MdOnlinePrediction className="text-emerald-500 w-4 h-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
          {!isLoading && (
            <span className="text-emerald-500 text-xs font-medium">
              {formatNumber(stats.activeUsers)}
            </span>
          )}
        </div>
        <IoIosArrowDown
          className={`w-4 h-4 text-white transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Stats Panel */}
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-[#111111]/80 backdrop-blur-md border-t border-[#08a0dd]/20">
          <div className="max-w-lg mx-auto px-8 py-3">
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
                <span className="text-gray-200 text-sm font-medium">
                  Registered Users
                </span>
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
        </div>
      </div>
    </div>
  );
}
