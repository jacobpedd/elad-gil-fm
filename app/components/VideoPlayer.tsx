import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from "react";
import type { ReactPlayerProps } from "react-player";

type VideoPlayerProps = {
  videoId: string;
  isPlaying: boolean;
  onEnded: ReactPlayerProps["onEnded"];
  onProgress: (state: { played: number }) => void;
  onDuration: (duration: number) => void;
};

export type VideoPlayerRef = {
  seekTo: (amount: number) => void;
};

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, isPlaying, onEnded, onProgress, onDuration }, ref) => {
    const playerRef = useRef<any>(null);
    const [ReactPlayer, setReactPlayer] = useState<any>(null);

    useEffect(() => {
      import("react-player/lazy").then((module) => {
        setReactPlayer(() => module.default);
      });
    }, []);

    useImperativeHandle(ref, () => ({
      seekTo: (amount: number) => {
        playerRef.current?.seekTo(amount, "fraction");
      },
    }));

    if (!ReactPlayer) {
      return null;
    }

    return (
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${videoId}`}
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
        onEnded={onEnded}
        onProgress={onProgress}
        onDuration={onDuration}
        progressInterval={100}
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
    );
  }
);
