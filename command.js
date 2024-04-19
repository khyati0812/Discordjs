const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  
  {
    name: "meme",
    description: "Generates a meme",
  },
  {
    name: "cat",
    description: "meow",
    
  },
  {
    name: "weather",
    description: "Displays the weather",
    options: [
      {
        name: "city",
        description: "The city for which weather data will be returned",
        type: 3, // Type 3 indicates string type
        required: true, // Specify if the option is required or not
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(
 process.env.TOKEN
);
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands("1200941299516317808"), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
