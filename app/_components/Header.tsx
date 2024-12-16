"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import {
  checkEmailExists,
  createVisitorInfo,
  getPresetTransactions,
  submitEmail,
} from "@/lib/database.action";
import { useToast } from "@/hooks/use-toast";
import { PresetTransaction, Social, VisitorData } from "@/typings";
import { socials } from "@/lib/data";
import { ethers } from "ethers";

export function Header() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [transactions, setTransactions] = useState<PresetTransaction[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    checkWalletConnection();
  }, []);

  // useEffect to check email status when wallet is connected
  useEffect(() => {
    const checkEmail = async () => {
      if (walletAddress) {
        const result = await checkEmailExists(walletAddress);
        if (result.success && result.exists) {
          setEmailSubmitted(true);
        }
      }
    };

    checkEmail();
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    if (window.ethereum?.isMetaMask) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum?.isMetaMask) {
      window.alert("Please install MetaMask to connect your wallet");
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);

      window.alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

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

  const handleSocialClick = async (social: Social) => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    const baseUrl = window.location.href.split("?")[0];
    const shareUrl = `${baseUrl}?wallet=${walletAddress}`;

    if (social.label === "Share") {
      // Check if running on Android
      const isAndroid = /Android/i.test(navigator.userAgent);

      if (navigator.share && isAndroid) {
        try {
          // For Android, only share the URL and text
          await navigator.share({
            text: `Hey,\n\nYou've got to check this out! I've been diving into the Web3 community and already made a few hundred dollars—it's legit. If you join through my link, we both earn, and trust me, you don't want to miss out on this.\n\nHere's the link: ${shareUrl}\n\nYou're going to be so glad you jumped in!`,
          });
          return;
        } catch (error) {
          console.log("Error sharing:", error);
        }
      } else if (navigator.share) {
        try {
          // For other platforms, use full share data
          await navigator.share({
            title: "Join me in Web3 Smart Calls!",
            text: `Hey,\n\nYou've got to check this out! I've been diving into the Web3 community and already made a few hundred dollars—it's legit. If you join through my link, we both earn, and trust me, you don't want to miss out on this.\n\nHere's the link: ${shareUrl}\n\nYou're going to be so glad you jumped in!`,
          });
          return;
        } catch (error) {
          console.log("Error sharing:", error);
        }
      }

      // Fallback for when Web Share API is not available
      try {
        await navigator.clipboard.writeText(
          `Hey,\n\nYou've got to check this out! I've been diving into the Web3 community and already made a few hundred dollars—it's legit. If you join through my link, we both earn, and trust me, you don't want to miss out on this.\n\nHere's the link: ${shareUrl}\n\nYou're going to be so glad you jumped in!`
        );
        alert("Message copied to clipboard!");
      } catch (error) {
        console.log("Clipboard error:", error);
      }
      return;
    }

    if (social.getShareUrl) {
      const shareText = `Hey,\n\nYou've got to check this out! I've been diving into the Web3 community and already made a few hundred dollars—it's legit. If you join through my link, we both earn, and trust me, you don't want to miss out on this.\n\nYou're going to be so glad you jumped in!`;
      const shareLink = social.getShareUrl(shareUrl, shareText);
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  // function to handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitEmail({
        walletAddress,
        email,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        setEmailSubmitted(true);
        window.alert("Email successfully registered!");
      } else {
        setEmailError(result.msg || "Failed to submit email");
      }
    } catch (error) {
      setEmailError("An error occurred while submitting email");
      console.log("An error occurred while submitting email", error);
    } finally {
      setIsSubmitting(false);
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
            maxHeight: showReferral ? "1000px" : "0",
            opacity: showReferral ? 1 : 0,
            transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
          }}
        >
          <div className="py-4 px-8">
            <div className="md:max-w-md md:mx-auto overflow-x-auto space-y-4">
              <ul className="flex items-center justify-between space-x-4 text-base max-md:text-sm">
                {walletAddress ? (
                  <>
                    <li
                      className="flex-1 py-2 px-4 rounded-xl bg-[#090C17] border border-white/20 cursor-pointer hover:bg-[#131729] overflow-hidden whitespace-nowrap text-ellipsis min-w-0"
                      onClick={() => {
                        const fullUrl = `https://web3smartcalls.com?wallet=${walletAddress}`;
                        navigator.clipboard
                          .writeText(fullUrl)
                          .then(() => alert("Link copied."))
                          .catch((err) =>
                            console.error("Failed to copy:", err)
                          );
                      }}
                      title="Click to copy link"
                    >
                      https://web3smartcalls.com?wallet={walletAddress}
                    </li>
                    <li
                      className="cursor-pointer border hover:text-black border-white  rounded-lg text-base hover:bg-white"
                      onClick={() => handleSocialClick(socials[0])}
                    >
                      <div className="max-md:text-sm text-base px-4 py-2 rounded-md">
                        Share
                      </div>
                    </li>
                  </>
                ) : (
                  <li
                    className="cursor-pointer bg-white text-black rounded-lg hover:bg-white/70"
                    onClick={connectWallet}
                  >
                    <div className="text-sm px-4 py-2 rounded-md">
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </div>
                  </li>
                )}
              </ul>

              {/* Email Input */}
              {walletAddress && !emailSubmitted && (
                <form className="space-y-2" onSubmit={handleEmailSubmit}>
                  <div className="space-y-2">
                    <input
                      type="email"
                      title="email"
                      className="w-full py-2 px-4 bg-black rounded-lg outline-none border border-white/20 focus:border-white"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-lg cursor-pointer bg-white text-black hover:bg-white/90 max-md:text-sm text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Add Email"}
                    </button>
                  </div>
                  {emailError && (
                    <p className="max-md:text-xs text-sm text-red-500">
                      {emailError}
                    </p>
                  )}
                  <p className="max-md:text-xs text-sm text-red-500">
                    ⓘ Provide a valid email address to receive referral
                    notifications.
                    <br />ⓘ Referrals won&apos;t be credited without an email
                    address.
                  </p>
                </form>
              )}

              {walletAddress && (
                <div className="bg-[#090C17] border border-white/20 rounded-xl py-2 px-4 break-words">
                  <p className="max-md:text-sm text-base">
                    Hey,
                    <br /> You&apos;ve got to check this out! I&apos;ve been
                    diving into the Web3 community and already made a few
                    hundred dollars—it&apos;s legit. If you join through my
                    link, we both earn, and trust me, you don&apos;t want to
                    miss out on this.
                    <br />
                    Here&apos;s the link:{" "}
                    <Link
                      href={`https://web3smartcalls.com/?wallet=${walletAddress}`}
                      className="text-blue-500 break-words"
                    >
                      https://web3smartcalls.com?wallet={walletAddress}
                    </Link>
                    <br />
                    You&apos;re going to be so glad you jumped in!
                  </p>

                  <div className="flex justify-end">
                    <div
                      className="py-2 px-4 border border-white rounded-lg cursor-pointer hover:bg-white hover:text-black max-md:text-sm text-base"
                      onClick={() => {
                        const fullMessage = `Hey,\n\nYou've got to check this out! I've been diving into the Web3 community and already made a few hundred dollars—it's legit. If you join through my link, we both earn, and trust me, you don't want to miss out on this.\n\nHere's the link: https://web3smartcalls.com?wallet=${walletAddress}\n\nYou're going to be so glad you jumped in!`;

                        navigator.clipboard
                          .writeText(fullMessage)
                          .then(() => alert("Message copied."))
                          .catch((err) =>
                            console.error("Failed to copy:", err)
                          );
                      }}
                    >
                      Copy
                    </div>
                  </div>
                </div>
              )}
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
