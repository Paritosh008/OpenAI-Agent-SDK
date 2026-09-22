import { Agent, run, tool } from '@openai/agents';
import {z} from 'zod';
import 'dotenv/config';
import axios from 'axios';

const GetWeatherResultSchema = z.object({
    city: z.string().describe('name of the city'),
    degree_c: z.number().describe('the degree celcius'),
    condition: z.string().optional().describe('condition of the weather'),
});

const getWeatherTool = tool({
    name: 'get_weather',
    description: 'returns the current weather information for the given city',
    parameters: z.object({
        city: z.string().describe('name of the city'),
    }),
    execute: async function({city}) {
        console.log(`🌧️ Calling Get Weather`, city);
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
        const response = await axios.get(url, { responseType: 'text '});
        return `The weather of ${city} is ${response.data}`;
    },
});

const sendEmailTool = tool({
    name: 'send_email',
    description: 'This tool sends an email',
    parameters: z.object({
        toEmail: z.string().describe('email address to'),
        subject: z.string().describe('subject'),
        body: z.string().describe('body of the email')
    }),
    //execute: async function({body,subject,toEmail})
})
const agent = new Agent ({
    name: 'Weather Agent',
    instructions: `
    You are an expert weather agent that helps user to tell weather report `,
    
    tools: [getWeatherTool,sendEmailTool],
    outputType: GetWeatherResultSchema
});

async function main(query = '') {
    const result = await run(agent, query);
    console.log(`Result:`, result.finalOutput);
}

main(`What is the weather of Noida, Mumbai and Goa?`);