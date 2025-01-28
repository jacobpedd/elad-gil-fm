import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ClassificationSchema = z.object({
  classification: z.enum(["music/ambient audio", "other"]),
});

async function classifyVideo(metadata) {
  if (!metadata) {
    return "unknown";
  }

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that classifies YouTube videos into categories: 'music/ambient audio' or 'other'.",
        },
        {
          role: "user",
          content: `
    Extract the classification of the YouTube video based on the following metadata.
    
    Title: ${metadata.title}
    Description: ${metadata.description}
    Tags: ${metadata.tags.join(", ")}
    
    Classify the video as either "music/ambient audio" or "other". Respond with a JSON object in the following format:
    {
      "classification": "music/ambient audio" // or "other"
    }
          `,
        },
      ],
      response_format: zodResponseFormat(
        ClassificationSchema,
        "classification"
      ),
    });

    const classification = completion.choices[0].message.parsed;

    return classification;
  } catch (error) {
    console.error("Error classifying video:", error);
    return "unknown";
  }
}

(async () => {
  try {
    // Step 1: Load tweets from enhanced_tweets.json
    const tweetsData = await fs.readFile("tweets.json", "utf8");
    const tweets = JSON.parse(tweetsData);

    // Step 2: Process each tweet and classify
    const musicTweets = [];
    for (const tweet of tweets) {
      if (!tweet.videoUrl) {
        continue;
      }

      const metadata = tweet.youtubeMetadata;
      if (!metadata) {
        continue;
      }

      console.log(`Classifying video: ${metadata.title}`);
      const classification = await classifyVideo(metadata);
      if (classification.classification === "music/ambient audio") {
        musicTweets.push(tweet);
      }
    }

    // Step 4: Save results to JSON files
    await fs.writeFile("tweets.json", JSON.stringify(musicTweets, null, 2));
    console.log("Classification complete.");
  } catch (error) {
    console.error("Error processing tweets:", error);
  }
})();
