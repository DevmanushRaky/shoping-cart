// src/services/chatService.ts

// --- Types ---
export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// --- Local Storage Chat Management ---
export function getChats(): Chat[] {
  return JSON.parse(localStorage.getItem('chats') || '[]');
}

export function saveChats(chats: Chat[]): void {
  localStorage.setItem('chats', JSON.stringify(chats));
}

export function createNewChat(title = 'New Chat'): Chat {
  return { id: Date.now().toString(), title, messages: [] };
}

// --- Gemini API ---
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(question: string): Promise<string> {
  console.log("[Gemini] Sending question:", question);
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }]
    })
  });
  console.log("[Gemini] Raw response:", response);
  let data;
  try {
    data = await response.json();
    console.log("[Gemini] Parsed JSON:", data);
  } catch (err) {
    console.error("[Gemini] Failed to parse JSON:", err);
    return "Sorry, there was a problem with the assistant's response.";
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get an answer.";
}


