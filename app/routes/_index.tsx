import { useState, useEffect, useRef } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import type { ReactPlayerProps } from "react-player";
import { useLoaderData } from "@remix-run/react";

import { VideoPlayer, type VideoPlayerRef } from "~/components/VideoPlayer";
import { TweetEmbed } from "~/components/TweetEmbed";
import { PlayerControls } from "~/components/PlayerControls";
import tweetsData from "~/tweets.json";

type Tweet = (typeof tweetsData)[number];

type LoaderData = {
  tweets: Tweet[];
};

const STORAGE_KEY = "eladFmPlaylist";

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
  return { tweets: tweetsData };
}

export default function Index() {
  const { tweets } = useLoaderData<LoaderData>();
  const playerRef = useRef<VideoPlayerRef>(null);
  const [shuffledTweets, setShuffledTweets] = useState<Tweet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  // Initialize playlist from local storage or create new one
  useEffect(() => {
    setIsClient(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { playlist, index } = JSON.parse(stored);
        setShuffledTweets(playlist);
        setCurrentIndex(index);
      } else {
        const newPlaylist = shuffleArray(tweets);
        setShuffledTweets(newPlaylist);
        setCurrentIndex(0);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            playlist: newPlaylist,
            index: 0,
          })
        );
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setShuffledTweets(shuffleArray(tweets));
      setCurrentIndex(0);
    }
  }, [tweets]);

  // Update local storage when current index changes
  useEffect(() => {
    if (shuffledTweets.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            playlist: shuffledTweets,
            index: currentIndex,
          })
        );
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [currentIndex, shuffledTweets]);

  const handleEnded: ReactPlayerProps["onEnded"] = () => {
    const nextIndex = (currentIndex + 1) % shuffledTweets.length;
    setCurrentIndex(nextIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const prevIndex =
      (currentIndex - 1 + shuffledTweets.length) % shuffledTweets.length;
    setCurrentIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % shuffledTweets.length;
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
    const value = parseFloat(e.target.value);
    setPlayed(value);
    playerRef.current?.seekTo(value);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    setPlayed(value);
    playerRef.current?.seekTo(value);
  };

  if (shuffledTweets.length === 0) {
    return null;
  }

  const currentTweet = shuffledTweets[currentIndex];
  const tweetUrl = `https://twitter.com/elad/status/${currentTweet.url
    .split("/")
    .pop()}`;

  return (
    <div style={{ position: "relative" }}>
      {isClient && shuffledTweets.length > 0 && (
        <>
          <VideoPlayer
            ref={playerRef}
            videoId={currentTweet.youtubeMetadata.id}
            isPlaying={isPlaying}
            onEnded={handleEnded}
            onProgress={handleProgress}
            onDuration={handleDuration}
          />
          <TweetEmbed tweetUrl={tweetUrl} />
          <PlayerControls
            isPlaying={isPlaying}
            played={played}
            duration={duration}
            onPlayPause={handlePlayPause}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSeekMouseDown={handleSeekMouseDown}
            onSeekChange={handleSeekChange}
            onSeekMouseUp={handleSeekMouseUp}
          />
        </>
      )}
    </div>
  );
}

declare global {
  interface Window {
    twttr: any;
  }
}
