"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon

export function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>(""); // Wallet address
  const [transactionStatus, setTransactionStatus] = useState<string>(""); // Status message
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [errorMessage, setErrorMessage] = useState<string>(""); // Error message

  // Fixed values for transaction
  const FIXED_AMOUNT = "0.01"; // Fixed amount in ETH/BNB
  const RECIPIENT_ADDRESS = "0xYourRecipientAddressHere"; // Replace with your recipient address

  const handleSmartCall = async (): Promise<void> => {
    setIsLoading(true); // Start loading spinner
    setTransactionStatus(""); // Clear status message
    setErrorMessage(""); // Clear error message

    try {
      if (!window.ethereum) {
        setErrorMessage(
          "MetaMask is not installed. Please install it to proceed."
        );
        setIsLoading(false);
        return;
      }

      // Request wallet connection
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];
      setWalletAddress(connectedWallet);
      console.log("Connected Account:", connectedWallet);

      // Create a provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Prepare the transaction
      const transactionValue = ethers.utils.parseEther(FIXED_AMOUNT); // Convert to wei

      const gasPrice = await provider.getGasPrice();
      const estimatedGasCost = gasPrice.mul(21000); // Estimate gas cost for a basic transaction

      const balanceInWei = await signer.getBalance();
      if (transactionValue.add(estimatedGasCost).gt(balanceInWei)) {
        setErrorMessage(
          "Insufficient funds to cover the transaction and gas fees."
        );
        setIsLoading(false);
        return;
      }

      // Execute the transaction
      setTransactionStatus("Sending transaction...");
      const txResponse = await signer.sendTransaction({
        to: RECIPIENT_ADDRESS,
        value: transactionValue,
      });

      console.log("Transaction sent. Hash:", txResponse.hash);

      // Wait for confirmation
      await txResponse.wait();
      setTransactionStatus(`Transaction successful! Hash: ${txResponse.hash}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage(
        "Transaction failed. Please check the console for details."
      );
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col p-6 rounded-xl items-center space-y-4 bg-[#090C17] w-full ring-1 ring-white/20">
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

        <button
          onClick={handleSmartCall}
          className="bg-[#08a0dd] text-white px-4 py-2 rounded-lg hover:bg-[#08a0dd]/70 flex items-center justify-center"
          disabled={isLoading} // Disable button during loading
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
