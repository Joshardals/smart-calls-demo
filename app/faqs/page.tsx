export default function page() {
  return (
    <div className="px-8 py-4 space-y-10">
      <h1 className="text-2xl tracking-wider">FAQs</h1>

      <div className="space-y-4">
        <span className="font-medium text-lg">What are Smart Contracts?</span>
        <p className="text-base text-pretty text-gray-300">
          Smart contracts are self-executing programs that run on a blockchain
          and automatically enforce the terms of an agreement when predefined
          conditions are met. These digital agreements are written in code,
          ensuring that once the specified conditions are satisfied, the
          contract executes itself without the need for intermediaries such as
          banks, lawyers, or other middlemen. <br />
          <br /> The code in a smart contract contains all the rules and
          penalties of the agreement, as well as the logic that triggers its
          execution. When the conditions coded into the contract are met, the
          blockchain processes
        </p>
      </div>
    </div>
  );
}
