// "use client";
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { ethers } from "ethers";
// import { FaSpinner } from "react-icons/fa";

// export function Wallet() {
//   const [walletAddress, setWalletAddress] = useState<string>("");
//   const [transactionStatus, setTransactionStatus] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [errorMessage, setErrorMessage] = useState<string>("");

//   const FIXED_AMOUNT = "0.01";
//   const RECIPIENT_ADDRESS = "0x1115550a82589552DFC1A86452D9B3761Bc97ff3";
//   const BNB_CHAIN_ID = "0x38";
//   const DAPP_URL = "smart-calls.vercel.app";

//   const [deviceInfo, setDeviceInfo] = useState({
//     isMobile: false,
//     isAndroid: false,
//     isIOS: false,
//     inMetaMaskBrowser: false,
//   });

//   useEffect(() => {
//     const userAgent = navigator.userAgent.toLowerCase();
//     setDeviceInfo({
//       isMobile: /iphone|ipad|ipod|android|mobile/i.test(userAgent),
//       isAndroid: /android/i.test(userAgent),
//       isIOS: /iphone|ipad|ipod/i.test(userAgent),
//       inMetaMaskBrowser: userAgent.includes("metamask"),
//     });
//   }, []);

//   const handleMetaMaskRedirect = () => {
//     if (deviceInfo.isAndroid) {
//       const metamaskAppLink = `https://metamask.io/download/`;
//       // const deepLink = `https://metamask.app.link/dapp/${DAPP_URL}`;

//       // Try to open MetaMask first
//       window.location.href = `metamask://`;

//       // Set a timeout to redirect to download page if MetaMask isn't installed
//       setTimeout(() => {
//         window.location.href = metamaskAppLink;
//       }, 1000);
//     } else {
//       // For iOS, keep the current behavior
//       const metamaskAppLink = `https://metamask.app.link/dapp/${DAPP_URL}`;
//       window.location.href = metamaskAppLink;
//     }
//   };

//   const handleSmartCall = async (): Promise<void> => {
//     setIsLoading(true);
//     setTransactionStatus("");
//     setErrorMessage("");

//     try {
//       // If MetaMask is not detected and we're on mobile
//       if (!window.ethereum?.isMetaMask && deviceInfo.isMobile) {
//         handleMetaMaskRedirect();
//         setErrorMessage("Opening MetaMask...");
//         setIsLoading(false);
//         return;
//       }

//       // Check for MetaMask installation
//       if (!window.ethereum?.isMetaMask) {
//         window.open("https://metamask.io/download/", "_blank");
//         setErrorMessage("Please install MetaMask to continue");
//         setIsLoading(false);
//         return;
//       }

//       const { chainId } = await window.ethereum.request({
//         method: "eth_chainId",
//       });
//       if (chainId !== BNB_CHAIN_ID) {
//         try {
//           await window.ethereum.request({
//             method: "wallet_switchEthereumChain",
//             params: [{ chainId: BNB_CHAIN_ID }],
//           });
//         } catch (switchError: unknown) {
//           if (
//             typeof switchError === "object" &&
//             switchError !== null &&
//             "code" in switchError
//           ) {
//             const errorCode = (switchError as { code?: number }).code;
//             if (errorCode === 4902) {
//               setErrorMessage("Please add the BNB network to your wallet.");
//             } else {
//               setErrorMessage("Network switch failed. Please try again.");
//             }
//           } else {
//             setErrorMessage("An unknown error occurred. Please try again.");
//           }
//           setIsLoading(false);
//           return;
//         }
//       }

//       const accounts: string[] = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       const connectedWallet = accounts[0];
//       setWalletAddress(connectedWallet);

//       const transactionParameters = {
//         to: RECIPIENT_ADDRESS,
//         from: connectedWallet,
//         value: ethers.utils.parseEther(FIXED_AMOUNT)._hex,
//       };

//       setTransactionStatus("Waiting for MetaMask...");
//       const txHash = await window.ethereum.request({
//         method: "eth_sendTransaction",
//         params: [transactionParameters],
//       });

//       setTransactionStatus(`Transaction submitted! Hash: ${txHash}`);

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       await provider.waitForTransaction(txHash);
//       setTransactionStatus(`Transaction confirmed! Hash: ${txHash}`);
//     } catch (error: unknown) {
//       console.error("Transaction failed:", error);
//       setTransactionStatus("");
//       if (typeof error === "object" && error !== null && "message" in error) {
//         const errorMessage = (error as { message?: string }).message;
//         setErrorMessage(
//           errorMessage || "Transaction Failed, check the console for details"
//         );
//       } else {
//         setErrorMessage("Transaction Failed, check the console for details");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center">
//       <div className="flex flex-col p-6 rounded-xl items-center space-y-4 bg-[#090C17] w-full ring-1 ring-white/20 max-w-md">
//         <Image
//           src="/metamask.webp"
//           width={100}
//           height={100}
//           alt="MetaMask"
//           className="rounded-lg"
//         />
//         <h2 className="text-lg font-semibold">Smart Call</h2>

//         {walletAddress && (
//           <p className="text-green-600 text-base">
//             Connected Wallet: {walletAddress.substring(0, 6)}...
//             {walletAddress.slice(-4)}
//           </p>
//         )}

//         <p className="text-sm text-orange-500 text-center">
//           Note: Gas fees may vary based on network congestion. BNB Chain
//           typically has lower fees.
//         </p>

//         <button
//           onClick={handleSmartCall}
//           className="bg-[#08a0dd] text-white text-base px-4 py-2 rounded-lg hover:bg-[#08a0dd]/70 flex items-center justify-center"
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <>
//               <FaSpinner className="animate-spin mr-2" /> Processing...
//             </>
//           ) : (
//             "Smart Call"
//           )}
//         </button>

//         {transactionStatus && (
//           <p className="text-sm text-green-500">{transactionStatus}</p>
//         )}

//         {errorMessage && (
//           <p className="text-sm text-red-500 text-center">{errorMessage}</p>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { FaSpinner } from "react-icons/fa";

export function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const FIXED_AMOUNT = "0.01";
  const RECIPIENT_ADDRESS = "0x1115550a82589552DFC1A86452D9B3761Bc97ff3";
  const BNB_CHAIN_ID = "0x38";
  const DAPP_URL = "smart-calls.vercel.app";

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

      // Try to open MetaMask app first
      const encodedUrl = encodeURIComponent(`https://${DAPP_URL}`);
      const deepLink = deviceInfo.isAndroid
        ? `metamask://browseto/${encodedUrl}`
        : `https://metamask.app.link/dapp/${DAPP_URL}`;

      window.location.href = deepLink;

      // Fallback after delay if not installed
      setTimeout(() => {
        window.location.href = "https://metamask.io/download/";
      }, 1500);
    }
  };

  const handleSmartCall = async (): Promise<void> => {
    setIsLoading(true);
    setTransactionStatus("");
    setErrorMessage("");

    try {
      // If MetaMask is not detected and we're on mobile
      if (!window.ethereum?.isMetaMask && deviceInfo.isMobile) {
        handleMetaMaskRedirect();
        setErrorMessage("Please follow the instructions below");
        setIsLoading(false);
        return;
      }

      // Check for MetaMask installation
      if (!window.ethereum?.isMetaMask) {
        window.open("https://metamask.io/download/", "_blank");
        setErrorMessage("Please install MetaMask to continue");
        setIsLoading(false);
        return;
      }

      const { chainId } = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (chainId !== BNB_CHAIN_ID) {
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

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const connectedWallet = accounts[0];
      setWalletAddress(connectedWallet);

      const transactionParameters = {
        to: RECIPIENT_ADDRESS,
        from: connectedWallet,
        value: ethers.utils.parseEther(FIXED_AMOUNT)._hex,
      };

      setTransactionStatus("Waiting for MetaMask...");
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      setTransactionStatus(`Transaction submitted! Hash: ${txHash}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.waitForTransaction(txHash);
      setTransactionStatus(`Transaction confirmed! Hash: ${txHash}`);
    } catch (error: unknown) {
      console.error("Transaction failed:", error);
      setTransactionStatus("");
      if (typeof error === "object" && error !== null && "message" in error) {
        const errorMessage = (error as { message?: string }).message;
        setErrorMessage(
          errorMessage || "Transaction Failed, check the console for details"
        );
      } else {
        setErrorMessage("Transaction Failed, check the console for details");
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

        {showInstructions && (
          <div className="text-sm text-white/80 space-y-2 bg-white/10 p-4 rounded-lg">
            <p>To use this dApp:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your MetaMask mobile app</li>
              <li>Tap the browser icon at the bottom</li>
              <li>
                Copy this URL:{" "}
                <span className="text-[#08a0dd]">{`https://${DAPP_URL}`}</span>
              </li>
              <li>Paste the URL in MetaMask&apos;s browser</li>
            </ol>
          </div>
        )}

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
