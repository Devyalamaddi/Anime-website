'use client';
import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import React from "react";
import Slider from 'react-slick';
import { Card } from "../ui/card";

interface AnimeData {
  id: string;
  title: string;
  image: string;
  // Add other properties based on your actual data structure
}

interface CategoryData {
  title: string;
  data: AnimeData[];
  loading: boolean;
  error: string | null;
}

function Page() {
  const [categories, setCategories] = useState<Record<string, CategoryData>>({
    recent: { title: 'Recently added', data: [], loading: true, error: null },
    top: { title: 'Trending Now', data: [], loading: true, error: null },
    action: { title: 'Popular in Action', data: [], loading: true, error: null },
    comedy: { title: 'Popular in Comedy', data: [], loading: true, error: null },
    romance: { title: 'Popular in Romance', data: [], loading: true, error: null },
    fantasy: { title: 'Popular in Fantasy', data: [], loading: true, error: null },
  });

  // Keep track of active fetch requests
  const activeRequests = useRef<Record<string, AbortController>>({});

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const updateCategory = useCallback((
    category: string,
    updates: Partial<CategoryData>
  ) => {
    setCategories(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }));
  }, []);

  const fetchData = useCallback(async (
    category: string,
    url: string
  ) => {
    // Cancel any existing request for this category
    if (activeRequests.current[category]) {
      activeRequests.current[category].abort();
    }

    // Create new controller for this request
    const controller = new AbortController();
    activeRequests.current[category] = controller;

    try {
      updateCategory(category, { loading: true, error: null });
      const response = await axios.get<{ results: AnimeData[] }>(url, {
        signal: controller.signal
      });
      updateCategory(category, {
        data: response.data.results,
        loading: false
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled for category:', category);
        return;
      }
      updateCategory(category, {
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      });
    } finally {
      // Clean up the controller reference
      delete activeRequests.current[category];
    }
  }, [updateCategory]);

  useEffect(() => {
    // Define all fetch operations
    const fetchOperations = [
      { category: 'recent', url: '/api/recent-episodes/1/1' },
      { category: 'top', url: '/api/top-airing/1' },
      { category: 'action', url: '/api/genre-search/action/1' },
      { category: 'comedy', url: '/api/genre-search/comedy/1' },
      { category: 'romance', url: '/api/genre-search/romance/1' },
      { category: 'fantasy', url: '/api/genre-search/fantasy/1' },
    ];

    // Execute all fetch operations concurrently
    fetchOperations.forEach(({ category, url }) => {
      fetchData(category, url);
    });

    // Cleanup function
    return () => {
      // Cancel only active requests when component unmounts
      Object.values(activeRequests.current).forEach(controller => {
        controller.abort();
      });
      activeRequests.current = {};
    };
  }, [fetchData]);

  const renderCategory = useCallback(({ title, data, loading, error }: CategoryData) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[600px]">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[600px] text-red-500">
          {error}
        </div>
      );
    }

    return data.map((item) => (
      <div key={item.id} className="inline-block min-w-[350px]">
        <Card item={item} />
      </div>
    ));
  }, []);

  const { top, ...otherCategories } = categories;

  return (
    <div className="bg-black">
      <div className="container mx-auto p-10">
        <h1 className="text-white text-3xl font-bold py-4">{top.title}</h1>
        {top.loading ? (
          <div className="h-[600px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : top.error ? (
          <div className="h-[600px] flex items-center justify-center text-red-500">
            {top.error}
          </div>
        ) : (
          <Slider {...sliderSettings}>
            {top.data.map((item) => (
              <div key={item.id} className="h-[600px] overflow-hidden">
                <Card item={item} />
              </div>
            ))}
          </Slider>
        )}
      </div>

      {Object.entries(otherCategories).map(([key, category]) => (
        <div key={key} className="container mx-auto p-10">
          <h1 className="text-white text-3xl font-bold py-4">{category.title}</h1>
          <div className="overflow-x-auto scrollbar-custom flex space-x-4 min-h-[600px]">
            {renderCategory(category)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Page;
