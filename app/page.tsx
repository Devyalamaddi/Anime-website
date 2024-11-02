'use client'
import { useState } from 'react';
import SearchBar from './ui/searchBar';

export default function Page() {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchResults = (results: any) => {
    setSearchResults(results);
  };

  return (
    <div
      className="min-h-screen bg-black p-48 sm:p-2 text-white relative"
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
          <SearchBar onResults={handleSearchResults} calledAt="l" />
        </div>
      </div>
    </div>
  );
}
