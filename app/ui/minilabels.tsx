import ccicon from "@/public/assets/icons8-so-closed-caption-32.png";
import micicon from "@/public/assets/icons8-mic-16.png";
import React from "react";
import Image from "next/image";
export default function Minilabel({ subOrDub, totaleps }: { subOrDub: string | undefined, totaleps: number | undefined }) {
  return (

    <div className="inline-flex h-5 p-0.5 items-center rounded-sm">
      {subOrDub === 'sub' ? (
        <div className="inline-flex h-5 items-center px-2 rounded-sm bg-cyan-300">
          <Image
            src={ccicon}
            width={16}
            height={16}
            alt="closed captions icon"
            className="mr-1"
          />
          <span className="text-sm leading-none font-bold text-black">
            {totaleps}
          </span>
        </div>
      ) :
        (
          <div className="inline-flex h-5 items-center px-2 rounded-sm bg-lime-300">
            <Image
              src={micicon}
              width={16}
              height={16}
              alt="mic icon"
              className="mr-1"
            />
            <span className="text-sm leading-none font-bold text-black">
              {totaleps}
            </span>
          </div>
        )}
    </div>
  );
}
