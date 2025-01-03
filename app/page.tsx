"use client";

import Image from "next/image";
import { Wallet } from "./_components/Wallet";
import { useState, useEffect } from "react";
import Status from "./_components/Status";

export default function Home() {
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#08a0dd]/30 p-8 max-w-md mx-4 rounded-lg text-center shadow-2xl shadow-[#08a0dd]/20 relative">
            {/* Premium Badge */}
            <div className="absolute -top-4 -left-4 flex items-center gap-2 bg-gradient-to-r from-[#08a0dd] to-[#065d80] px-4 py-2 rounded-full shadow-lg">
              <svg
                className="w-6 h-6 text-yellow-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.49 9.6a2.48 2.48 0 0 0-2.23-1.62h-4.57L12.25 3.5a2.49 2.49 0 0 0-4.5 0L6.31 8H1.74a2.49 2.49 0 0 0-1.45 4.5l3.68 2.7-1.44 4.42a2.49 2.49 0 0 0 3.83 2.78L10 19.73l3.64 2.65a2.49 2.49 0 0 0 3.83-2.78l-1.44-4.42 3.68-2.7a2.49 2.49 0 0 0 .78-2.88Z" />
              </svg>
              <span className="text-sm font-bold text-white">NEW</span>
            </div>

            <div className="relative w-60 h-60 mx-auto mb-6">
              <Image
                src="/welcome.png"
                alt="Welcome"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-[#08a0dd] text-3xl font-bold mb-6">
              Refer and earn up to $2000 USDC
            </h2>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#08a0dd]/30 to-transparent my-6" />
            <p className="text-sm text-gray-400 italic">
              Sit back and watch your income grow
            </p>

            {/* Skip Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="mt-6 px-6 py-2 bg-transparent border border-[#08a0dd]/30 text-[#08a0dd] rounded-full hover:bg-[#08a0dd]/10 transition-all duration-300 text-sm font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      )}
      <main className="py-5 px-8 space-y-10 rounded-xl w-full md:max-w-lg md:mx-auto">
        <Wallet />
        <Status />

        {/* <section className="text-base max-md:text-sm space-y-10">
          <div>
            <h2 className="font-medium text-lg">
              Create a smart contract and minting dApp
            </h2>

            <Image
              src="/image-1.png"
              width={500}
              height={500}
              alt="Platform Overview"
              className="mt-8 mb-4"
            />

            <p className="text-gray-300">
              When you log into the platform, the first step is to navigate to
              the Smart Contracts section and select Create Smart Contract.
            </p>
          </div>

          <div>
            <Image
              src="/image-2.png"
              width={500}
              height={500}
              alt="Create Collection"
              className="mt-8 mb-4"
            />

            <div className="text-gray-300">
              <p>
                Here, you&apos;ll be prompted to input key information about
                your collection, including:
              </p>
              <ul className=" list-disc px-4 space-y-1 mt-1 ">
                <li>Collection Title</li>
                <li>Collection Description</li>
                <li>
                  <b>Ticker Name</b>: The shorthand name for your contract.
                </li>
                <li>
                  <b>Max Supply</b>: The total number of NFTs available for
                  minting.
                </li>
                <li>
                  <b>Mint Price</b>: The price users will pay to mint each NFT.
                </li>
                <li>
                  <b>Whitelist Price</b>: A discounted mint price for
                  whitelisted users, if applicable.
                </li>
              </ul>
            </div>
          </div>

          <p className="text-gray-300">
            You&apos;ll also have the option to upload a delayed reveal image if
            you wish to use one. Next, you&apos;ll link your contract to the
            relevant NFT project—whether it&apos;s a 1-of-1 collection or a
            generative collection you created earlier. Once linked, NFTs minted
            via this contract will originate from the associated project.
          </p>

          <p className="text-gray-300">
            After uploading both the delayed reveal image and the final NFTs,
            you can preview how the minting experience will appear to users. A
            dedicated section allows you to configure whitelist settings, such
            as setting a whitelist price and defining the maximum number of NFTs
            an individual can mint during the whitelist phase.
          </p>

          <p className="text-gray-300">
            Once all the details are complete, click Save to finalize the setup.
            You&apos;ll then have the opportunity to review the contract and
            proceed to deployment on the blockchain.
          </p>

          <div>
            <h2 className="font-medium text-lg">
              Deploying the Smart Contract
            </h2>

            <Image
              src="/image-3.png"
              width={500}
              height={500}
              alt="Deploying the Smart Contract"
              className="mt-8 mb-4"
            />

            <div className="text-gray-300">
              <p>Deploying your smart contract is straightforward:</p>
              <ul className=" list-disc px-4 space-y-1 mt-1">
                <li>Connect your wallet via MetaMask.</li>
                <li>
                  Pay the required transaction fees.
                  <br /> While the cost of deployment varies based on blockchain
                  activity, the platform has optimized the process to reduce
                  costs.
                </li>
              </ul>
            </div>
          </div>

          <div className="text-gray-300">
            <p>
              After deployment, the platform provides a backend system to manage
              your contract. This includes the ability to:
            </p>
            <ul className=" list-disc px-4 space-y-1 mt-1">
              <li>Launch your NFT drop by unpausing the contract.</li>
              <li>Mint NFTs for giveaways or treasury allocations.</li>
              <li>Embed the minting functionality into an existing website.</li>
            </ul>
          </div>

          <p className="text-gray-300">
            You&apos;ll also have access to tools to verify and review your
            smart contract on Etherscan after deployment.
          </p>

          <div>
            <h2 className="font-medium text-lg">
              Full Ownership of Your Contract
            </h2>
            <p className="mt-4 text-gray-300">
              When you deploy a smart contract using this platform, the contract
              is associated with your wallet, giving you full ownership and
              control. From managing the user experience to customizing the
              project&apos;s evolution, you maintain complete authority over
              your creation.
            </p>
          </div>

          <p className="text-gray-300">
            By following these steps, you can efficiently create, deploy, and
            manage an NFT collection, offering users a seamless and professional
            minting experience.
          </p>
        </section> */}
      </main>
    </>
  );
}
