import { useEffect, useState } from "react";
import { MdOnlinePrediction } from "react-icons/md";
import { getActiveUsers, updateActiveUsers } from "@/lib/database.action";

export default function Status() {
  const [activeUsers, setActiveUsers] = useState(6000);
  const [registeredUsers, setRegisteredUsers] = useState(40000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
    const updateInterval = setInterval(simulateUserFluctuation, 240000);
    return () => clearInterval(updateInterval);
  }, []);

  const fetchActiveUsers = async () => {
    const data = await getActiveUsers();
    if (data) {
      setActiveUsers(data.total);
      setRegisteredUsers(data.registeredTotal || 40000);
      setIsLoading(false);
    }
  };

  const simulateUserFluctuation = async () => {
    const hour = new Date().getHours();
    
    const isWorkHours = hour >= 9 && hour <= 17;
    const isEveningHours = hour >= 18 && hour <= 23;
    const isLateNight = hour >= 0 && hour <= 4;

    let baseFluctuation;
    if (isWorkHours) {
      baseFluctuation = Math.random() * 0.08 - 0.02;
    } else if (isEveningHours) {
      baseFluctuation = Math.random() * 0.06 - 0.01;
    } else if (isLateNight) {
      baseFluctuation = Math.random() * 0.05 - 0.03;
    } else {
      baseFluctuation = Math.random() * 0.04 - 0.02;
    }

    const hasSpike = Math.random() < 0.05;
    if (hasSpike) {
      const spikeMultiplier = Math.random() * 0.15 + 0.05;
      baseFluctuation += spikeMultiplier;
    }

    // Modified baseline logic based on registered users
    const expectedActiveRate = 0.15; // Expect around 15% of registered users to be active
    const baselineUsers = Math.floor(registeredUsers * expectedActiveRate);
    const returnToBaseline = ((baselineUsers - activeUsers) / baselineUsers) * 0.1;
    baseFluctuation += returnToBaseline;

    const change = Math.floor(activeUsers * baseFluctuation);

    // Adjust minimum and maximum thresholds based on registered users
    const minUsers = Math.floor(registeredUsers * 0.02); // Minimum 2% of registered users
    const maxUsers = Math.floor(registeredUsers * 0.3); // Maximum 30% of registered users
    const newCount = Math.min(maxUsers, Math.max(minUsers, activeUsers + change));

    const noise = Math.floor(Math.random() * 21) - 10;
    const finalActiveCount = newCount + noise;

    // Simulate new registrations
    const hasNewRegistrations = Math.random() < 0.3; // 30% chance of new registrations
    if (hasNewRegistrations) {
      const newRegistrations = Math.floor(Math.random() * 20) + 1; // 1-20 new registrations
      setRegisteredUsers(prev => prev + newRegistrations);
    }

    setActiveUsers(finalActiveCount);

    // Update database with both active and registered users
    await updateActiveUsers(finalActiveCount, registeredUsers);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

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
              <span className="text-emerald-500 text-xs">
                {isLoading
                  ? "Loading..."
                  : `${formatNumber(activeUsers)} active now`}
              </span>
              {!isLoading && (
                <span className="ml-2 text-xs text-emerald-600 animate-pulse">
                  ●
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-gray-200 text-sm font-medium">Total Users</span>
          <span className="text-gray-400 text-xs">
            {formatNumber(registeredUsers)} registered
          </span>
        </div>
      </div>
    </div>
  );
}