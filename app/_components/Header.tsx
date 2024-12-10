"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { createVisitorInfo } from "@/lib/database.action";

interface VisitorData {
  timestamp: string;
  pathname: string;
  userAgent: string;
  referrer: string;
  screenResolution: string;
  deviceType: string;
  language: string;
  visitorId: string;
}

export function Header() {
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get existing visitor ID from localStorage
        let visitorId = localStorage.getItem("visitorId");

        // If no visitor ID exists, create one
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("visitorId", visitorId);
        }

        // Detect device type
        const deviceType =
          /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(
            navigator.userAgent
          )
            ? "mobile"
            : "desktop";

        // Prepare visitor data
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

        // Log analytics data
        console.log("Visitor ID:", visitorId);
        console.log("Visit Data:", visitorData);

        // Store visit in Database
        await createVisitorInfo(visitorData);

        // Store visit in localStorage
        const visits = JSON.parse(localStorage.getItem("visits") || "[]");
        visits.push(visitorData);
        localStorage.setItem("visits", JSON.stringify(visits));
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };

    trackVisit();
  }, [pathname]);

  return (
    <header>
      {/* Announcement Bar */}
      <div className="bg-[#243039] text-center max-md:text-sm text-base py-2 px-4">
        🛠️ TypeScript libraries for Interaction with the Ethereum JSON RPC API
        on{" "}
        <Link href="https://github.com/web3/web3.js" className="text-blue-500">
          Github
        </Link>{" "}
        🛠️
      </div>

      {/* Header */}
      <div className="px-8 py-4 font-sans text-base flex items-center justify-between">
        {/* Logo */}
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

        {/* Dropdown */}
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
