"use client";
import Redditicon from "@/public/assets/icons8-reddit-32.png";
import TelegramIcon from "@/public/assets/icons8-telegram-32.png";
import Discordicon from "@/public/assets/icons8-discord-32.png";
import Xicon from "@/public/assets/icons8-x-32.png";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function Footer() {
  const footericons = [
    { name: "discord", href: "https://discord.com/", icon: Discordicon },
    { name: "telegramicon", href: "https://telegram.com/", icon: TelegramIcon },
    { name: "redditicon", href: "https://reddit.com/", icon: Redditicon },
    { name: "xicon", href: "https://x.com/", icon: Xicon },
  ];
  return (
    <div className="bg-black py-4 justify-center items-center w-full">
      <div className="flex justify-center items-center ">
        <h2 className="font-bold text-lg text-white px-4">Join Us Now</h2>
        {footericons.map((item) => {
          return (
            <Link
              href={item.href}
              key={item.name}
              className="flex justify-center items-center h-10 w-10 rounded-full bg-white mx-4"
            >
              {/* Using the Next.js Image component to render the icon */}
              <Image
                src={item.icon}
                alt={item.name}
                width={24} // Adjust width as needed
                height={24} // Adjust height as needed
                className="object-contain"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

