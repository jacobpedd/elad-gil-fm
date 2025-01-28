import { TwitterTweetEmbed } from "react-twitter-embed";

type TweetEmbedProps = {
  tweetUrl: string;
};

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  // Extract tweet ID from the URL
  const tweetId = tweetUrl.split("/").pop() || "";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "120px",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "550px",
        width: "100%",
        zIndex: 50,
      }}
    >
      <TwitterTweetEmbed
        tweetId={tweetId}
        key={tweetId}
        options={{
          theme: "light",
          cards: "hidden",
          conversation: "none",
          align: "center",
          chrome: "transparent nofooter noborders noheader",
        }}
      />
    </div>
  );
}
