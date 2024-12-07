import Image from "next/image";
import Link from "next/link";
// import * as SyntaxHighlighter from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Wallet } from "./_components/Wallet";

export default function Home() {
  return (
    <main className="py-5 px-8 space-y-10">
      <Wallet />
      <h1 className="text-5xl font-medium tracking-wider max-sm:max-w-sm max-w-3xl leading-[1.2]">
        Create and Deploy your Smart Contract
      </h1>

      <ul className="space-y-10">
        <Item
          label="Step 1: Connect to the Ethereum network"
          content="There are many ways to make requests to the Ethereum chain. For
            simplicity, we'll use a free account on Alchemy, a blockchain
            developer platform and API that allows us to communicate with the
            Ethereum chain without having to run our own nodes. The platform
            also has developer tools for monitoring and analytics that
            we'll take advantage of in this tutorial to understand
            what's going on under the hood in our smart contract
            deployment."
        />
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 2: Create your app (and API key)
          </h3>
          <div className="space-y-8">
            <p>
              Once you&apos;ve created an Alchemy account, you can generate an
              API key by creating an app. This will allow us to make requests to
              the Goerli test network. If you&apos;re not familiar with
              testnets, check out this{" "}
              <Link
                href="https://docs.alchemyapi.io/guides/choosing-a-network"
                className="text-blue-500"
              >
                guide
              </Link>
              .
            </p>
            <p>
              Navigate to the “Create App” page in your Alchemy Dashboard by
              hovering over “Apps” in the nav bar and clicking “Create App”
            </p>

            <Image
              src="/image-1.png"
              width={500}
              height={500}
              alt="Create App"
              className="w-full"
            />

            <p>
              Name your app “Hello World”, offer a short description, select
              “Staging” for the Environment (used for your app bookkeeping), and
              choose “Goerli” for your network.
            </p>

            <Image
              src="/image-2.png"
              width={500}
              height={500}
              alt="Create App"
              className="w-full"
            />
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 2: Create your app (and API key)
          </h3>
          <div className="space-y-8">
            <p>
              We need an Ethereum account to send and receive transactions. For
              this tutorial, we&apos;ll use Metamask, a virtual wallet in the
              browser used to manage your Ethereum account address. If you want
              to understand more about how transactions on Ethereum work, check
              out{" "}
              <Link
                href="https://ethereum.org/en/developers/docs/transactions/"
                className="text-blue-500"
              >
                this page
              </Link>{" "}
              from the Ethereum foundation.
            </p>
            <p>
              You can download and create a Metamask account for free here. When
              you are creating an account, or if you already have an account,
              make sure to switch over to the “Goerli Test Network” in the upper
              right (so that we&apos;re not dealing with real money).
            </p>

            <Image
              src="/image-3.png"
              width={500}
              height={500}
              alt="Create App"
              className="w-full"
            />
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 4: Add ether from a Faucet
          </h3>
          <div className="space-y-8">
            <p>
              In order to deploy our smart contract to the test network, we’ll
              need some fake Eth. To get Eth you can go to the{" "}
              <Link href="https://goerlifaucet.com/" className="text-blue-500">
                Goerli faucet
              </Link>{" "}
              and enter your Goerli account address, then click “Send Me Eth.”
              It may take some time to receive your fake Eth due to network
              traffic. (At the time of writing this, it took around 30 minutes.)
              You should see Eth in your Metamask account soon after!
            </p>
          </div>
        </li>

        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 5: Check your Balance
          </h3>
          <div className="space-y-8">
            <p>
              To double check our balance is there, let&apos;s make an
              <Link
                href="https://docs.alchemyapi.io/alchemy/documentation/alchemy-api-reference/json-rpc#eth_getbalance"
                className="text-blue-500"
              >
                eth_getBalance
              </Link>{" "}
              request using{" "}
              <Link
                href="https://composer.alchemyapi.io/?composer_state=%7B%22network%22%3A0%2C%22methodName%22%3A%22eth_getBalance%22%2C%22paramValues%22%3A%5B%22%22%2C%22latest%22%5D%7D"
                className="text-blue-500"
              >
                Alchemy&apos;s composer tool
              </Link>
              . This will return the amount of Eth in our wallet. Check out{" "}
              <Link
                href="https://youtu.be/r6sjRxBZJuU"
                className="text-blue-500"
              >
                this video
              </Link>{" "}
              for instructions on how to use the composer tool!{" "}
            </p>
            <p>
              After you input your Metamask account address and click “Send
              Request”, you should see a response that looks like this:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`{"jsonrpc": "2.0", "id": 0, "result": "0x2B5E3AF16B1880000"}`}
            </SyntaxHighlighter> */}

            <p>
              After you input your Metamask account address and click “Send
              Request”, you should see a response that looks like this:
            </p>

            <p className="relative before:absolute before:w-1 before:h-full before:bg-white">
              <div className="px-8">
                NOTE: This result is in wei not eth. Wei is used as the smallest
                denomination of ether. The conversion from wei to eth is: 1 eth
                = 10^18 wei. So if we convert 0x2B5E3AF16B1880000 to decimal we
                get 5*10^18 which equals 5 eth. Phew! Our fake money is all
                there 🤑.
              </div>
            </p>
          </div>
        </li>

        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 6: Initialize our project
          </h3>
          <div className="space-y-8">
            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`mkdir hello-world\ncd hello-world`}
            </SyntaxHighlighter> */}
            <p>
              First, we&apos;ll need to create a folder for our project.
              Navigate to your{" "}
              <Link
                href="https://docs.alchemyapi.io/alchemy/documentation/alchemy-api-reference/json-rpc#eth_getbalance"
                className="text-blue-500"
              >
                command line
              </Link>{" "}
              and type:
            </p>
            <p>
              Now that we&apos;re inside our project folder, we&apos;ll use npm
              init to initialize the project. If you don&apos;t already have npm
              installed, follow these instructions (we&apos;ll also need Node.js
              so download that too!).
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`npm init # (or npm init --yes)`}
            </SyntaxHighlighter> */}

            <p>
              It doesn&apos;t really matter how you answer the installation
              questions, here is how we did it for reference:
            </p>

            {/* <SyntaxHighlighter
              language="bash"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`package name: (hello-world)
version: (1.0.0)
description: hello world smart contract
entry point: (index.js)
test command:
git repository:
keywords:
author:
license: (ISC)

About to write to /Users/.../.../.../hello-world/package.json:

{
   "name": "hello-world",
   "version": "1.0.0",
   "description": "hello world smart contract",
   "main": "index.js",
   "scripts": {
      "test": "echo \\"Error: no test specified\\" && exit 1"
   },
   "author": "",
   "license": "ISC"
}`}
            </SyntaxHighlighter> */}

            <p>Approve the package.json and we&apos;re good to go!</p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 7: Download{" "}
            <Link
              href="https://hardhat.org/getting-started/#overview"
              className="text-blue-500"
            >
              Hardhat
            </Link>
          </h3>
          <div className="space-y-8">
            <p>
              Hardhat is a development environment to compile, deploy, test, and
              debug your Ethereum software. It helps developers when building
              smart contracts and dApps locally before deploying to the live
              chain.
            </p>

            <p>
              Inside our <code className="bg-[#2D2D2D]">hello-world</code>{" "}
              project run:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`npm install --save-dev hardhat`}
            </SyntaxHighlighter> */}

            <p>
              Check out this page for more details on{" "}
              <Link
                href="https://hardhat.org/getting-started/#overview"
                className="text-blue-500"
              >
                installation instructions
              </Link>
              .
            </p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 8: Create Hardhat project
          </h3>
          <div className="space-y-8">
            <p>
              Inside our <code className="bg-[#2D2D2D]">hello-world</code>{" "}
              project run:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`npx hardhat`}
            </SyntaxHighlighter> */}

            <p>
              You should then see a welcome message and option to select what
              you want to do. Select “create an empty hardhat.config.js”:
            </p>

            {/* <SyntaxHighlighter
              language="text"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`888    888                      888 888               888
888    888                      888 888               888
888    888                      888 888               888
8888888888  8888b.  888d888 .d88888 88888b.   8888b.  888888
888    888     "88b 888P"  d88" 888 888 "88b     "88b 888
888    888 .d888888 888    888  888 888  888 .d888888 888
888    888 888  888 888    Y88b 888 888  888 888  888 Y88b.
888    888 "Y888888 888     "Y88888 888  888 "Y888888  "Y888

👷 Welcome to Hardhat v2.0.11 👷‍

What do you want to do? …
Create a sample project
❯ Create an empty hardhat.config.js
Quit`}
            </SyntaxHighlighter> */}

            <p>
              This will generate a{" "}
              <code className="bg-[#2D2D2D]">hardhat.config.js</code> file for
              us, which is where we&apos;ll specify all of the set up for our
              project (on step 13).
            </p>
          </div>
        </li>

        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 9: Add project folders
          </h3>
          <div className="space-y-8">
            <p>
              To keep our project organized we&apos;ll create two new folders.
              Navigate to the root directory of your hello-world project in your
              command line and type
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`mkdir contracts\nmkdir scripts`}
            </SyntaxHighlighter> */}

            <p>
              <span className="bg-[#2D2D2D]">contracts/</span> is where
              we&apos;ll keep our hello world smart contract code file
            </p>

            <p>
              <span className="bg-[#2D2D2D]">scripts/</span> is where we&apos;ll
              keep our hello world smart contract code file
            </p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 10: Write our contract
          </h3>
          <div className="space-y-8">
            <p>
              You might be asking yourself, when the heck are we going to write
              code?? Well, here we are, on Step 10 😄
            </p>

            <p>
              Open up the hello-world project in your favorite editor (we like{" "}
              <Link
                href="https://code.visualstudio.com/"
                className="text-blue-500"
              >
                VSCode
              </Link>
              ). Smart contracts are written in a language called Solidity which
              is what we will use to write our HelloWorld.sol smart contract.
            </p>

            <p>
              1. Navigate to the “contracts” folder and create a new file called
              HelloWorld.sol
            </p>

            <p>
              2. Below is a sample Hello World smart contract from the Ethereum
              Foundation that we will be using for this tutorial. Copy and paste
              in the contents below into your HelloWorld.sol file, and be sure
              to read the comments to understand what this contract does:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
// Specifies the version of Solidity, using semantic versioning.
// Learn more: https://solidity.readthedocs.io/en/v0.5.10/layout-of-source-files.html#pragma
pragma solidity >=0.7.3;

// Defines a contract named 'HelloWorld'.
// A contract is a collection of functions and data (its state). Once deployed, a contract resides at a specific address on the Ethereum blockchain. Learn more: https://solidity.readthedocs.io/en/v0.5.10/structure-of-a-contract.html
contract HelloWorld {

   // Emitted when update function is called
   // Smart contract events are a way for your contract to communicate that something happened on the blockchain to your app front-end, which can be 'listening' for certain events and take action when they happen.
   event UpdatedMessages(string oldStr, string newStr);

   // Declares a state variable 'message' of type 'string'.
   // State variables are variables whose values are permanently stored in contract storage. The keyword 'public' makes variables accessible from outside a contract and creates a function that other contracts or clients can call to access the value.
   string public message;

   // Similar to many class-based object-oriented languages, a constructor is a special function that is only executed upon contract creation.
   // Constructors are used to initialize the contract's data. Learn more:https://solidity.readthedocs.io/en/v0.5.10/contracts.html#constructors
   constructor(string memory initMessage) {

      // Accepts a string argument 'initMessage' and sets the value into the contract's 'message' storage variable).
      message = initMessage;
   }

   // A public function that accepts a string argument and updates the 'message' storage variable.
   function update(string memory newMessage) public {
      string memory oldMsg = message;
      message = newMessage;
      emit UpdatedMessages(oldMsg, newMessage);
   }
}`}
            </SyntaxHighlighter> */}

            <p>
              This is a super simple smart contract that stores a message upon
              creation and can be updated by calling the update function.
            </p>
          </div>
        </li>

        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 11: Connect Metamask & Alchemy to your project
          </h3>
          <div className="space-y-8">
            <p>
              We&apos;ve created a Metamask wallet, Alchemy account, and written
              our smart contract, now it&apos;s time to connect the three.
            </p>

            <p>
              Every transaction sent from your virtual wallet requires a
              signature using your unique private key. To provide our program
              with this permission, we can safely store our private key (and
              Alchemy API key) in an environment file.
            </p>

            <p className="relative before:absolute before:w-1 before:h-full before:bg-white">
              <div className="px-8">
                To learn more about sending transactions, check out{" "}
                <Link
                  href="https://docs.alchemyapi.io/alchemy/tutorials/sending-transactions-using-web3-and-alchemy"
                  className="text-blue-500"
                >
                  this tutorial
                </Link>{" "}
                on sending transactions using web3.
              </div>
            </p>

            <p>First, install the dotenv package in your project directory:</p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`npm install dotenv --save`}
            </SyntaxHighlighter> */}

            <p>
              This is a super simple smart contract that stores a message upon
              creation and can be updated by calling the update function.
            </p>

            <p className="relative before:absolute before:w-1 before:h-full before:bg-white">
              <div className="px-8">
                Your environment file must be named .env or it won&apos;t be
                recognized as an environment file.Do not name it process.env or
                .env-custom or anything else.
              </div>
            </p>

            <p>
              <ul className="list-disc pl-8">
                <li>
                  Follow{" "}
                  <Link
                    href="https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key"
                    className="text-blue-500"
                  >
                    these instructions
                  </Link>{" "}
                  to export your private key
                </li>
                <li>See below to get HTTP Alchemy API URL</li>
              </ul>
            </p>

            <Image
              src="/image-4.gif"
              width={500}
              height={500}
              alt="Create App"
              className="w-full"
            />

            <p>
              Your <span className="bg-[#2D2D2D]">.env</span> should look like
              this:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`API_URL = "https://eth-goerli.alchemyapi.io/v2/your-api-key"\nPRIVATE_KEY = "your-metamask-private-key"`}
            </SyntaxHighlighter> */}

            <p>
              To actually connect these to our code, we&apos;ll reference these
              variables in our{" "}
              <span className="bg-[#2D2D2D]">hardhat.config.js</span> file on
              step 13.
            </p>

            <p>
              To actually connect these to our code, we&apos;ll reference these
              variables in our hardhat.config.js file on step 13.
            </p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 12: Install Ethers.js
          </h3>
          <div className="space-y-8">
            <p>
              Ethers.js is a library that makes it easier to interact and make
              requests to Ethereum by wrapping standard JSON-RPC methods with
              more user friendly methods.
            </p>

            <p>
              Hardhat makes it super easy to integrate Plugins for additional
              tooling and extended functionality. We&apos;ll be taking advantage
              of the Ethers plugin for contract deployment (Ethers.js has some
              super clean contract deployment methods).
            </p>

            <p>In your project directory type:</p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`npm install --save-dev @nomiclabs/hardhat-ethers "ethers@^5.0.0"`}
            </SyntaxHighlighter> */}

            <p>
              We&apos;ll also require ethers in our{" "}
              <span className="bg-[#2D2D2D]">hardhat.config.js</span> in the
              next step.
            </p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 13: Update hardhat.config.js
          </h3>
          <div className="space-y-8">
            <p>
              We&apos;ve added several dependencies and plugins so far, now we
              need to update hardhat.config.js so that our project knows about
              all of them.
            </p>

            <p>
              Update your{" "}
              <span className="bg-[#2D2D2D]">hardhat.config.js</span> to look
              like this:
            </p>

            
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 14: Compile our contract
          </h3>
          <div className="space-y-8">
            <p>
              To make sure everything is working so far, let&apos;s compile our
              contract. The compile task is one of the built-in hardhat tasks.
            </p>

            <p>From the command line run:</p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
npx hardhat compile
`}
            </SyntaxHighlighter> */}

            <p>
              You might get a warning about SPDX license identifier not provided
              in source file, but no need to worry about that — hopefully
              everything else looks good!
            </p>

            <p>
              If not, you can always message in the{" "}
              <Link
                href="https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key"
                className="text-blue-500"
              >
                Alchemy Discord
              </Link>{" "}
              .
            </p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 15: Write our deploy script
          </h3>
          <div className="space-y-8">
            <p>
              Now that our contract is written and our configuration file is
              good to go, it&apos;s time to write our contract deploy script.
            </p>

            <p>
              Navigate to the <span className="bg-[#2D2D2D]">/scripts</span>{" "}
              folder and create a new file called{" "}
              <span className="bg-[#2D2D2D]">deploy.js</span>, adding the
              following contents to it:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
async function main() {
   const HelloWorld = await ethers.getContractFactory("HelloWorld");

   // Start deployment, returning a promise that resolves to a contract object
   const hello_world = await HelloWorld.deploy("Hello World!");
   console.log("Contract deployed to address:", hello_world.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
`}
            </SyntaxHighlighter> */}

            <p>
              Hardhat does an amazing job of explaining what each of these lines
              of code does in their{" "}
              <Link
                href="https://hardhat.org/tutorial/testing-contracts.html#writing-tests"
                className="text-blue-500"
              >
                Contracts tutorial
              </Link>
              , we&apos;ve adopted their explanations here.
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
const HelloWorld = await ethers.getContractFactory("HelloWorld");
`}
            </SyntaxHighlighter> */}

            <p>
              A <span className="bg-[#2D2D2D]">ContractFactory</span> in
              ethers.js is an abstraction used to deploy new smart contracts, so{" "}
              <span className="bg-[#2D2D2D]">HelloWorld</span> here is a factory
              for instances of our hello world contract. When using the{" "}
              <span className="bg-[#2D2D2D]">hardhat-ethers</span> plugin{" "}
              <span className="bg-[#2D2D2D]">ContractFactory</span> and{" "}
              <span className="bg-[#2D2D2D]">Contract</span>, instances are
              connected to the first signer (owner) by default.
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
const hello_world = await HelloWorld.deploy();
`}
            </SyntaxHighlighter> */}

            <p>
              Calling <span className="bg-[#2D2D2D]">deploy()</span> on a{" "}
              <span className="bg-[#2D2D2D]">ContractFactory</span> will start
              the deployment, and return a Promise that resolves to a Contract
              object. This is the object that has a method for each of our smart
              contract functions.
            </p>
          </div>
        </li>
        <li className="space-y-5">
          <h3 className="text-3xl tracking-wider">
            Step 16: Deploy our contract
          </h3>
          <div className="space-y-8">
            <p>
              We&apos;re finally ready to deploy our smart contract! Navigate to
              the command line and run:
            </p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
npx hardhat run scripts/deploy.js --network goerli
`}
            </SyntaxHighlighter> */}

            <p>You should then see something like:</p>

            {/* <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                marginTop: "1rem",
              }}
            >
              {`
Contract deployed to address: 0xCAFBf889bef0617d9209Cf96f18c850e901A6D61
`}
            </SyntaxHighlighter> */}

            <p>
              Please copy and paste this address to save it somewhere, as we
              will be using this address for later tutorials, so you don&apos;t
              want to lose it.
            </p>

            <p>
              If we go to the{" "}
              <Link
                href="https://goerli.etherscan.io/"
                className="text-blue-500"
              >
                Goerli etherscan
              </Link>{" "}
              and search for our contract address we should able to see that it
              has been deployed successfully. The transaction will look
              something like this:
            </p>

            <Image
              src="/image-4.png"
              width={500}
              height={500}
              alt="Create App"
              className="w-full"
            />

            <p>
              The From address should match your Metamask account address and
              the To address will say “Contract Creation” but if we click into
              the transaction we&apos;ll see our contract address in the To
              field:
            </p>

            <Image
              src="/image-5.png"
              width={500}
              height={500}
              alt="Create App"
              className="w-full"
            />

            <p>
              Congrats! You just deployed a smart contract to the Ethereum chain
              🎉
            </p>
          </div>
        </li>
      </ul>
    </main>
  );
}

function Item({ label, content }: { label: string; content: string }) {
  return (
    <li className="space-y-5">
      <h3 className="text-3xl tracking-wider">{label}</h3>
      <p className="text-pretty">{content}</p>
    </li>
  );
}
