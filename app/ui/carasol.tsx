"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IAnimeResult } from "@consumet/extensions";
import { Card } from "./card";
import { usePathname, useParams } from "next/navigation";
import next from "@/public/assets/next.png";
import previous from "@/public/assets/previous.png";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import load from '@/public/assets/loadingluffy2.gif';

interface AnimeResponse {
  currentPage: string | number;
  hasNextPage: boolean;
  results: IAnimeResult[];
}

interface RequestState {
  controller: AbortController;
  pageNumber: number;
}

export default function Carousel() {
  const [animeList, setAnimeList] = useState<IAnimeResult[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const params = useParams();

  // Keep track of current request
  const activeRequestRef = useRef<RequestState | null>(null);

  const ROUTE_CONFIG = {
    "/movies": {
      title: "Recent Anime Movies",
      endpoint: `/api/movies`,
    },
    "/anime-list": {
      title: "List of Anime",
      endpoint: "/api/anime-list",
    },
    "/most-popular": {
      title: "Most Popular Anime",
      endpoint: "/api/most-popular",
    },
    "/top-airing": {
      title: "Top Airing Anime",
      endpoint: "/api/top-airing",
    },
    "/genre": {
      title: "Explore various genres of anime",
      endpoint: "/api/genre",
    }
  } as const;

  //Pagination
  // PaginationButton Component with hover effect
  const PaginationButton = ({ page, isActive, onClick }: { page: number, isActive: boolean, onClick: () => void }) => {
    return (
      <motion.button
        onClick={onClick}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive
          ? "bg-gray-800 text-white hover:bg-gray-700"
          : "bg-white text-black hover:bg-gray-200"
          }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Go to page ${page}`}
      >
        {page}
      </motion.button>
    );
  };

  // Simplified Pagination Component with fade/slide animation
  const Pagination = () => {
    const maxPage = 50; // We'll show up to 5 pages based on hasNextPage
    const currentPageNum = Number(currentPage);

    const renderPageNumbers = () => {
      const pageNumbers = [];
      const totalVisible = hasNextPage ? Math.min(currentPageNum + 1, maxPage) : currentPageNum;

      for (let i = 1; i <= totalVisible; i++) {
        pageNumbers.push(
          <AnimatePresence key={i}>
            <PaginationButton
              page={i}
              isActive={currentPageNum === i}
              onClick={() => setCurrentPage(i)}
            />
          </AnimatePresence>
        );
      }

      return pageNumbers;
    };
    return (
      <div className="bg-black flex justify-center space-x-2 mt-6 flex-wrap">
        <AnimatePresence>
          {currentPageNum > 1 && (
            <motion.button
              key="previous"
              onClick={() => setCurrentPage(currentPageNum - 1)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-200 ${currentPageNum === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous page"
            >
              <Image src={previous} alt="Previous" width={24} height={24} />
            </motion.button>
          )}
        </AnimatePresence>
        {renderPageNumbers()}
        <AnimatePresence>
          {hasNextPage && (
            <motion.button
              key="next"
              onClick={() => setCurrentPage(currentPageNum + 1)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-200 ${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next page"
            >
              <Image src={next} alt="Next" width={24} height={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }



  // Cleanup function to abort previous request
  const cleanupPreviousRequest = useCallback(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current.controller.abort();
      activeRequestRef.current = null;
    }
  }, []);

  const fetchAnimeData = useCallback(async (page: number) => {
    // Clean up any existing request
    cleanupPreviousRequest();

    // Create new abort controller for this request
    const controller = new AbortController();
    activeRequestRef.current = {
      controller,
      pageNumber: page
    };

    try {
      setLoading(true);
      setError(null);

      let response: Response;

      // Handle genre-specific fetching
      if (pathname.startsWith('/genre/') && params.id) {
        response = await fetch(
          `/api/genre-search/${params.id}/${page}`,
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'max-age=3600',
              'Pragma': 'no-cache'
            }
          }
        );
      } else {
        // Handle other routes
        const config = ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG];
        if (!config) {
          throw new Error('Invalid route configuration');
        }

        response = await fetch(
          `${config.endpoint}/${page}`,
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'max-age=3600',
              'Pragma': 'no-cache'
            }
          }
        );
      }

      // Check if this request is still active
      if (
        !activeRequestRef.current ||
        activeRequestRef.current.pageNumber !== page
      ) {
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch anime data (Status: ${response.status})`);
      }

      const data: AnimeResponse = await response.json();

      // Check again if this request is still active before updating state
      if (
        !activeRequestRef.current ||
        activeRequestRef.current.pageNumber !== page
      ) {
        return;
      }

      setAnimeList(prevList => {
        // Deduplicate results based on ID
        const newIds = new Set(data.results.map(item => item.id));
        const filteredPrevList = prevList.filter(item => !newIds.has(item.id));
        return [...filteredPrevList, ...data.results];
      });

      setHasNextPage(data.hasNextPage);
      setCurrentPage(Number(data.currentPage));

    } catch (err) {
      // Only set error if this request is still active and it's not an abort error
      if (
        activeRequestRef.current?.pageNumber === page &&
        err instanceof Error &&
        err.name !== "AbortError"
      ) {
        setError(err.message);
        console.error("Error fetching anime:", err);
      }
    } finally {
      // Only update loading state if this request is still active
      if (activeRequestRef.current?.pageNumber === page) {
        setLoading(false);
      }
    }
  }, [pathname, params.id, cleanupPreviousRequest]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      cleanupPreviousRequest();
    };
  }, [cleanupPreviousRequest]);

  // Fetch data effect with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAnimeData(currentPage);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      cleanupPreviousRequest();
    };
  }, [pathname, currentPage, params.id, fetchAnimeData, cleanupPreviousRequest]);

  const getTitle = useCallback(() => {
    if (pathname.startsWith('/genre/') && params.id) {
      return `Anime in Genre`;
    }
    return ROUTE_CONFIG[pathname as keyof typeof ROUTE_CONFIG]?.title ?? "Anime Collection";
  }, [pathname, params.id]);

  return (
    <div className="lg:px-48 bg-black">
      <div className="p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {getTitle()}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {animeList.map((item, index) => (
            <div key={item.id || index}>
              <Card item={item} />
            </div>
          ))}
        </div>

        {loading && (
          <div className="justify-center">
            <Image src={load} alt="loading" height={400} width={400} className="mx-auto" />
          </div>
        )}
        {error && <div className="text-red-500 text-center">Error: {error}</div>}
        {!loading && animeList.length > 0 && <Pagination />}
      </div>
    </div>
  );
}

