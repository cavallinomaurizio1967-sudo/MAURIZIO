import { GoogleGenAI, Type } from "@google/genai";
import { ShiftType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseShiftFromText = async (text: string, referenceDate: string): Promise<any> => {
  if (!apiKey) {
    console.warn("API Key not found");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Estrai i dettagli del turno da questo testo: "${text}". La data di riferimento è ${referenceDate}. 
      Se l'utente dice "domani", calcola la data basandoti sulla data di riferimento.
      Cerca riferimenti a pause (es. "pausa pranzo di 30 minuti").
      Se l'utente specifica solo un numero di ore (es. "8 ore di ferie", "4 ore assemblea") senza orario di inizio/fine, usa il campo 'customDuration'.
      Restituisci un JSON valido che corrisponda allo schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
            startTime: { type: Type.STRING, description: "Formato 24 ore HH:mm, stringa vuota se customDuration è usato" },
            endTime: { type: Type.STRING, description: "Formato 24 ore HH:mm, stringa vuota se customDuration è usato" },
            type: { 
              type: Type.STRING, 
              enum: Object.values(ShiftType),
              description: "La categoria del turno"
            },
            description: { type: Type.STRING, description: "Breve descrizione dell'evento" },
            breakMinutes: { type: Type.INTEGER, description: "Durata della pausa in minuti (default 0)" },
            customDuration: { type: Type.NUMBER, description: "Durata totale in ore se non ci sono orari specifici (es. 8)" }
          },
          required: ["type"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return null;
  }
};