require("dotenv").config();

const apitoken = process.env.API_TOKEN;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const getRandomCat = require("random-cat-img");
const memes = require("random-memes");

const axios = require("axios"); //add this line at the top
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  ChatInputCommandInteraction,
} = require("discord.js");
// const exampleEmbed = (
//   temp,
//   maxTemp,
//   minTemp,
//   pressure,
//   humidity,
//   wind,
//   cloudness,
//   icon,
//   author,
//   profile,
//   cityName,
//   country
// ) =>
//   new EmbedBuilder()
//     .setColor("#0099ff")

//     .setTitle(`There is ${temp}\u00B0 C in ${cityName}, ${country}`)
//     .addField(`Maximum Temperature:`, `${maxTemp}\u00B0 C`, true)
//     .addField(`Minimum Temperature:`, `${minTemp}\u00B0 C`, true)
//     .addField(`Humidity:`, `${humidity} %`, true)
//     .addField(`Wind Speed:`, `${wind} m/s`, true)
//     .addField(`Pressure:`, `${pressure} hpa`, true)
//     .addField(`Cloudiness:`, `${cloudness}`, true)
//     .setThumbnail(`http://openweathermap.org/img/w/${icon}.png`);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const shortUrl = require("node-url-shortener");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
console.log(genAI);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const shortID = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("create")) {
    const url = message.content.split("create")[1].trim();

    try {
      const x = await new Promise((resolve, reject) => {
        shortUrl.short(url, (err, urlgiven) => {
          if (err) {
            reject(err);
          } else {
            if (shortID.get(url) == null) {
              let len = urlgiven.length;
              let index = -1;
              for (let i = len - 1; i >= 0; i--) {
                if (urlgiven[i] == "/") {
                  index = i;
                  break;
                }
              }
              const text = urlgiven.substr(index + 1);
              const textNew = text.substr(0, text.length - 2);
              shortID.set(url, textNew);
              resolve(textNew);
            } else {
              resolve(shortID.get(url));
            }
          }
        });
      });

      return message.reply({
        content: "Generating shortID for " + url + "\nHere it is: " + x, // Added a space after "Here it is:"
      });
    } catch (error) {
      console.error("Error while shortening URL:", error);
      return message.reply({ content: "Error while shortening URL." });
    }
  }
  if (message.mentions.has(client.user)) {
    const userMessage = message.content
      .replace(`<@!${client.user.id}>`, "")
      .trim();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const parts = [
        {
          text: `input: ${userMessage}`,
        },
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
      });

      const reply = await result.response.text();
      // due to Discord limitations, we can only send 2000 characters at a time, so we need to split the message
      if (reply.length > 2000) {
        const replyArray = reply.match(/[\s\S]{1,2000}/g);
        replyArray.forEach(async (msg) => {
          await message.reply(msg);
        });
        return;
      }

      return message.reply(reply);
    } catch (error) {
      console.error("Gemini API error:", error.message);
      // Handle the error related to Gemini API, e.g., send an error message to the user or log it for further investigation.
      return message.reply(
        "An error occurred while processing your request. Please try again later."
      );
    }
  }

  return message.reply({ content: "Hi from bot" });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    interaction.reply("Pong");
  }
  if (interaction.commandName === "cat") {
    try {
      // Call the getRandomCat function to get a random cat image URL
      await interaction.deferReply();
      const data = await getRandomCat();
      const channel = interaction.channel;
      // Create an embed with the image URL
      const embed = new EmbedBuilder()
        .setTitle("Random Cat Image")
        .setImage(data.message)
        .setColor("#0099ff");

      // Send the embed to the same channel where the command was triggered
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching random cat image:", error);
      await interaction.followUp("Error fetching random cat image.");
    }
  }
  if (interaction.commandName === "meme") {
    try {
      // Call the getRandomCat function to get a random cat image URL
      await interaction.deferReply();

      const data = await memes.fromReddit();
      const channel = interaction.channel;
      // Create an embed with the image URL
      const embed = new EmbedBuilder()
        .setTitle("Random Meme")
        .setImage(data.image)
        .setColor("#0099ff");

      // Send the embed to the same channel where the command was triggered
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching random cat image:", error);
      await interaction.followUp("Error fetching random meme image.");
    }
  }
  if (interaction.commandName === "weather") {
    try {
      const city = interaction.options.getString("city");
      await interaction.deferReply();
      if (!city) {
        interaction.reply("Please provide a city name.");
        return;
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${apitoken}`
      );
      console.log(response);
      const apiData = response.data;
      const currentTemp = Math.ceil(apiData.main.temp);
      const maxTemp = apiData.main.temp_max;
      const minTemp = apiData.main.temp_min;
      const humidity = apiData.main.humidity;
      const wind = apiData.wind.speed;
      const author = interaction.user.username;
      const profile = interaction.user.displayAvatarURL();
      const country = apiData.sys.country;
      const pressure = apiData.main.pressure;
      console.log(apiData.weather);
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Weather information")
        // .setThumbnail(
        //   "https://www.pixelstalk.net/wp-content/uploads/2016/07/HD-Weather-Picture.jpg"
        // )
        .setThumbnail(
          "https://t3.ftcdn.net/jpg/03/50/31/58/360_F_350315847_eo74yoI3NoaV9NFVSHj5DItIxwh6VUG0.jpg"
        )
        .addFields(
          { name: "Location", value: city },
          { name: "Temperature", value: currentTemp.toString() },
          { name: "Pressure", value: pressure.toString() },
          { name: "Humidity", value: humidity.toString() },
          { name: "Wind Speed", value: wind.toString() }
          // { name: "Temperature", value: currentTemp },
          // { name: "Pressure", value: pressure, inline: true }
        );
      // .addFields({ name: "Temperature", value: currentTemp })
      // .addFields({ name: "Pressure", value: pressure })
      // .addFields({ name: "Humidity", value: humidity });
      // .addFields({ name: "Wind Speed", value: wind });
      await interaction.editReply({ embeds: [embed] });
      // interaction.reply(
      //   exampleEmbed(
      //     currentTemp,
      //     maxTemp,
      //     minTemp,
      //     pressure,
      //     humidity,
      //     wind,
      //     cloudiness,
      //     icon,
      //     author,
      //     profile,
      //     cityName,
      //     country
      //   )
      // );
    } catch (err) {
      await interaction.followUp(
        "Error fetching weather data. Please enter a valid city name."
      );
      console.error(err);
      // await interaction.followUp("Error fetching random weather image.");
    }
  }
});
client.login(process.env.TOKEN);
