import { ApifyClient } from "apify-client";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Initialize the ApifyClient with API token
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Prepare Actor input
const input = {
  maxItems: 1000,
  sort: "Latest",
  startUrls: [
    "https://x.com/search?q=filter%3Alinks%20from%3Aeladgil%20youtube.com&f=live",
  ],
};

(async () => {
  // Run the Actor and wait for it to finish
  const run = await client.actor("61RPP7dywgiy0JPD0").call(input);

  // Fetch and print Actor results from the run's dataset (if any)
  console.log("Results from dataset");
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  items.forEach((item) => {
    console.log(
      item.entities["urls"].length > 0
        ? item.entities["urls"][0]["expanded_url"]
        : null
    );
  });

  const tweets = items.map((item) => ({
    url: item.url,
    fullText: item.fullText,
    createdAt: item.createdAt,
    videoUrl: item.entities["urls"]
      .map((url) => url["expanded_url"])
      .find((url) => url.includes("youtube.com") || url.includes("youtu.be")),
  }));

  const fileName = "tweets.json";
  fs.writeFileSync(fileName, JSON.stringify(tweets, null, 2));

  console.log(`Saved ${tweets.length} tweets to tweets.json`);
})();
