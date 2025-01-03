import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages] = useState([
    {
      id: 1,
      user: "Alex",
      message: "Just made my first referral! 🚀",
      timestamp: "2:31 PM",
      avatar: "A",
    },
    {
      id: 2,
      user: "Sarah",
      message: "Congrats! How much did you earn?",
      timestamp: "2:32 PM",
      avatar: "S",
    },
    {
      id: 3,
      user: "Alex",
      message: "500 USDC straight to my wallet!",
      timestamp: "2:32 PM",
      avatar: "A",
    },
    {
      id: 4,
      user: "Mike",
      message: "That's awesome! I'm working on my third referral this week 💪",
      timestamp: "2:33 PM",
      avatar: "M",
    },
    {
      id: 5,
      user: "Sarah",
      message: "The rewards are insane. Already at $1500 total",
      timestamp: "2:34 PM",
      avatar: "S",
    },
  ]);

  // Auto-scroll to bottom effect
  useEffect(() => {
    if (isOpen) {
      const chatContainer = document.getElementById("chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* Chat Toggle Button - Fixed at bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#08a0dd] p-4 rounded-full shadow-lg shadow-[#08a0dd]/20 hover:scale-105 transition-transform duration-200 z-50"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] z-50"
          >
            <div className="bg-[#111111] border border-[#08a0dd]/30 rounded-xl shadow-2xl shadow-[#08a0dd]/20">
              {/* Header */}
              <div className="p-4 border-b border-[#08a0dd]/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-[#08a0dd] font-bold">Live Chat</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">142 online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                id="chat-messages"
                className="space-y-4 max-h-[400px] overflow-y-auto p-4 scroll-smooth"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#08a0dd]/20 flex items-center justify-center text-[#08a0dd] font-medium">
                      {msg.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-[#08a0dd]">
                          {msg.user}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 bg-[#1a1a1a] rounded-lg p-3 inline-block">
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#08a0dd]/20">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="text"
                    disabled
                    placeholder="Chat disabled - Read only"
                    className="w-full bg-[#1a1a1a] border border-[#08a0dd]/20 rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
