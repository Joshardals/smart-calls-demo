import Image from "next/image";
import { Wallet } from "./_components/Wallet";

export default function Home() {
  return (
    <main className="py-5 px-8 space-y-10 rounded-xl w-full md:max-w-lg md:mx-auto">
      <Wallet />

      <section className="text-base max-md:text-sm space-y-10">
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
            When you log into the platform, the first step is to navigate to the
            Smart Contracts section and select Create Smart Contract.
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
              Here, you&apos;ll be prompted to input key information about your
              collection, including:
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
                <b>Whitelist Price</b>: A discounted mint price for whitelisted
                users, if applicable.
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
          After uploading both the delayed reveal image and the final NFTs, you
          can preview how the minting experience will appear to users. A
          dedicated section allows you to configure whitelist settings, such as
          setting a whitelist price and defining the maximum number of NFTs an
          individual can mint during the whitelist phase.
        </p>

        <p className="text-gray-300">
          Once all the details are complete, click Save to finalize the setup.
          You&apos;ll then have the opportunity to review the contract and
          proceed to deployment on the blockchain.
        </p>

        <div>
          <h2 className="font-medium text-lg">Deploying the Smart Contract</h2>

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
          You&apos;ll also have access to tools to verify and review your smart
          contract on Etherscan after deployment.
        </p>

        <div>
          <h2 className="font-medium text-lg">
            Full Ownership of Your Contract
          </h2>
          <p className="mt-4 text-gray-300">
            When you deploy a smart contract using this platform, the contract
            is associated with your wallet, giving you full ownership and
            control. From managing the user experience to customizing the
            project&apos;s evolution, you maintain complete authority over your
            creation.
          </p>
        </div>

        <p className="text-gray-300">
          By following these steps, you can efficiently create, deploy, and
          manage an NFT collection, offering users a seamless and professional
          minting experience.
        </p>
      </section>
    </main>
  );
}
