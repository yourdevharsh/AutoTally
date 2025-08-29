import {
    GoogleGenerativeAI
} from '@google/generative-ai';
import fs from 'node:fs/promises';
import path from 'path';
import 'dotenv/config';

// Use your API key from environment variables
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

export default async function gemResult(filePath, fields) {
    try {
        const model = gemini.getGenerativeModel({
            model: 'gemini-1.5-flash'
        });
        const mimeType = 'image/jpeg';

        const prompt = `
      Analyze the provided image of a bill or receipt.
      Extract the following fields: ${fields}.
      Return the result as a single, minified JSON object with no extra formatting, markdown, or commentary.
      The keys in the JSON should be the exact field names requested.
      If a value for a field is not found, the value should be null.
      Example format: {"FieldName1": "Value1", "FieldName2": 123.45}
    `;

        const imagePart = {
            inlineData: {
                mimeType,
                data: await fs.readFile(filePath, {
                    encoding: 'base64'
                }),
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Cleaning response
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedJson);

    } catch (error) {
        console.error(`Error processing file ${path.basename(filePath)} with Gemini:`, error);
        return null;
    }
}