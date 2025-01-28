import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Shuffle,
  Share,
} from "lucide-react";

type PlayerControlsProps = {
  isPlaying: boolean;
  played: number;
  duration: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onShare: () => void;
  onSeekMouseDown: () => void;
  onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void;
};

export function PlayerControls({
  isPlaying,
  played,
  duration,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onShare,
  onSeekMouseDown,
  onSeekChange,
  onSeekMouseUp,
}: PlayerControlsProps) {
  const formatTime = (seconds: number) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;
  };

  const buttonStyle = {
    padding: "10px",
    cursor: "pointer",
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
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
          onMouseDown={onSeekMouseDown}
          onChange={onSeekChange}
          onMouseUp={onSeekMouseUp}
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
        <button onClick={onShuffle} style={buttonStyle} aria-label="Shuffle">
          <Shuffle size={24} />
        </button>
        <button onClick={onPrevious} style={buttonStyle} aria-label="Previous">
          <SkipBack size={24} />
        </button>
        <button
          onClick={onPlayPause}
          style={buttonStyle}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={onNext} style={buttonStyle} aria-label="Next">
          <SkipForward size={24} />
        </button>
        <button onClick={onShare} style={buttonStyle} aria-label="Share">
          <Share size={24} />
        </button>
      </div>
    </div>
  );
}
