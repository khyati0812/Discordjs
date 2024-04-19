const OpenAI = require("openai");
// In ai.js
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// const { OpenAIAPI } = require("openai");

// const openai = new OpenAIAPI({ key: apiKey });

// async function ask(prompt) {
//   const response = await openai.Completions.create({
//     engine: "text-davinci-002",
//     prompt,
//     temperature: 0.7,
//     max_tokens: 256,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//   });

//   const answer = response.data.choices[0].text;
//   console.log(answer);
// }

// // Ask an example question
// ask("What are the names of the planets in the solar system?");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // This is also the default, can be omitted
});
// const chatCompletion = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [{"role": "user", "content": "Hello!"}],
//   });
//   console.log(chatCompletion.choices[0].message);
async function ask(prompt) {
  const response = await openai.chat.completions.create({
    model: "codex",
    prompt,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const answer = response.data.choices[0].text;
  console.log(answer);
}
//Ask an example question
ask("What are the names of the planets in the solar system?");
