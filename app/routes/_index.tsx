import { useRef, useState, useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import ReactPlayer, { ReactPlayerProps } from "react-player";
import { useLoaderData } from "@remix-run/react";
import { SkipBack, SkipForward, Play, Pause } from "lucide-react";

import tweetsData from "~/tweets.json";
type Tweet = (typeof tweetsData)[number];

type LoaderData = {
  tweets: Tweet[];
};

export const meta: MetaFunction = () => {
  return [{ title: "Elad Radio" }];
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function loader({ context, params }: LoaderFunctionArgs) {
  const shuffledTweets = shuffleArray(tweetsData);
  return { tweets: shuffledTweets };
}

export default function Index() {
  const { tweets } = useLoaderData<LoaderData>();
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * tweets.length)
  );
  const playerRef = useRef<ReactPlayer | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEnded: ReactPlayerProps["onEnded"] = () => {
    const nextIndex = (currentIndex + 1) % tweets.length;
    setCurrentIndex(nextIndex);
    playerRef.current?.seekTo(0);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + tweets.length) % tweets.length;
    setCurrentIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % tweets.length;
    setCurrentIndex(nextIndex);
  };

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const target = e.target as HTMLInputElement;
    playerRef.current?.seekTo(parseFloat(target.value));
  };

  const formatTime = (seconds: number) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;
  };

  return (
    <div style={{ position: "relative" }}>
      {isClient && tweets.length > 0 && (
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${tweets[currentIndex].youtubeMetadata.id}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true}
          loop={false}
          muted={false}
          onEnded={handleEnded}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            youtube: {
              playerVars: {
                autoplay: 0,
                controls: 0,
                rel: 0,
                modestbranding: 1,
              },
            },
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          height: "100px",
          background: "rgba(255, 255, 255, 0.9)",
          zIndex: 100,
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 20px",
          }}
        >
          <span style={{ minWidth: "50px" }}>
            {formatTime(duration * played)}
          </span>
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: `linear-gradient(to right, #1a73e8 ${
                played * 100
              }%, #e6e6e6 ${played * 100}%)`,
              cursor: "pointer",
            }}
          />
          <span style={{ minWidth: "50px" }}>{formatTime(duration)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={handlePrevious}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Previous"
          >
            <SkipBack size={24} />
          </button>
          <button
            onClick={handlePlayPause}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Next"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
