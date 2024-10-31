'use client'

import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { Fade, Zoom } from "react-awesome-reveal";
import Image from "next/image";
import action from '@/public/assets/action.jpg';
import sliceOfLife from '@/public/assets/slice-of-life.png';
import sports from '@/public/assets/sports.png';
import romance from '@/public/assets/romance.png';
import adultCast from '@/public/assets/adult-cast.png';
import comedy from '@/public/assets/comedy.png';
import fantasy from '@/public/assets/fantasy.png';
import crime from '@/public/assets/crime.png';
import drama from '@/public/assets/drama.png';
import horror from '@/public/assets/horror.png';
import scifi from '@/public/assets/sci-fi.png';
import mystery from '@/public/assets/mystery.png';
import mythology from '@/public/assets/mythology.png';
import thriller from '@/public/assets/thriller.jpg';
import suspense from '@/public/assets/suspense.png';
import psychological from '@/public/assets/psychological.png';
import { StaticImageData } from "next/image";

// Define interfaces for type safety
interface Genre {
  id: string;
  title: string;
  image: StaticImageData;
}

interface Anime {
  id: number;
  title: string;
  // Add other anime properties as needed
}

const genreList: Genre[] = [
  { id: "action", title: "Action", image: action },
  { id: "slice-of-life", title: "Slice of Life", image: sliceOfLife },
  { id: "sports", title: "Sports", image: sports },
  { id: "romance", title: "Romance", image: romance },
  { id: "adult-cast", title: "Adult Cast", image: adultCast },
  { id: "comedy", title: "Comedy", image: comedy },
  { id: "fantasy", title: "Fantasy", image: fantasy },
  { id: "crime", title: "Crime", image: crime },
  { id: "drama", title: "Drama", image: drama },
  { id: "horror", title: "Horror", image: horror },
  { id: "sci-fi", title: "Sci-Fi", image: scifi },
  { id: "mystery", title: "Mystery", image: mystery },
  { id: "mythology", title: "Mythology", image: mythology },
  { id: "thriller", title: "Thriller", image: thriller },
  { id: "suspense", title: "Suspense", image: suspense },
  { id: "psychological", title: "Psychological", image: psychological },
];

function Page(): JSX.Element {
  const [animeList, setAnimeList] = useState<Anime[]>([]);

  const getGenreAnime = async (id: string): Promise<void> => {
    try {
      const response = await axios.get<Anime[]>(`/api/genre-search/${id}/1`);
      setAnimeList(response.data);
      console.log("Anime by genre:", response.data);
    } catch (error) {
      console.error("Error fetching anime by genre:", error);
    }
  };

  return (
    <div className="px-4 md:px-40 py-4">
      <h1 className="text-4xl text-white mt-10 text-center font-bold my-10">
        Watch your type of Animes
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {genreList.map((item) => (
          <Fade key={item.id} direction="up" duration={500}>
            <Link
              href={`/genre/${item.id}`}
              onClick={() => getGenreAnime(item.id)}
              className="bg-black rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 group relative"
            >
              <div className="flex items-center justify-center">
                <Zoom duration={500}>
                  <div className="relative">
                    <Image
                      alt={`${item.title} genre`}
                      src={item.image}
                      width={300}
                      height={300}
                      className="max-h-[400px] object-contain"
                    />
                    {/* Overlay with Explore button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white hover:bg-black text-black hover:text-white px-6 py-2 rounded-full font-extrabold transform scale-95 group-hover:scale-100 transition-transform duration-300">
                        Explore
                      </button>
                    </div>
                  </div>
                </Zoom>
              </div>
              <div className="p-4">
                <h3 className="text-white text-center font-extrabold text-2xl">
                  {item.title}
                </h3>
              </div>
            </Link>
          </Fade>
        ))}
      </div>

      {/* Display anime list */}
      {animeList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-white">Anime Results:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {animeList.map((anime) => (
              <div key={anime.id} className="p-4 border rounded-lg bg-black/50 text-white">
                <h3 className="font-semibold">{anime.title}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;