import { useEffect } from "react";

type TweetEmbedProps = {
  tweetUrl: string;
};

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  useEffect(() => {
    if (window.twttr) {
      window.twttr.widgets.load();
    }
  }, [tweetUrl]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "120px",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "550px",
        width: "100%",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "12px",
        margin: "0 10px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 50,
      }}
    >
      <blockquote
        className="twitter-tweet"
        data-conversation="none"
        data-theme="light"
        data-cards="hidden"
        data-chrome="transparent nofooter noborders noheader"
      >
        <a href={tweetUrl}></a>
      </blockquote>
    </div>
  );
}
