"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import {
  createVisitorInfo,
  getPresetTransactions,
} from "@/lib/database.action";
import { useToast } from "@/hooks/use-toast";
import { PresetTransaction, Social, VisitorData } from "@/typings";
import { socials } from "@/lib/data";

export function Header() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [transactions, setTransactions] = useState<PresetTransaction[]>([]);
  const [selectedSocial, setSelectedSocial] = useState<Social | null>(null);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        let visitorId = localStorage.getItem("visitorId");

        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("visitorId", visitorId);
        }

        const deviceType =
          /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(
            navigator.userAgent
          )
            ? "mobile"
            : "desktop";

        const visitorData: VisitorData = {
          timestamp: new Date().toISOString(),
          pathname: pathname,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          deviceType: deviceType,
          language: navigator.language,
          visitorId: visitorId,
        };

        await createVisitorInfo(visitorData);
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };

    trackVisit();
  }, [pathname]);

  const getCurrentTransactionIndex = useCallback(() => {
    const startTime = new Date("2024-01-01T00:00:00Z").getTime();
    const currentTime = new Date().getTime();
    const timeElapsed = currentTime - startTime;
    const cycleLength = 120000;

    const totalCycles = Math.floor(timeElapsed / cycleLength);

    if (transactions.length > 0) {
      return totalCycles % transactions.length;
    }
    return 0;
  }, [transactions]);

  const showNotification = useCallback(() => {
    if (transactions.length === 0) return;

    const currentIndex = getCurrentTransactionIndex();
    const transaction = transactions[currentIndex];
    const message = `${transaction.address} just received ${transaction.amount} USDT`;

    toast({
      description: message,
    });
  }, [transactions, getCurrentTransactionIndex, toast]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const result = await getPresetTransactions();
      if (result.success && result.data) {
        setTransactions(result.data);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length === 0) return;

    showNotification();

    const now = new Date().getTime();
    const msUntilNext = 120000 - (now % 120000);

    const initialTimeout = setTimeout(() => {
      showNotification();

      const interval = setInterval(showNotification, 120000);
      return () => clearInterval(interval);
    }, msUntilNext);

    return () => clearTimeout(initialTimeout);
  }, [transactions, showNotification]);

  const handleSocialClick = (social: Social) => {
    if (selectedSocial?.id === social.id) {
      setSelectedSocial(null); // Close if clicking the same icon
    } else {
      setSelectedSocial(social); // Open new selection
    }
  };

  return (
    <header className="">
      <div className="bg-[#243039] text-center max-md:text-sm text-base py-2 px-4">
        🛠️ TypeScript libraries for Interaction with the Ethereum JSON RPC API
        on{" "}
        <Link href="https://github.com/web3/web3.js" className="text-blue-500">
          Github
        </Link>{" "}
        🛠️
      </div>

      <div>
        <div
          className="text-center bg-[#08a0dd] hover:bg-[#08a0dd]/70 py-2 px-4 cursor-pointer flex items-center justify-center"
          onClick={() => setShowReferral(!showReferral)}
        >
          <span>🔗Refer and earn up to $2000 in usdt 🔗</span>
          <IoIosArrowDown
            className={`ml-2 transform transition-transform duration-300 ${
              showReferral ? "rotate-180" : ""
            }`}
          />
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 bg-black`}
          style={{
            maxHeight: showReferral ? "500px" : "0",
            opacity: showReferral ? 1 : 0,
            transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
          }}
        >
          <div className="p-8">
            <div className="max-w-lg md:mx-auto overflow-x-auto">
              <ul className="flex items-center justify-between w-[30rem] min-w-max">
                {socials.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleSocialClick(item)}
                  >
                    <Image
                      src={item.src}
                      width={50}
                      height={50}
                      alt={item.label}
                      className={`size-10 ${
                        item.label === "More" || item.label === "X"
                          ? "relative bg-white rounded-[0.3rem]"
                          : ""
                      }`}
                    />
                    <span className="text-sm">{item.label}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`overflow-hidden transition-all duration-300 mt-6`}
                style={{
                  maxHeight: selectedSocial ? "500px" : "0",
                  opacity: selectedSocial ? 1 : 0,
                  transition:
                    "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
                }}
              >
                {selectedSocial && selectedSocial.content && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">
                        {selectedSocial.content.title}
                      </h2>
                      <button
                        onClick={() => setSelectedSocial(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    {selectedSocial.content.options.map((option, idx) => (
                      <div key={idx} className="mb-6">
                        <h3 className="font-semibold mb-2">{option.title}</h3>
                        <ol className="list-decimal pl-5">
                          {option.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="mb-2">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}

                    {selectedSocial.content.note && (
                      <div className="mt-4 p-3 bg-gray-100 rounded">
                        <p className="text-sm font-medium">
                          Note: {selectedSocial.content.note}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 font-sans text-base flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="Logo Image"
            className="size-10"
          />
          <div className="leading-none">
            <p>Web3</p>
            <p>Smart Contract Call</p>
          </div>
        </div>

        <div className="relative">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => setShowModal((prev) => !prev)}
          >
            <span>{pathname === "/" ? "Home" : "FAQs"}</span>
            <IoIosArrowDown className="size-5" />
          </div>

          {showModal && (
            <div className="absolute right-0 mt-2 bg-white text-black border rounded shadow-lg w-32">
              <ul>
                <li className="w-full hover:bg-gray-200">
                  <Link
                    href="/"
                    className={`block px-4 py-2 ${
                      pathname === "/" ? "text-[#08a0dd]" : ""
                    }`}
                    onClick={() => setShowModal(false)}
                  >
                    Home
                  </Link>
                </li>
                <li className="w-full hover:bg-gray-200">
                  <Link
                    href="/faqs"
                    className={`block px-4 py-2 ${
                      pathname === "/faqs" ? "text-[#08a0dd]" : ""
                    }`}
                    onClick={() => setShowModal(false)}
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
