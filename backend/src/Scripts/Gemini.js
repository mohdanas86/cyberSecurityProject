import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Prompt for blog generation
export const cyberPrompt = `You are an expert educational content writer for AnaCGPA. Write a complete blog post in simple, easy-to-understand language—clear enough for a 10-year-old student to read. The writing must feel 100% human-made, natural, warm, helpful, and plagiarism-free. Do NOT use robotic, repetitive, or AI-style phrasing. Avoid overly complex words. Make explanations friendly and simple.

Generate the blog post ONLY in this JSON format:

{
  "title": "",
  "description": "",
  "content": "",
  "excerpt": "",
  "author": "Anas Alam",
  "published": true,
  "featured": false,
  "coverImage": "",
  "keywords": [],
  "tags": [],
  "category": "",
  "readingTime": 0
}

CONTENT RULES (IMPORTANT):

- The entire blog goes inside the "content" field using clean Markdown.
- Do NOT include H1. Start with ## (H2).
- Use only: ##, ###, #### headings.
- Allowed Markdown formatting:
  **bold**, *italic*, ***bold italic***, ~~strikethrough~~,
  inline code \`code\`,
  code blocks with \`\`\` \`\`\` (any language),
  blockquotes ( > ),
  unordered lists (-),
  ordered lists (1. 2. 3.),
  nested lists,
  tables,
  aligned tables,
  horizontal rules (---, ***, ___),
  images ![alt](url),
  links [text](url),
  task lists (- [x], - [ ]).
- Use at least: one table, one code block, one list, one blockquote.
- Write short sentences, simple words, and friendly explanations.
- The blog should be easy for young students but still correct and helpful for older readers.
- Make it plagiarism-free by creating original wording with natural human flow.
- Make it NOT look like AI-written: vary sentence patterns, avoid repeated phrases, and use storytelling where helpful.

CRITICAL - FORBIDDEN SYNTAX (MUST FOLLOW):
- NEVER EVER use curly braces in regular text: NO {word}, NO {Percentage}, NO {value}.
- NEVER use LaTeX math: NO $$, NO $, NO \( \), NO \[ \].
- NEVER use angle brackets in text: NO <variable>, NO <value>.
- Write formulas as plain sentences: "CGPA multiplied by 9.5 equals Percentage".
- For variables write: "the value" or "your CGPA" (not {CGPA} or <CGPA>).
- For sets write: "includes A, B, and C" (not {A, B, C}).
- For placeholders use: "your value here" or "_____" (not {placeholder}).
- ALL content must be parseable as plain Markdown text only.
- If showing a formula, use code blocks with plain text inside.
- If showing sets, use plain text: "The set includes a, b, c" (not {a, b, c}).
- Keep ALL content as standard Markdown only - no special math rendering needed.

BLOG STRUCTURE:

1. Introduction: 2–3 short paragraphs explaining the topic simply.
2. Main Sections (##):
   - What it is
   - Why it matters
   - Steps, formulas, examples
   - Tables and simple comparisons
   - Tips and common mistakes
3. Use examples that are easy for students to understand.
4. End with a friendly conclusion and a simple CTA:
   - https://anacgpa.netlify.app/cgpa-calculator
   - https://anacgpa.netlify.app/tools

SEO RULES:

- Title: Keep it SHORT (max 60 characters) and keyword-focused.
- Title: Focus on main keywords only, avoid filler words like "Easy Guide", "Simple", "For Students".
- Title: Example - Instead of "Easy Guide: How to Calculate CGPA for Students 2024", use "Calculate CGPA: Methods and Formula".
- Description: 150–160 characters, simple and friendly.
- Keywords: 6–12 related terms that match the topic.
- Tags: 3–7 simple tags (e.g., CGPA, GPA, School Tips, Study Help).
- Category: choose the best category for the topic (e.g., "Academic Guides", "CGPA Calculation", "Study Tips").
- readingTime: integer (minutes).

SAFETY RULES:

- All content must be factual, safe for children, positive, helpful, and educational.
- No harmful instructions or misinformation.

JSON FORMATTING RULES (CRITICAL):

- Escape all special characters properly in JSON strings.
- NO line breaks or tab characters inside JSON string values.
- NO control characters (backspace, form feed, etc.).
- Use \\n for newlines in content, not actual line breaks.
- All quotes inside strings must be escaped as \\"
- Return ONLY valid, parseable JSON.

END REQUIREMENT:

Return ONLY the JSON. No commentary. No explanation. No extra text outside the JSON.`;

export async function generateContent(inputTopic) {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2000,
            }
        });

        // Combine the cyberPrompt with the user input topic to create the full prompt
        const fullPrompt = `${cyberPrompt}\n\n User INPUT: ${inputTopic}\n\nGenerate the blog post JSON based on the above requirements.`;

        console.log("Sending prompt to Gemini...");

        // Generate the content using Gemini
        const result = await model.generateContent(fullPrompt);
        console.log("result : ", result)
        const response = result.response;
        console.log("response : ", response)
        const text = response.text();
        console.log("Generated text from Gemini:", text);

        // Parse JSON response
        console.log("Full text length:", text.length);

        // Try to find complete JSON
        let jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            // If no complete JSON found, try to find the start and build it
            const startMatch = text.match(/\{/);
            if (startMatch) {
                console.log("Partial JSON detected, response may be truncated");
                throw new Error("Response truncated - JSON incomplete. Try reducing prompt size or increasing token limit.");
            }
            throw new Error("No JSON found in AI response");
        }

        let generatedContent;
        try {
            generatedContent = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.log("JSON parse error:", parseError.message);
            console.log("Extracted text:", jsonMatch[0].substring(0, 200) + "...");
            throw new Error("Failed to parse JSON response - response may be incomplete");
        }
        return generatedContent;
    } catch (error) {
        console.log("Error generating content:", error);
    }
}