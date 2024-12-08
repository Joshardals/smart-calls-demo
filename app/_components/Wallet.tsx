"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { FaSpinner } from "react-icons/fa";

export function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const FIXED_AMOUNT = "0.01";
  const RECIPIENT_ADDRESS = "0x1115550a82589552DFC1A86452D9B3761Bc97ff3";
  const BNB_CHAIN_ID = "0x38"; // BNB Chain Mainnet ID
  const DEEP_LINK = "https://metamask.app.link/dapp/smart-calls.vercel.app/";

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleSmartCall = async (): Promise<void> => {
    // If on mobile, redirect to deep link
    if (isMobile) {
      window.location.href = DEEP_LINK;
      return;
    }

    setIsLoading(true);
    setTransactionStatus("");
    setErrorMessage("");

    try {
      if (!window.ethereum) {
        setErrorMessage(
          "MetaMask is not installed. Please install it to proceed."
        );
        setIsLoading(false);
        return;
      }

      // Check current network
      const { chainId } = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (chainId !== BNB_CHAIN_ID) {
        // Request user to switch to BNB network
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BNB_CHAIN_ID }],
          });
        } catch (switchError: unknown) {
          if (
            typeof switchError === "object" &&
            switchError !== null &&
            "code" in switchError
          ) {
            const errorCode = (switchError as { code?: number }).code;
            if (errorCode === 4902) {
              setErrorMessage("Please add the BNB network to your wallet.");
            } else {
              setErrorMessage("Network switch failed. Please try again.");
            }
          } else {
            setErrorMessage("An unknown error occurred. Please try again.");
          }
          setIsLoading(false);
          return;
        }
      }

      // Request accounts
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];
      setWalletAddress(connectedWallet);
      console.log("Connected Account:", connectedWallet);

      // Prepare the transaction parameters
      const transactionParameters = {
        to: RECIPIENT_ADDRESS,
        from: connectedWallet,
        value: ethers.utils.parseEther(FIXED_AMOUNT)._hex,
      };

      // Send the transaction
      setTransactionStatus("Waiting for MetaMask...");
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      console.log("Transaction sent. Hash:", txHash);
      setTransactionStatus(`Transaction submitted! Hash: ${txHash}`);

      // Wait for confirmation
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.waitForTransaction(txHash);
      setTransactionStatus(`Transaction confirmed! Hash: ${txHash}`);
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setTransactionStatus(""); // Clear the waiting message on error
      setErrorMessage(
        error.message || "Transaction Failed, check the console for details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col p-6 rounded-xl items-center space-y-4 bg-[#090C17] w-full ring-1 ring-white/20 max-w-md">
        <Image
          src="/metamask.webp"
          width={100}
          height={100}
          alt="MetaMask"
          className="rounded-lg"
        />
        <h2 className="text-lg font-semibold">Smart Call</h2>

        {walletAddress && (
          <p className="text-green-600 text-base">
            Connected Wallet: {walletAddress.substring(0, 6)}...
            {walletAddress.slice(-4)}
          </p>
        )}

        <p className="text-sm text-orange-500 text-center">
          Note: Gas fees may vary based on network congestion. BNB Chain
          typically has lower fees.
        </p>

        <button
          onClick={handleSmartCall}
          className="bg-[#08a0dd] text-white text-base px-4 py-2 rounded-lg hover:bg-[#08a0dd]/70 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Processing...
            </>
          ) : (
            "Smart Call"
          )}
        </button>

        {transactionStatus && (
          <p className="text-sm text-green-500">{transactionStatus}</p>
        )}

        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
