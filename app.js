const Tgfancy = require('tgfancy')
const telegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv').config()
const axios = require('axios')
const { Octokit } = require('@octokit/rest')
const Anthropic = require('@anthropic-ai/sdk')
const { GoogleGenAI } = require('@google/genai')
const cron = require('node-cron')

const token = process.env.BOT_TOKEN;

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const GEMINI_API_KEY = process.env.GEMINI_API_KEY2;

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
})

const bot = new Tgfancy(token, {
    polling: true,
    Tgfancy: {
        feature: true,
        cancellation: true

    }
})

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const gitone = process.env.GITHUB_TOKEN

const Startinglins = [
    `🕵️ Welcome to Shadow. \n I watch. I listen. I report.Tell me which company you want to target and I will become your eyes inside their world.Send /track to begin.`,
    "👤 Shadow — Company Intelligence System You are now connected.I silently monitor your target companies and deliver everything you need to know before walking into that interview.Send /track <company name> to start surveillance.",
    "🌑 Shadow is online.No more blind applications.No more unprepared interviews.Who are we watching first? Send /track <company name>"
]


bot.onText(/\/start/, async (msg, match) => {
    const chatid = msg.chat.id;
    function startmess(array) {
        const randomess = Math.floor(Math.random() * array.length)
        return array[randomess]

    }
    bot.sendMessage(chatid, startmess(Startinglins))
})



bot.onText(/\/track (.+)/, async (msg, match) => {
    const chatid = msg.chat.id;
    const userinput = match[1];


    //Github all Data Code
    bot.sendMessage(chatid, `Great Choice ${userinput}`).then((sent) => {


        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText("Starting Survillance 🕵️‍♀️...", {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 1000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText("Finding Companies Organizations......", {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 2000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText("🔍 Scanning GitHub...", {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 3000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText("📦 Found 12 repositories...", {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 4000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText("🧠 Analysing latest commit history...", {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 5000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText("📝 Generating intelligence report...", {
                chat_id: chatid,
                message_id: sent.message_id

            })
        }, 6000)




    })







    const org = userinput;


    const orgdata = await octokit.rest.repos.listForOrg({
        org: org,
    });

    const orgdatas = orgdata.data;

    const orgass = orgdatas[0];

    // bot.sendMessage(chatid, `${orgass.name}`)
    // bot.sendMessage(chatid,`${orgass.html_url}`)


    const owner = orgass.owner.login;
    const repo = orgass.name;

    const commitsdata = await octokit.rest.repos.listCommits({
        owner,
        repo
    })

    const commass = commitsdata.data[0];

    //  bot.sendMessage(chatid,`${commass.commit.message}`)

    const readmedata = await octokit.rest.repos.getReadme({
        owner,
        repo
    })


    const path = readmedata.data["README.md"];

    const repoalldata = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
    })

    //  console.log(repoalldata)


    const alldata = { orgass,repoalldata, readmedata, commass }
    const alldatastr = JSON.stringify(alldata)


        //Job Posting Data Code

const options = {
  method: 'GET',
  url: 'https://jsearch.p.rapidapi.com/search',
  params: {
    query: `${userinput} latest tech jobs`,
    page: '1',
    num_pages: '1',
    country: 'us',
    date_posted: 'all'
  },
  headers: {
    'x-rapidapi-key': '9a225fd3b3msh1e8df5026b6beadp1bab82jsn5898b6462e44',
    'x-rapidapi-host': 'jsearch.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

const responsej = await axios.request(options);
		// console.log(responsej.data);

const jobdata = JSON.stringify(responsej.data.data)


    //Generating some reports with claude

    //    const message = await client.messages.create({
    //     max_tokens: 1024,
    //     messages: [{role: "user", content: `Generate a precise texh report on what this ${alldatastr} company github repo data gives so that user can prepare for the company better`}],
    //     model: 'Claude-sonnet-4-5'
    //    })

    //    console.log(message.content[0].text)



    //Generating some reports with gemini


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a Shadow, a company intelligence bot. That genberates  clean report using only plain text
    and emojis. No Markdown, no LaTeX, no special formatting but for now its just for github repo data not other reports add this too.
    Generate a precise text report on what this ${alldatastr} company github repo data gives so that user can prepare for the company better and with their current jobs that are ${jobdata}`
    })

    console.log(response.text)

    bot.sendMessage(chatid,response.text)


   
    })

     const weeklyreport = cron.schedule('0 07 1 * * 6', () => {
        bot.sendMessage(chatid,"Weekly Report Testing........")

    },{
        timezone:"Asia/Kolkata"
    })


    // bot.sendMessage(chatid,"📝 Generating intelligence report...").then((sent) => {
    //     setTimeout(() => {
    //             bot.sendMessage(chatid,"typing..")
    //             bot.deleteMessage(chatid,sent.message_id)
    //             bot.sendMessage(chatid,response.text)
    //         },7000)

    // })


    // bot.deleteMessage(chatid, sent.message_id)
    // bot.sendMessage(chatid, response.text)




bot.on("message", async (msg) => {
    if (msg.text.startsWith("/")) return;
    const chatid = msg.chat.id;

    const userinput = msg.text;

    console.log("We recieved user input")
    console.log("Send to ai so that we can start process")
    bot.sendMessage(chatid, `You Said ${userinput}`)
})