import { useRef } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

type VideoPlayerProps = {
  videoId: string;
  isPlaying: boolean;
  onEnded: ReactPlayerProps["onEnded"];
  onProgress: (state: { played: number }) => void;
  onDuration: (duration: number) => void;
};

export function VideoPlayer({
  videoId,
  isPlaying,
  onEnded,
  onProgress,
  onDuration,
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer | null>(null);

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
