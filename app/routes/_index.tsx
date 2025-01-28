import { useState, useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import type { ReactPlayerProps } from "react-player";
import { useLoaderData } from "@remix-run/react";

import { VideoPlayer } from "~/components/VideoPlayer";
import { TweetEmbed } from "~/components/TweetEmbed";
import { PlayerControls } from "~/components/PlayerControls";
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
    setPlayed(parseFloat(target.value));
  };

  const currentTweet = tweets[currentIndex];
  const tweetUrl = `https://twitter.com/elad/status/${currentTweet.url
    .split("/")
    .pop()}`;

  return (
    <div style={{ position: "relative" }}>
      {isClient && tweets.length > 0 && (
        <>
          <VideoPlayer
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
    twttr: {
      widgets: {
        load: () => void;
      };
    };
  }
}
