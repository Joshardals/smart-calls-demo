import { Social } from "@/typings";

export const socials: Social[] = [
  {
    id: 1,
    label: "Tiktok",
    src: "/tiktok.png",
    getShareUrl: (url, text) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 2,
    label: "Whatsapp",
    src: "/whatsapp.png",
    getShareUrl: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 3,
    label: "Telegram",
    src: "/telegram.png",
    getShareUrl: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 4,
    label: "X",
    src: "/x.png",
    getShareUrl: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 5,
    label: "More",
    src: "/more.png",
  },
];
