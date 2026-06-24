import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API (Requires VITE_GEMINI_API_KEY in .env)
// For local testing, ensure you have a .env file with VITE_GEMINI_API_KEY=your_key
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");
  return new GoogleGenerativeAI(apiKey);
};

const NEXZA_CI_SYSTEM_PROMPT = `
You are an expert B2B Marketing Copywriter and AI Art Director for "Nexza".
Nexza is a company that provides "The Next-Level in Smart Facility Management" solutions.
Brand characteristics: Reliable, Connected, Seamless, Intelligent Future.
Target Audience: C-Level executives, Operations Managers, Facility Managers.
Tone of voice: Professional, B2B, Trustworthy, Modern, Tech-driven (in Thai language).

Your task is to take a raw Idea/Objective from the user and generate:
1. An engaging Topic/Headline.
2. Captions tailored for specific platforms (e.g. LinkedIn for professional network, Facebook for general B2B awareness). Use appropriate emojis and hashtags.
3. A "Master Image Prompt" in English. This prompt will be used in an AI Image Generator (like Midjourney or DALL-E).
   - The Image Prompt MUST strictly enforce Nexza's visual identity:
     - Primary colors: Purple (#8126F4), Teal (#2BAA99), Blue (#0AACFF).
     - Style: Modern, flat vector art OR clean highly-realistic photography of smart buildings/technology.
     - Include visual elements like: 3-color horizontal gradient bars, building forms, arrows, smart dashboards.
     - CRITICAL: Add instructions that the image MUST NOT contain any text or letters (because Thai text fails in AI generation).
     - Output the Master Image Prompt in English.

You MUST return the output ONLY as a raw JSON object with the following structure. Do not include markdown code blocks like \`\`\`json.
{
  "topic": "The generated headline in Thai",
  "captions": {
    "linkedin": "Caption for LinkedIn in Thai...",
    "facebook": "Caption for Facebook in Thai..."
  },
  "master_prompt": "The detailed English master image prompt here..."
}
`;

export async function generateContent(idea, platforms) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' }); // Using 3.5 for high quality
    
    const userPrompt = `
    Raw Idea/Objective: ${idea}
    Target Platforms: ${platforms.join(', ')}
    
    Please generate the Topic, Captions, and Master Image Prompt based on the Nexza CI guidelines.
    Remember to return ONLY a valid JSON string.
    `;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: NEXZA_CI_SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Understood. I will strictly follow the Nexza CI guidelines and return only a JSON object."}] },
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();
    // Clean up potential markdown formatting if the model still includes it
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
