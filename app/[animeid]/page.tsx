"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TbWorldShare } from "react-icons/tb";
import TelegramIcon from "@/public/assets/icons8-telegram-32.png";
import Discordicon from "@/public/assets/icons8-discord-32.png";
import Xicon from "@/public/assets/icons8-x-32.png";
import Redditicon from "@/public/assets/icons8-reddit-32.png";
import { ISource } from "@consumet/extensions/dist/models/types";

interface RelatedAnime {
  id: string;
  title: string;
  image: string;
  subOrDub: string;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [sources, setSources] = useState<ISource>();

  const unparsedata = localStorage.getItem('animeInfo');
  const data = unparsedata ? JSON.parse(unparsedata) : null;

  const fetchsources = async () => {
    const sources = await axios.get(`/api/episodeSources/${data?.episodes[0].id}`);
    return sources;
  };

  async function visitLink() {
    const sources = await fetchsources();
    localStorage.setItem('sources', JSON.stringify(sources.data));
    router.push(`/watch/${data?.id}?epid=${data?.episodes[0].id}`);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-900">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/95 backdrop-blur-md bg-opacity-95 pt-12 text-gray-100 font-sans">
      <div className="container mx-auto p-0">
        {data && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Poster */}
            <div className="lg:w-1/4">
              <div className="relative group">
                <img
                  src={data.image}
                  alt={`${data.title} Poster`}
                  className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg font-medium cursor-pointer">
                    WatchTogether
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section - Main Content */}
            <div className="lg:w-1/2 flex flex-col">
              <h1 className="text-4xl font-bold mb-4 leading-tight">{data?.title}</h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1.5 bg-gray-800 rounded-full text-sm font-medium cursor-pointer">PG-13</span>
                <span className="px-4 py-1.5 bg-white rounded-full text-sm font-medium text-black cursor-pointer">HD</span>
                <span className="px-4 py-1.5 bg-gray-800 rounded-full text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6H4V18H20V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {data?.episodes.length}
                </span>
                <span className="px-4 py-1.5 bg-gray-800 rounded-full text-sm font-medium cursor-pointer">{data.duration}</span>
                <span className="px-4 py-1.5 bg-gray-800 rounded-full text-sm font-medium cursor-pointer">TV</span>
              </div>

              {/* Description */}
              <div className="text-gray-300 mb-8 leading-relaxed">
                <p className={isDescriptionExpanded ? "" : "line-clamp-3"}>
                  {data.description}
                </p>
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-white-500 hover:text-white-800 transition-colors mt-2 font-medium text-lg"
                >
                  {isDescriptionExpanded ? "Show Less" : "+ More"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  className="bg-white text-black hover:bg-black hover:text-white transition-colors px-8 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg shadow-white-600/20"
                  onClick={visitLink}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                  </svg>
                  Watch Now
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 transition-colors px-8 py-3 rounded-full font-medium">
                  Add to List
                </button>
              </div>

              {/* Share Section */}
              <div className="flex items-center gap-6 border-t border-gray-800 pt-6">
                <div className="flex items-center gap-3">
                  <TbWorldShare className="w-6 h-6 text-gray-400 cursor-pointer" />
                  <div>
                    <span className="text-gray-400 text-sm">Share Anime</span>
                    <p className="text-sm font-medium">to your friends</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { platform: 'telegram', icon: TelegramIcon },
                    { platform: 'twitter', icon: Xicon },
                    { platform: 'reddit', icon: Redditicon },
                    { platform: 'discord', icon: Discordicon }
                  ].map(({ platform, icon }) => (
                    <button
                      key={platform}
                      className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center overflow-hidden"
                    >
                      <Image
                        src={icon}
                        alt={`Share on ${platform}`}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Additional Info */}
            <div className="lg:w-1/4">
              <div className="bg-gray-900/50 rounded-xl p-6 space-y-4">
                <InfoItem label="Japanese" value={data.japaneseTitle} />
                <InfoItem label="Synonyms" value="OP" />
                <InfoItem label="Premiered" value={data.premiered || "Fall 1999"} />
                <InfoItem label="Duration" value={data.duration} />
                <InfoItem label="Status" value={data.status || "Currently Airing"} />

                {/* Genres */}
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-semibold mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Shounen'].map((genre) => (
                      <button
                        key={genre}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 transition-colors rounded-full text-sm"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);
