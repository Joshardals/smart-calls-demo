import { Social } from "@/typings";

export const socials: Social[] = [
  {
    id: 1,
    label: "Tiktok",
    src: "/tiktok.png",
    content: {
      title: "How to Refer Users on TikTok",
      options: [
        {
          title: "Option 1",
          steps: [
            "Create a public TikTok post about the Web3 community, emphasizing it as the future of earning.",
            "Paste the URL of your post for verification.",
            "Your post will be reviewed by the team within 24 hours.",
          ],
        },
        {
          title: "Option 2",
          steps: [
            "Refer users by discussing the Web3 community and its potential as the future of earning.",
            "Provide screenshots to verify your conversations.",
            "Your screenshots will be reviewed by the team within 24 hours.",
          ],
        },
      ],
      note: "Any referrals generated through bots or automated methods will be rejected. Only genuine and verified referrals will be accepted.",
    },
  },
  {
    id: 2,
    label: "Whatsapp",
    src: "/whatsapp.png",
    // Add WhatsApp content here
  },
  {
    id: 3,
    label: "Telegram",
    src: "/telegram.png",
    // Add Telegram content here
  },
  {
    id: 4,
    label: "X",
    src: "/x.png",
    // Add X content here
  },
  {
    id: 5,
    label: "More",
    src: "/more.png",
    // Add More content here
  },
];
