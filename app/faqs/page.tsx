"use client";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

export default function Page() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What are Smart Contracts?",
      answer: `Smart contracts are self-executing programs that run on a blockchain and automatically enforce the terms of an agreement when predefined conditions are met. These digital agreements are written in code, ensuring that once the specified conditions are satisfied, the contract executes itself without the need for intermediaries such as banks, lawyers, or other middlemen.

The code in a smart contract contains all the rules and penalties of the agreement, as well as the logic that triggers its execution. When the conditions coded into the contract are met, the blockchain processes`,
    },
    {
      question: "Error: net::ERR_CLEARTEXT_NOT_PERMITTED",
      answer:
        "Ensure the https:// in the link is correctly written into the URL.",
    },
    {
      question: "Error: Processing Loop Error",
      answer: `This error occurs due to a browser environment issue.

• Try again a couple of times.
• If the issue persists, run the URL on another device.`,
    },
    {
      question: "Error: No Transaction Confirmation Popup",
      answer: `• Try again a couple of times.
• If the problem persists, run the URL on another device.`,
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="px-8 py-4 space-y-10">
      <h1 className="text-2xl tracking-wider">FAQs</h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#090C17] border border-white/20 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5"
            >
              <span className="font-medium text-lg">{faq.question}</span>
              <span
                className="text-lg transform transition-transform duration-200"
                style={{
                  transform:
                    openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <IoIosArrowDown className={``} />
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? "h-auto" : "h-0"
              }`}
            >
              <div className="px-6 py-4 text-gray-300 text-base max-md:text-sm whitespace-pre-line">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
