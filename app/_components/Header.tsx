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
  trackReferral,
} from "@/lib/database.action";
import { useToast } from "@/hooks/use-toast";
import { PresetTransaction, Social, VisitorData } from "@/typings";
import { socials } from "@/lib/data";
import { ethers } from "ethers";
import { sendMail } from "@/lib/mail.action";
import { navLinks } from "@/lib/data";

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

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    inMetaMaskBrowser: false,
  });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Get referral wallet from URL params
  const getRefWallet = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("wallet") || "";
  };

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setDeviceInfo({
      isMobile: /iphone|ipad|ipod|android|mobile/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      inMetaMaskBrowser: userAgent.includes("metamask"),
    });

    checkWalletConnection();
  }, []);

  const handleMetaMaskRedirect = () => {
    if (deviceInfo.isAndroid || deviceInfo.isIOS) {
      const refWallet = getRefWallet();
      const baseUrl = "web3smartcalls.com";
      const fullUrl = refWallet ? `${baseUrl}?wallet=${refWallet}` : baseUrl;
      const encodedUrl = encodeURIComponent(`https://${fullUrl}`);

      const deepLink = deviceInfo.isAndroid
        ? `metamask://browseto/${encodedUrl}`
        : `https://metamask.app.link/dapp/${fullUrl}`;

      window.location.href = deepLink;

      // Fallback to MetaMask download page after delay
      // setTimeout(() => {
      //   window.location.href = "https://metamask.io/download/";
      // }, 1500);
    }
  };

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
    if (!window.ethereum?.isMetaMask && deviceInfo.isMobile) {
      handleMetaMaskRedirect();
      return;
    }

    if (!window.ethereum?.isMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
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
          deviceLanguage: navigator.language,
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

    // Get referrer wallet from URL
    const urlParams = new URLSearchParams(window.location.search);
    const referrerWallet = urlParams.get("wallet");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Starting email submission process");

      // Submit email to database first
      const emailResult = await submitEmail({
        walletAddress,
        email,
        timestamp: new Date().toISOString(),
      });

      if (!emailResult.success) {
        throw new Error(emailResult.msg || "Failed to submit email");
      }

      console.log("Email submitted successfully");

      // Process referral if applicable
      if (referrerWallet) {
        console.log("Processing referral");
        const referralResult = await trackReferral({
          referrerWallet,
          referredWallet: walletAddress,
          referredEmail: email,
          timestamp: new Date().toISOString(),
        });

        if (!referralResult.success) {
          console.warn("Referral tracking failed:", referralResult.msg);
        }
      }

      // Send both emails in parallel for better performance
      await Promise.all([
        // Admin notification
        sendMail({
          to: "smartcalls3web@gmail.com",
          subject: "New User Sign-Up Notification",
          body: `
            <p>Hey Admin,</p>
            <p>This email: ${email} just added their email to this address: ${walletAddress} on Web3SmartCalls.</p>
            <p>Best regards,<br>
            The Web3SmartCalls System</p>
          `,
        }).catch((error) => {
          console.error("Failed to send admin notification:", error);
          throw error;
        }),

        // Welcome email
        sendMail({
          to: email,
          subject: "Welcome to Web3SmartCalls!",
          body: `
            <p>Hi,</p>
        
            <p>Your email has been successfully added to Web3SmartCalls!</p>
            <p>Welcome to the community as we explore the exciting world of Web3 technology.</p>
        
            <p>You can join the contract pool by deploying the smart contract and earn up to $2000 USDT.</p>
        
            <p>You can also earn rewards by inviting others using your unique referral link.</p>
        
            <p><strong>Important Notes:</strong></p>
            <p>- Only users who add valid email addresses and deployed the smart contract will be qualified as a referral.</p>
            <p>- Bot referrals, auto-clicking, self-referrals, or any fraudulent activity will disqualify your address from further benefits.</p>
        
            <p>Together, we'll innovate and grow the Web3SmartCalls community with your support!</p>
        
            <p>Best regards,<br>
            The Web3SmartCalls Team</p>
          `,
        }).catch((error) => {
          console.error("Failed to send welcome email:", error);
          throw error;
        }),
      ]);

      console.log("All emails sent successfully");
      setEmailSubmitted(true);
      window.alert("Email successfully registered!");
    } catch (error) {
      console.error("Error in handleEmailSubmit:", error);
      setEmailError(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting email"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="">
      <div className="bg-[#243039] text-center max-md:text-sm text-base py-2 px-8">
        🛠️ Ethereum JSON RPC API on{" "}
        <Link href="https://github.com/web3/web3.js" className="text-blue-500">
          Github
        </Link>{" "}
        🛠️
      </div>

      {/* <div className="bg-[#2A3A47] text-center py-2 px-4">
        <Link
          href="/tutorial"
          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
        >
          Issues deploying the contract?{" "}
          <span className="underline">Click here!</span>
        </Link>
      </div> */}

      <div>
        <div
          className="text-center bg-gradient-to-r from-[#08a0dd] to-[#065d80] hover:from-[#065d80] hover:to-[#08a0dd] transition-all duration-300 py-2 px-3 cursor-pointer flex items-center justify-center group relative overflow-hidden"
          onClick={() => setShowReferral(!showReferral)}
        >
          <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
            <svg
              className="w-3 h-3 text-yellow-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.49 9.6a2.48 2.48 0 0 0-2.23-1.62h-4.57L12.25 3.5a2.49 2.49 0 0 0-4.5 0L6.31 8H1.74a2.49 2.49 0 0 0-1.45 4.5l3.68 2.7-1.44 4.42a2.49 2.49 0 0 0 3.83 2.78L10 19.73l3.64 2.65a2.49 2.49 0 0 0 3.83-2.78l-1.44-4.42 3.68-2.7a2.49 2.49 0 0 0 .78-2.88Z" />
            </svg>
            <span className="text-[10px] font-bold text-white">NEW</span>
          </div>

          <span className="mx-2 text-white font-medium text-xs">
            Refer and earn up to $2000 in usdt
          </span>

          <IoIosArrowDown
            className={`w-3 h-3 transform transition-transform duration-300 text-white ${
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
              {walletAddress && (
                <p className="max-md:text-xs text-sm text-red-500 font-semibold">
                  ⓘ Referred users must provide a valid email address to be
                  eligible.
                </p>
              )}

              <div className="text-base max-md:text-sm">
                {walletAddress ? (
                  <div className="flex items-center justify-between space-x-4">
                    <div
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
                    </div>
                    <div
                      className="cursor-pointer border hover:text-black border-white  rounded-lg text-base hover:bg-white transition-all duration-300 "
                      onClick={() => handleSocialClick(socials[0])}
                    >
                      <div className="max-md:text-sm text-base px-4 py-2 rounded-md">
                        Share
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer flex justify-center text-black text-center"
                    onClick={connectWallet}
                  >
                    <div className="text-sm px-4 bg-white py-2 hover:bg-white/70 rounded-md">
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </div>
                  </div>
                )}
              </div>

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
                    <p className="max-md:text-xs text-sm text-red-500 font-semibold">
                      {emailError}
                    </p>
                  )}
                  <p className="max-md:text-xs text-sm text-red-500 font-semibold">
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
                      className="py-2 px-4 border border-white rounded-lg cursor-pointer hover:bg-white transition-all duration-300 hover:text-black max-md:text-sm text-base"
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
            <span>
              {pathname === "/"
                ? "Home"
                : pathname === "/faqs"
                ? "FAQs"
                : "Tutorial"}
            </span>
            <IoIosArrowDown className="size-5" />
          </div>

          {showModal && (
            <div className="absolute right-0 mt-2 bg-white text-black border rounded shadow-lg w-32 z-50">
              <ul>
                {navLinks.map((link) => (
                  <li key={link.href} className="w-full hover:bg-gray-200">
                    <Link
                      href={link.href}
                      className={`block px-4 py-2 ${
                        pathname === link.href ? "text-[#08a0dd]" : ""
                      }`}
                      onClick={() => setShowModal(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
