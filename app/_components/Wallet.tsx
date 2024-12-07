"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";

export function Wallet() {
  const [amount, setAmount] = useState<string>(""); // Typed as string for input
  const [walletAddress, setWalletAddress] = useState<string>(""); // Wallet address as string
  const [connected, setConnected] = useState<boolean>(false); // Boolean for connection state
  const [balance, setBalance] = useState<string>(""); // Wallet balance

  const connectWallet = async (): Promise<void> => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      // Request wallet connection
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      setConnected(true);
      console.log("Connected Account:", accounts[0]);

      // Check the balance on BSC
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletBalance = await signer.getBalance();
      setBalance(ethers.utils.formatEther(walletBalance)); // Convert balance to BNB
      console.log(
        "Wallet Balance (BNB):",
        ethers.utils.formatEther(walletBalance)
      );
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const sendBNB = async (): Promise<void> => {
    if (!connected || !amount) {
      alert("Please connect your wallet and enter an amount.");
      return;
    }

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const recipientAddress = prompt("Enter recipient address:");
        if (!recipientAddress || !ethers.utils.isAddress(recipientAddress)) {
          alert("Invalid recipient address.");
          return;
        }

        const transactionValue = ethers.utils.parseEther(amount); // Convert amount to wei
        const gasPrice = await provider.getGasPrice();
        const estimatedGasCost = gasPrice.mul(21000); // Estimate gas cost for the transaction

        if (
          transactionValue
            .add(estimatedGasCost)
            .gt(ethers.utils.parseEther(balance))
        ) {
          alert("Insufficient funds to cover transaction and gas fees.");
          console.log(walletAddress);
          return;
        }

        // Proceed with the transaction
        const transaction = {
          to: recipientAddress,
          value: transactionValue,
        };

        const txResponse = await signer.sendTransaction(transaction);
        console.log("Transaction sent. Hash:", txResponse.hash);

        // Wait for the transaction to be confirmed
        await txResponse.wait();
        alert(`Transaction successful! Hash: ${txResponse.hash}`);
      } else {
        console.error("MetaMask is not installed!");
      }
    } catch (error) {
      console.error("Failed to send BNB:", error);
      alert("Transaction failed. Check the console for more details.");
    }
  };

  return (
    <div className="grid grid-cols-1 items-center space-y-4">
      <div className="flex flex-col bg-white/10 p-4 rounded-3xl">
        <div className="flex items-center flex-col">
          <Image
            src="/metamask.webp"
            width={500}
            height={500}
            alt="MetaMask"
            className="size-24 rounded-lg"
          />
          <span className="mb-4">MetaMask</span>
        </div>

        {!connected ? (
          <button
            type="button"
            onClick={connectWallet}
            className="text-base bg-[#08a0dd] px-4 py-2 rounded-lg"
          >
            Connect to BSC
          </button>
        ) : (
          <span className="text-green-500 text-base">
            Connected <br />
            Balance: {balance} BNB
          </span>
        )}

        <input
          type="number"
          placeholder="Enter amount (BNB)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-4 px-2 py-1 rounded-lg text-black outline-none"
        />

        <button
          type="button"
          onClick={sendBNB}
          className="text-base bg-[#08a0dd] px-4 py-2 rounded-lg mt-2"
        >
          Send BNB
        </button>
      </div>
    </div>
  );
}
