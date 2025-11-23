import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing Gemini with API Key:', apiKey ? 'Present' : 'Missing');

    if (!apiKey) {
        console.error('No API key found');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // console.log('Sending message to Gemini...');
        // const result = await model.generateContent('Hello, are you working?');
        // const response = await result.response;
        // const text = response.text();
        // console.log('Response:', text);

        console.log('Listing models...');
        // @ts-ignore
        const models = await genAI.getGenerativeModel({ model: 'gemini-pro' }).apiKey; // Hack to get access to internal client if needed, but better to use listModels if available on the class?
        // Actually, listModels is on the GoogleGenerativeAI instance? No, it's not directly exposed in the high level SDK easily without looking at docs.
        // Let's try to use the model 'gemini-pro' again but maybe the issue is the region?
        // Or let's try 'gemini-1.0-pro'.

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Hello');
        console.log('Response:', result.response.text());
    } catch (error) {
        console.error('Error testing Gemini:', error);
    }
}

testGemini();
