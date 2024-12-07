import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="px-4 pb-10">
      <div className="px-8 py-4 font-sans mt-20 bg-[#090C17] shadow-sm ring-1 ring-white/20 rounded-md flex items-baseline justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="Logo Image"
            className="size-10"
          />
          <div className=" leading-none">
            <p>Web3</p>
            <p>Smart Contract Call</p>
          </div>
        </div>

        <div>
          <Link href="https://github.com/web3/web3.js">
            <FaGithub className="size-5 text-white/50" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
