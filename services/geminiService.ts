
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Question, QuestionType, TestType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const QUESTION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      text: { type: Type.STRING },
      type: { type: Type.STRING },
      marks: { type: Type.INTEGER },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING },
      section: { type: Type.STRING }
    },
    required: ["id", "text", "type", "marks", "correctAnswer", "explanation", "section"]
  }
};

function safeParseJSON(text: string) {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parsing Error:", text);
    throw new Error("AI output format error. Retrying...");
  }
}

async function generateBatch(prompt: string): Promise<Question[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: QUESTION_SCHEMA,
    },
  });

  const parsed = safeParseJSON(response.text || "[]");
  return parsed.map((q: any) => ({
    ...q,
    correctAnswer: q.type === QuestionType.MSQ ? q.correctAnswer.split(',').map((s: string) => s.trim()) : q.correctAnswer
  }));
}

export const generateGatePaper = async (
  subject: string, 
  difficulty: Difficulty, 
  testType: TestType,
  onProgress: (msg: string) => void
): Promise<Question[]> => {
  const seed = Date.now(); // Ensure non-repeating questions via prompt entropy
  
  if (testType === TestType.APTITUDE) {
    onProgress("Crafting Focused Aptitude Paper...");
    const prompt = `Generate exactly 15 unique GATE Aptitude questions (mix 1 and 2 marks). 
      Difficulty: ${difficulty}. Topics: Verbal, Quant, Logical. Seed: ${seed}. Section: "General Aptitude"`;
    return await generateBatch(prompt);
  }

  onProgress("Initializing Full 100-Mark Marathon...");
  const tasks = [
    { name: "Aptitude", p: `Generate 10 unique Aptitude questions (5x1m, 5x2m). Difficulty: ${difficulty}. Seed: ${seed}-1.` },
    { name: "Foundations", p: `Generate 15 fundamental Technical questions (1m) for ${subject}. Difficulty: ${difficulty}. Seed: ${seed}-2.` },
    { name: "Core", p: `Generate 20 advanced Technical questions (2m) for ${subject}. Difficulty: ${difficulty}. Seed: ${seed}-3.` },
    { name: "Applications", p: `Generate 20 complex multi-concept questions (mix 1m, 2m) for ${subject}. Difficulty: ${difficulty}. Seed: ${seed}-4.` }
  ];

  const results = await Promise.all(tasks.map(t => generateBatch(t.p)));
  let allQuestions = results.flat();

  return allQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));
};

export const analyzePerformance = async (userAnswers: any[]): Promise<any> => {
  const prompt = `Analyze these GATE mock test results and provide 3-5 high-impact improvement areas: ${JSON.stringify(userAnswers)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          sectionPerformance: { type: Type.ARRAY, items: { 
            type: Type.OBJECT, 
            properties: { section: { type: Type.STRING }, feedback: { type: Type.STRING } } 
          } }
        }
      }
    }
  });
  return safeParseJSON(response.text || "{}");
};
