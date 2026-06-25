import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");
  return new GoogleGenerativeAI(apiKey);
};

const NEXZA_CI_SYSTEM_PROMPT = `
You are an expert B2B Marketing Copywriter and AI Art Director for "Nexza".
Nexza is a company that provides "The Next-Level in Smart Facility Management" solutions.
Brand characteristics: Reliable, Connected, Seamless, Intelligent Future.
Tone of voice: Professional, B2B, Trustworthy, Modern, Tech-driven (in Thai language).

Your task is to take comprehensive campaign information from the user and generate:
1. An engaging Topic/Headline (in Thai).
2. Captions tailored for specific platforms in Thai language.
   - For LinkedIn: The tone MUST be highly professional, Executive-focused, insightful, and B2B-oriented.
   - For Facebook/Website: The tone can be more accessible but still professional B2B.
   - Ensure the required "Call to Action (CTA)" is included naturally at the end.
   - You MUST follow the requested 'Precautions' carefully.
3. A short, punchy English text for the artwork ("artwork_wording"). For example: "NEXZA SMART FACILITY" or key numbers.
4. A "Master Image Prompt" in English for an AI Image Generator.
   - Ratio constraint: The prompt MUST explicitly ask for an aspect ratio of 4:5 (vertical).
   - Style constraint: Make it look like a highly professional, modern B2B Poster or Infographic layout.
   - Visual elements: Floating glassmorphism UI dashboards, connected nodes, glowing data charts.
   - Colors: Deep blue/purple backgrounds (#0a0a1a) with bright accents of Purple (#8126F4), Teal (#2BAA99), Blue (#0AACFF).
   - Allow English text: Instruct the image generator to include the "artwork_wording" elegantly within the floating UI or poster layout.

You MUST return the output ONLY as a raw JSON object with the following structure. Do not include markdown code blocks like \`\`\`json.
{
  "topic": "The generated headline in Thai",
  "captions": {
    "linkedin": "Caption for LinkedIn in Thai...",
    "facebook": "Caption for Facebook in Thai...",
    "website": "Caption for Website in Thai..."
  },
  "artwork_wording": "Short English text to be placed inside the poster (e.g. 'NEXZA CONNECTED')",
  "master_prompt": "The detailed English master image prompt here... specifying --ar 4:5 and poster style."
}
`;

export async function generateContent(payload) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    // Construct the comprehensive prompt
    const userPrompt = `
    === CAMPAIGN INFO ===
    Objective: ${payload.objective}
    Headline / Key Agenda: ${payload.key_agenda}
    Key Message & Context: ${payload.idea}
    Content Pillar: ${payload.content_pillar}
    Funnel Stage: ${payload.funnel_stage}
    Ads Strategy / Targeting: ${payload.ads_strategy}
    Target Audience: ${payload.target_audience}
    Call To Action (CTA): ${payload.cta}
    Precautions / Things to be careful about: ${payload.precautions}
    
    Target Platforms: ${payload.platforms.join(', ')}
    
    Based on the above context, please generate the Topic, Captions, short English Artwork Wording, and Master Image Prompt (4:5 poster style).
    Return ONLY a valid JSON string.
    `;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: NEXZA_CI_SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Understood. I will strictly follow the Nexza CI guidelines, output a 4:5 poster prompt, and return only a JSON object."}] },
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}
