import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs/promises"; // Promises-based version of the fs module

dotenv.config(); // Load environment variables from .env

// Load API key from .env
const API_KEY = process.env.YOUTUBE_API_KEY;

// Initialize the YouTube API client
const youtube = google.youtube({
  version: "v3",
  auth: API_KEY,
});

// Function to extract YouTube video IDs from URLs
function extractYouTubeVideoId(videoUrl) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = videoUrl.match(regex);
  return match ? match[1] : null;
}

// Function to fetch metadata for a given YouTube video ID
async function fetchYouTubeMetadata(videoId) {
  try {
    const response = await youtube.videos.list({
      part: "snippet,statistics",
      id: videoId,
    });

    const video = response.data.items[0];
    if (video) {
      return {
        title: video.snippet.title,
        description: video.snippet.description,
        channel: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        tags: video.snippet.tags || [],
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
      };
    }
  } catch (error) {
    console.error(`Error fetching metadata for video ID ${videoId}:`, error);
  }

  return null;
}

(async () => {
  try {
    // Step 1: Load tweets from tweets.json
    const tweetsData = await fs.readFile("tweets.json", "utf8");
    const tweets = JSON.parse(tweetsData);

    // Step 2: Process each tweet and fetch YouTube metadata
    const enhancedTweets = [];
    for (const tweet of tweets) {
      if (!tweet.videoUrl) {
        enhancedTweets.push({ ...tweet, youtubeMetadata: null });
        continue;
      }

      const videoId = extractYouTubeVideoId(tweet.videoUrl);
      if (videoId) {
        console.log(`Fetching metadata for video ID: ${videoId}`);
        const metadata = await fetchYouTubeMetadata(videoId);
        enhancedTweets.push({ ...tweet, youtubeMetadata: metadata });
      } else {
        console.warn(
          `[SKIP] No valid video ID found in URL: ${tweet.videoUrl}`
        );
      }
    }

    // Step 3: Save the enhanced tweet data to a new JSON file
    const outputFileName = "tweets.json";
    await fs.writeFile(outputFileName, JSON.stringify(enhancedTweets, null, 2));
    console.log(`Enhanced tweets saved to ${outputFileName}`);
  } catch (error) {
    console.error("Error processing tweets:", error);
  }
})();
