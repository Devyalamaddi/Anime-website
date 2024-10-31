'use client'
import React, { useState, useRef, useEffect } from 'react';
import 'plyr/dist/plyr.css';
import axios from 'axios';
import Link from 'next/link';
import Hls from 'hls.js';
import { useSearchParams } from 'next/navigation';
import Plyr from 'plyr';


type QualityLevels = '360' | '480' | '720' | '1080';

interface Episode {
  id: string;     // Unique identifier for the episode
  number: number; // Episode number
  url: string;    // URL of the episode
}

const VideoPlayer = () => {


  const [videoUrl, setVideoUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedSources = localStorage.getItem('sources') || '{}';
      const parsedSources = JSON.parse(storedSources) as { sources: { url: string }[] };
      const url = parsedSources?.sources?.[4]?.url;
      return url || "";
    }
    return "";
  });

  //All use state State variables
  type PlayerType = { destroy: () => void } | null;
  type HLSType = { destroy: () => void } | null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<PlayerType>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [episodeRange, setEpisodeRange] = useState(0);
  const hlsRef = useRef<HLSType>(null);
  const searchparams = useSearchParams();
  const epid = searchparams.get('epid')



  //set the currentEpisodeNumber to highlight that button/link
  useEffect(() => {
    if (epid) {
      const currentEpisodeNumber = parseInt(epid.split('episode-')[1]);
      setSelectedEpisode(currentEpisodeNumber);
    }
  }, [epid]);


  //Load anime-info from localStorage
  const [animeData, setAnimeData] = useState(() => {
    if (typeof window !== 'undefined') {
      const unmodified = localStorage.getItem('animeInfo');
      return unmodified ? JSON.parse(unmodified) : null;
    }
    return null;
  });

  const destroyPlayer = () => {
    try {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (hlsRef.current) {

        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };


  //creates a video element dynamically
  const createVideoElement = () => {
    const videoElement = document.createElement('video');
    videoElement.className = "plyr-react plyr w-full h-full";
    videoElement.crossOrigin = "anonymous";
    videoElement.playsInline = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(videoElement);
    }
    return videoElement;
  };

  const fetchsources = async (epid: string) => {
    try {
      const sources = await axios.get(`/api/episodeSources/${epid}`);
      const servers = await axios.get(`/api/episodeServers/${epid}`)
      console.log(servers)
      return sources;
    } catch (error) {
      console.error('Error fetching sources:', error);
      setError('Failed to fetch video sources');
      throw error;
    }
  };

  const setepsource = async (epid: string) => {
    try {
      setLoading(true);
      setError(null);
      destroyPlayer();

      const response = await fetchsources(epid);
      const sources = JSON.stringify(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sources', sources);
      }
      const url = response.data.sources[4].url;
      setVideoUrl(url)
    } catch (error) {
      setError('Failed to load episode');
      console.error('Error setting episode source:', error);
    }
  };

  //Scraping Download Links from vidstream



  useEffect(() => {
    if (!videoUrl) return;

    const initializePlayer = async () => {
      try {
        destroyPlayer();
        const videoElement = createVideoElement();
        videoRef.current = videoElement;
        const sources = JSON.parse(localStorage.getItem('sources') || '{}');

        const hlssources = {
          360: sources.sources[0].url,
          480: sources.sources[1].url,
          720: sources.sources[2].url,
          1080: sources.sources[3].url,

        }
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxLoadingDelay: 4,
            startLevel: -1
          });

          hlsRef.current = hls;
          hls.attachMedia(videoElement);
          hls.loadSource(videoUrl);
          const options =
          {
            controls: [
              'play-large', 'restart', 'rewind', 'play', 'fast-forward',
              'progress', 'current-time', 'duration', 'mute', 'volume',
              'captions', 'settings', 'pip', 'airplay', 'fullscreen', 'download'
            ],
            settings: [
              'captions', 'quality', 'speed'
            ],
            quality: {
              default: 720,
              options: [360, 480, 720, 1080],
              forced: true,
              onChange: (newQuality: number) => {
                const qualityKey = newQuality.toString() as QualityLevels;
                setVideoUrl(hlssources[qualityKey])
              }
            },
            captions: {
              active: true,
              update: true,
              language: 'en'
            }
          }
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const player = new Plyr(videoElement, options);
            player.on('ready', () => setLoading(false));
            player.on('error', (error) => {
              console.error('Plyr error:', error);
              setError('Video playback error');
            });
            playerRef.current = player;
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  destroyPlayer();
                  setError('Failed to load video');
                  break;
              }
            }
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.src = videoUrl;
          const player = new Plyr(videoElement, {
            controls: [
              'play-large', 'restart', 'rewind', 'play', 'fast-forward',
              'progress', 'current-time', 'duration', 'mute', 'volume',
              'captions', 'settings', 'pip', 'airplay', 'fullscreen', 'download'
            ],
            quality: {
              default: 720,
              options: [360, 480, 720, 1080],
            },
            captions: {
              active: true,
              language: 'en'
            }
          });
          playerRef.current = player;
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing video player:', error);
        setError('Failed to initialize video player');
        setLoading(false);
      }
    };

    initializePlayer();

    return () => {
      destroyPlayer();
    };
  }, [videoUrl]);

  if (!animeData) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black/50 backdrop-blur-md">
      <div className="flex flex-col md:flex-row flex-1 p-2 md:p-4 gap-2 md:gap-4">
        {/* Episodes Panel */}
        <div className="w-full md:w-72 bg-gray-900 rounded-lg flex flex-col order-2 md:order-none">
          <div className="p-3 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Episodes</h2>
          </div>
          <div className="p-2 overflow-y-auto md:h-[calc(100vh-8rem)]">
            {animeData.episodes.length > 100 && (
              <select
                className="mb-2 w-full p-2 bg-white text-black rounded"
                onChange={(e) => setEpisodeRange(parseInt(e.target.value, 10))}
                value={episodeRange}
              >
                {Array.from(
                  { length: Math.ceil(animeData.episodes.length / 100) },
                  (_, i) => i
                ).map((rangeIndex) => (
                  <option key={rangeIndex} value={rangeIndex} className='hover:bg-white' >
                    Episodes {rangeIndex * 100 + 1} - {Math.min((rangeIndex + 1) * 100, animeData.episodes.length)}
                  </option>
                ))}
              </select>
            )}

            <div className="grid grid-cols-8 md:grid-cols-5 gap-1 mx-1">
              {animeData.episodes
                .slice(episodeRange * 100, (episodeRange + 1) * 100)
                .map((episode: Episode, index: number) => {
                  const episodeNumber = episodeRange * 100 + index + 1;
                  const isCurrentEpisode = parseInt(episode.id.split('episode-')[1]) === selectedEpisode;

                  return (
                    <Link
                      key={episode.id}
                      href={{
                        pathname: `/watch/${animeData.id}`,
                        query: { epid: episode.id }
                      }}
                      onClick={() => {
                        setepsource(episode.id);
                        setSelectedEpisode(episodeNumber);
                      }}
                    >
                      <div
                        className={`
                  w-full aspect-square flex items-center justify-center
                  ${isCurrentEpisode
                            ? 'bg-white text-black font-semibold'
                            : 'bg-black hover:bg-gray-700 text-white font-semibold'
                          }
                  cursor-pointer rounded transition-colors
                  text-xs font-medium
                `}
                      >
                        {episodeNumber}
                      </div>
                    </Link>
                  );
                })}
            </div>          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video  rounded-lg overflow-hidden w-full md:flex-1 order-1 md:order-none">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center ">
              <div className="text-white bg-red-500/80 px-4 py-2 rounded">
                {error}
              </div>
            </div>
          )}

          <div ref={containerRef} className="w-full  h-full" />
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-[22%] bg-gray-900 rounded-lg overflow-hidden order-3 md:order-none">
          <div className="h-auto md:h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex md:block">
              <img
                src={animeData.image}
                alt={animeData.title}
                className="w-32 h-48 md:w-full md:h-auto object-cover"
              />

              <div className="flex-1 p-4 space-y-4">
                <div>
                  <h1 className="text-lg font-bold text-white">{animeData.title}</h1>
                  <h3 className="text-gray-400 text-xs">{animeData.japaneseTitle}</h3>
                </div>

                <div className="flex flex-wrap gap-1">
                  {animeData.genres?.map((genre: string[], index: number) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div>
                  <p className={`text-gray-300 text-xs ${!isDescriptionExpanded && "line-clamp-3"}`}>
                    {animeData.description}
                  </p>
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-blue-400 text-xs mt-1 hover:text-blue-300"
                  >
                    {isDescriptionExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-800">
                  <p className="text-xs">
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-yellow-400 ml-2">{animeData.rating || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-300">
                    <span className="text-gray-400">Premiered:</span>
                    <span className="ml-2">{animeData.premiered}</span>
                  </p>
                  <p className="text-xs text-gray-300">
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2">{animeData.status}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-2 md:p-4">
        <div>
          <h1 className="text-white text-lg font-semibold">Comments</h1>
          <input
            type="text"
            className="mt-2 w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Add a comment..."
          />
        </div>
      </div>
    </div>);
};

export default VideoPlayer;
