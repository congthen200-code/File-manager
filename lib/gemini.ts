import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Ensure process.env.API_KEY is defined in your environment
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        tags: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: 'A relevant, single-word or short-phrase tag in Vietnamese.'
            },
            description: 'A list of up to 5 relevant tags.'
        }
    },
    required: ['tags']
};

export const generateTagsWithAI = async (text: string): Promise<string[] | null> => {
    if (!text.trim()) {
        return null;
    }
    
    try {
        const prompt = `Dựa trên thông tin chi tiết về tệp sau đây, hãy đề xuất tối đa 5 thẻ phù hợp, ngắn gọn bằng tiếng Việt. Các thẻ nên là một từ hoặc cụm từ ngắn.
Thông tin: "${text}"`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response?.text;
        if (!jsonText) {
            console.warn("AI did not return a valid JSON for tags.");
            return null;
        }
        
        const result = JSON.parse(jsonText.trim());
        
        if (result && Array.isArray(result.tags)) {
            return result.tags;
        }

        return null;

    } catch (error) {
        console.error("Error generating tags with Gemini:", error);
        throw new Error("Failed to generate AI tags.");
    }
};


export const generateDescriptionWithAI = async (fileName: string): Promise<string | null> => {
    if (!fileName.trim()) {
        return null;
    }
    
    try {
        const prompt = `Viết một mô tả ngắn gọn (khoảng 1-2 câu) bằng tiếng Việt cho một tệp hoặc ứng dụng có tên là "${fileName}".`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                // Removed maxOutputTokens as it requires thinkingBudget for gemini-2.5-flash and was causing an empty response.
            },
        });
        
        return response?.text?.trim() ?? null;

    } catch (error) {
        console.error("Error generating description with Gemini:", error);
        throw new Error("Failed to generate AI description.");
    }
};
