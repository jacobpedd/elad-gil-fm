// app/routes/index.tsx

import { useRef, useState, useEffect } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import ReactPlayer, { ReactPlayerProps } from "react-player";
import { useLoaderData } from "@remix-run/react";

import tweetsData from "~/tweets.json"; // Adjust the path if necessary

// Define TypeScript types
type Tweet = {
  url: string;
  fullText: string;
  createdAt: string;
  videoUrl: string;
  youtubeMetadata: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    viewCount: string;
    likeCount: string;
    // ...other fields
  };
};

type LoaderData = {
  tweets: Tweet[];
};

export const meta: MetaFunction = () => {
  return [{ title: "Elad Radio" }];
};

export async function loader({ context, params }: LoaderFunctionArgs) {
  // Sort tweets by most recent date
  const sortedTweets = tweetsData.sort(
    (a: Tweet, b: Tweet) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return { tweets: sortedTweets };
}

export default function Index() {
  const { tweets } = useLoaderData<LoaderData>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef<ReactPlayer | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEnded: ReactPlayerProps["onEnded"] = () => {
    const nextIndex = (currentIndex + 1) % tweets.length;
    setCurrentIndex(nextIndex);
    // Automatically play the next video
    playerRef.current?.seekTo(0);
  };

  // Handle Play button click
  const handlePlay = () => {
    playerRef.current?.getInternalPlayer()?.playVideo?.();
  };

  return (
    <div style={{ position: "relative" }} onClick={handlePlay}>
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
          playing={true}
          controls={true}
          loop={false}
          muted={false}
          onEnded={handleEnded}
          config={{
            youtube: {
              playerVars: {
                autoplay: 0,
                controls: 1,
                rel: 0,
                modestbranding: 1,
              },
            },
          }}
        />
      )}
    </div>
  );
}
