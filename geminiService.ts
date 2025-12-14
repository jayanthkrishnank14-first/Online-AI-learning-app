import { GoogleGenAI, Type } from "@google/genai";
import { ExamQuestion, QuizQuestion, StudentResult, StudentProfile } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-2.5-flash';

/**
 * Helper: Transcribe Video/Audio
 */
export const transcribeMedia = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Please transcribe the spoken audio in this video verbatim. Ignore background noise and just provide the speech content."
          }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing media:", error);
    throw new Error("Failed to transcribe video. The file might be too large or the format unsupported.");
  }
};

/**
 * step 1: Clean the transcript
 * Removes jokes, fillers, and conversational fluff.
 */
export const cleanTranscript = async (rawText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `You are an expert educational editor. Your task is to clean the following lecture transcript. 
      1. Remove all conversational fillers (um, ah, like).
      2. Remove jokes, off-topic banter, and classroom administrative talk.
      3. Strictly preserve the educational content, facts, and explanations.
      4. The output should be the "Filtered Text" ready for study.
      
      Transcript:
      ${rawText}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error cleaning transcript:", error);
    throw error;
  }
};

/**
 * Step 2: Generate Summary and Real Life Examples
 */
export const generateSummaryAndExamples = async (cleanedText: string): Promise<{ summary: string; examples: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Based on the following educational text, provide a concise summary and 3 distinct real-life examples that help explain the concepts.
      
      Text: ${cleanedText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A comprehensive summary of the lesson." },
            examples: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 real-life analogies or examples explaining the concept."
            }
          },
          required: ["summary", "examples"]
        }
      }
    });

    const text = response.text;
    if (!text) return { summary: "Error generating content.", examples: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating summary:", error);
    return { summary: "Failed to generate summary.", examples: [] };
  }
};

/**
 * Step 3: Generate Exam Questions (1, 2, 3, 4, 5 marks)
 */
export const generateExamQuestions = async (cleanedText: string): Promise<ExamQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Create a set of exam questions based on this filtered educational text. 
      Generate a balanced mix of questions worth 1, 2, 3, 4, and 5 marks.
      - 1-2 marks: Very Short Answer (Definitions, simple facts)
      - 3-4 marks: Short/Medium Answer (Explanations, reasoning)
      - 5 marks: Long Answer (Detailed description, derivation, or complex application)
      
      Include a brief answer key or main points for each question.
      
      Text: ${cleanedText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              marks: { type: Type.INTEGER, description: "Must be 1, 2, 3, 4, or 5" },
              type: { type: Type.STRING, enum: ["Very Short", "Short", "Medium", "Long"] },
              answerKey: { type: Type.STRING, description: "A concise model answer or key points expected in the answer." }
            },
            required: ["question", "marks", "type", "answerKey"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating exam questions:", error);
    return [];
  }
};

/**
 * Step 4: Generate Quiz
 */
export const generateQuiz = async (cleanedText: string): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Create a multiple-choice quiz with 5 questions based on this filtered text to test understanding. Include an explanation for the correct answer.
      
      Text: ${cleanedText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 4 possible answers"
              },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is the right choice." }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

/**
 * Step 5: AI Assistant Chat
 */
export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], currentMessage: string, context: string) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_TEXT,
      history: [
        {
          role: 'user',
          parts: [{ text: `You are a helpful AI tutor assistant. You have access to the following lesson content: "${context}". 
          Your goal is to help the student understand this specific lesson. 
          Track the student's learning behavior. If they seem confused, offer simpler explanations. 
          Always ask for feedback at the end of your explanation, like "Does that make sense?" or "Shall we try another example?"` }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am ready to help the student with this lesson." }]
        },
        ...history
      ],
    });

    const result = await chat.sendMessage({ message: currentMessage });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

/**
 * Step 6: Analyze Progress (Mentor Mode)
 */
export const analyzeProgress = async (
  role: 'STUDENT' | 'TEACHER', 
  data: StudentResult[] | StudentProfile[]
): Promise<string> => {
  try {
    const dataString = JSON.stringify(data);
    let prompt = "";

    if (role === 'STUDENT') {
      prompt = `You are an AI Student Mentor. Analyze the following quiz history for a student: ${dataString}.
      1. Identify the student's strong subjects and weak areas based on scores.
      2. Provide personalized, encouraging advice on what to focus on next.
      3. Suggest specific study strategies (e.g., "Review Newton's laws again").
      Keep the tone motivating and constructive. Output plain text.`;
    } else {
      prompt = `You are an AI Classroom Assistant for a teacher. Analyze the following class performance data: ${dataString}.
      1. Identify students who are falling behind (low scores/attendance).
      2. Suggest topics that the whole class seems to struggle with (if any patterns exist in the dummy data, otherwise invent a plausible trend based on scores).
      3. Recommend intervention strategies for the teacher.
      Keep the tone professional and actionable. Output plain text.`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Analysis error:", error);
    return "I'm having trouble analyzing the data right now.";
  }
};

/**
 * Step 7: Generate Notification
 */
export const generateNotification = async (context: string, role: 'STUDENT' | 'TEACHER'): Promise<string> => {
  try {
    const prompt = role === 'STUDENT' 
      ? `You are a student mentor. Generate a short, motivating study tip or notification (max 20 words) based on this context: "${context}".`
      : `You are a teacher assistant. Generate a short professional alert (max 20 words) based on this context: "${context}".`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    
    return response.text?.trim() || "New update available.";
  } catch (error) {
    console.error("Notification error:", error);
    return "New update available.";
  }
};