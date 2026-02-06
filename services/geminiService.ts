
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, Role } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-pro-preview';

const SYSTEM_INSTRUCTION = `You are the "Dungeon Master" of a dynamic, multimodal murder mystery game set in "Vanguard Estate", a 1920s-style mansion. 

SCENARIO: Lord Harrington has been murdered in his locked study during a blackout. 
SUSPECTS:
1. Arthur (The Butler): Stoic, observant, seemingly loyal. Secret: He was being fired that morning.
2. Evelyn (The Niece): Estranged, debt-ridden, sharp-tongued. Secret: She forged her uncle's will.
3. Dr. Aris (The Partner): Nervous scientist. Secret: Harrington was going to expose his fraudulent research.

RULES:
- You play all NPCs. Respond as them in dialogue or as the DM describing scenes.
- Use a suspenseful, noir-inspired tone.
- If the player uploads an image, interpret it as a "clue" found at the scene. Explain its relevance to the case or a suspect's alibi.
- Do not reveal the culprit (Dr. Aris poisoned the brandy, but Arthur moved the glass) until a formal Accusation Report is presented.
- Keep responses concise but atmospheric. Use Markdown for emphasis.

When responding to an accusation, judge it based on logical consistency with the clues provided during the game.`;

export const getDMResponse = async (messages: Message[], currentImage?: string): Promise<string> => {
  const contents = messages.map(msg => ({
    role: msg.role === Role.PLAYER ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // If there's a new image, add it as a part to the last message if user, or create a new part
  let parts: any[] = [{ text: messages[messages.length - 1].content }];
  if (currentImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: currentImage.split(',')[1]
      }
    });
  }

  // Format correctly for Gemini API contents structure
  const conversation = messages.map(msg => {
    const role = msg.role === Role.PLAYER ? 'user' : 'model';
    const textPart = { text: msg.content };
    
    // Check if this specific message had an image
    if (msg.image && msg.role === Role.PLAYER) {
        return {
            role,
            parts: [
                textPart,
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: msg.image.split(',')[1]
                    }
                }
            ]
        };
    }
    return { role, parts: [textPart] };
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: conversation,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 2000 }
      },
    });

    return response.text || "The shadows remain silent...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A sudden static fills your mind... (Connection Error)";
  }
};
