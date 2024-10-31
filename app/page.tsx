'use client'
import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from './ui/card';
import React from 'react';

// Types
interface AnimeResult {
  id: string;
  title: string;
  image: string;
  releaseDate?: string;
  url?: string;
  genres?: string[];
  popularity?: number;
}

interface SearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: AnimeResult[];
}

interface Genre {
  id: number;
  name: string;
}

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Search Engine Class
class AnimeSearchEngine {
  private abbreviations: Map<string, string>;
  private controller: AbortController;
  private genres: Genre[] = [];

  constructor() {
    this.abbreviations = new Map([
      ['jjk', 'jujutsu kaisen'],
      ['aot', 'attack on titan'],
      ['sao', 'sword art online'],
      ['bnha', 'my hero academia'],
      ['mha', 'my hero academia'],
      ['fmab', 'fullmetal alchemist brotherhood'],
      ['op', 'one piece'],
      ['db', 'dragon ball'],
      ['nge', 'neon genesis evangelion'],
      ['opm', 'one punch man'],
      ['naruto', 'naruto'],
      ['bleach', 'bleach'],
      ['ds', 'demon slayer'],
      ['kny', 'demon slayer'],
      ['hxh', 'hunter x hunter'],
      ['snk', 'attack on titan'],
      ['fate', 'fate/stay night'],
      ['fsn', 'fate/stay night'],
      ['code geass', 'code geass'],
      ['eva', 'neon genesis evangelion']
    ]);
    this.controller = new AbortController();
    this.initializeGenres();
  }

  private async initializeGenres() {
    try {
      const response = await fetch('https://api.jikan.moe/v4/genres/anime');
      if (response.ok) {
        const data = await response.json();
        this.genres = data.data;
      }
    } catch (error) {
      console.error('Failed to fetch genres:', error);
    }
  }

  public cancelSearch(): void {
    this.controller.abort();
    this.controller = new AbortController();
  }

  public addAbbreviation(shortForm: string, fullName: string): void {
    this.abbreviations.set(shortForm.toLowerCase(), fullName.toLowerCase());
  }

  private expandQuery(query: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    return this.abbreviations.get(normalizedQuery) || normalizedQuery;
  }

  private async searchByGenre(query: string): Promise<AnimeResult[]> {
    const matchingGenres = this.genres.filter(genre =>
      genre.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matchingGenres.length === 0) return [];

    try {
      const results = await Promise.all(
        matchingGenres.map(async genre => {
          const response = await fetch(
            `https://api.jikan.moe/v4/anime?genres=${genre.id}&limit=10`,
            { signal: this.controller.signal }
          );
          if (!response.ok) return [];
          const data = await response.json();
          return data.data.map(this.formatJikanResult);
        })
      );

      return results.flat();
    } catch (error) {
      console.error('Genre search error:', error);
      return [];
    }
  }

  private formatJikanResult(item: any): AnimeResult {
    return {
      id: item.mal_id.toString(),
      title: item.title,
      image: item.images.jpg.large_image_url || item.images.jpg.image_url,
      releaseDate: item.aired?.from ? new Date(item.aired.from).getFullYear().toString() : undefined,
      url: item.url,
      genres: item.genres?.map((g: any) => g.name) || [],
      popularity: item.members || 0
    };
  }

  private rankResults(results: AnimeResult[], query: string): AnimeResult[] {
    const normalizedQuery = query.toLowerCase();
    return results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      // Exact matches
      if (aTitle === normalizedQuery && bTitle !== normalizedQuery) return -1;
      if (bTitle === normalizedQuery && aTitle !== normalizedQuery) return 1;

      // Starts with query
      const aStarts = aTitle.startsWith(normalizedQuery);
      const bStarts = bTitle.startsWith(normalizedQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Contains query
      const aContains = aTitle.includes(normalizedQuery);
      const bContains = bTitle.includes(normalizedQuery);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      // Fall back to popularity
      return (b.popularity || 0) - (a.popularity || 0);
    });
  }

  public async search(
    query: string,
    page: number
  ): Promise<SearchResponse> {
    if (!query.trim()) {
      throw new Error('Empty search query');
    }

    const expandedQuery = this.expandQuery(query);
    let results: AnimeResult[] = [];

    try {
      // Try main API first
      const response = await fetch(
        `/api/search/${encodeURIComponent(expandedQuery)}/${page}`,
        { signal: this.controller.signal }
      );

      if (!response.ok) {
        // Search by genre
        const genreResults = await this.searchByGenre(expandedQuery);

        // Fallback to Jikan API for title search
        const fallbackResponse = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(expandedQuery)}&page=${page}&limit=20`
        );

        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch search results');
        }

        const fallbackData = await fallbackResponse.json();
        const titleResults = fallbackData.data.map(this.formatJikanResult);

        // Combine and rank results
        results = [...new Map([...genreResults, ...titleResults].map(item =>
          [item.id, item]
        )).values()];

        results = this.rankResults(results, expandedQuery);

        return {
          results: results,
          hasNextPage: fallbackData.pagination.has_next_page,
          currentPage: fallbackData.pagination.current_page
        };
      }

      const mainApiResponse = await response.json();
      results = this.rankResults(mainApiResponse.results, expandedQuery);
      return { ...mainApiResponse, results };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Search cancelled');
      }
      throw error;
    }
  }
}

// Component JSX remains the same as before, but with added genre filter UI
export default function Home() {
  // Existing states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Create search engine instance
  const searchEngine = useMemo(() => new AnimeSearchEngine(), []);

  // Use debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const performSearch = async (query: string, page: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResponse = await searchEngine.search(query, page);

      // Filter by selected genres if any
      const filteredResults = selectedGenres.length > 0
        ? searchResponse.results.filter(anime =>
          anime.genres?.some(genre => selectedGenres.includes(genre))
        )
        : searchResponse.results;

      if (page === 1) {
        setSearchResults(filteredResults);
      } else {
        setSearchResults(prev => [...prev, ...filteredResults]);
      }

      setHasNextPage(searchResponse.hasNextPage);
      setCurrentPage(searchResponse.currentPage);
    } catch (err) {
      if (err instanceof Error && err.message !== 'Search cancelled') {
        setError(err.message || 'An error occurred while searching');
        if (page === 1) setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };
  // Effect for auto-search on debounced query change
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery, 1);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, 1);
  };
  const handleGenreSelect = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    if (searchQuery) {
      performSearch(searchQuery, 1);
    }
  };

  const loadMoreResults = () => {
    if (!hasNextPage || isSearching) return;
    performSearch(searchQuery, currentPage + 1);
  };

  return (
    <div
      className="min-h-screen bg-black p-48 text-white relative"
      style={{
        backgroundImage: "url('https://wallpapergod.com/images/hd/dark-anime-1920X1200-wallpaper-hap3kxf8czba91pc.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-center font-bold text-6xl mb-8">ANIME HUB</h1>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anime..."
                className="w-full md:w-96 px-4 py-2 rounded-l-lg border focus:outline-none bg-transparent border-white text-white placeholder:text-gray-300"
              />
              <button
                type="submit"
                className="bg-white px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={isSearching}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197M16.804 15.804A7.5 7.5 0 1111.196 5.196a7.5 7.5 0 015.608 10.608z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {isSearching && (
            <div className="text-center mb-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white" />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center mb-8">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="max-w-10xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Search Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-24 relative">
                {searchResults.map((anime) => (
                  <div key={anime.id} className="relative" style={{ minHeight: '300px' }}>
                    <Card item={anime} />
                  </div>
                ))}
              </div>

              {hasNextPage && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreResults}
                    disabled={isSearching}
                    className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!searchResults.length && !isSearching && !error && (
            <>
              <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
                Find your favorite anime shows and movies. Immerse yourself in the world of captivating stories and stunning animation.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/home"
                  className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-black hover:text-white hover:border hover:border-white transition-all duration-300"
                >
                  Watch Anime
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
