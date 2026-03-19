const Tgfancy = require('tgfancy')
const telegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv').config()
const axios = require('axios')
const { Octokit } = require('@octokit/rest')

const token = process.env.BOT_TOKEN


const bot = new Tgfancy(token,{
    polling: true,
    Tgfancy:{
        feature:true,
        cancellation:true

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


bot.onText(/\/start/, async (msg,match) => {
    const chatid = msg.chat.id;
    function startmess(array){
        const randomess = Math.floor(Math.random() * array.length)
        return array[randomess]

    }
    bot.sendMessage(chatid,startmess(Startinglins))
})



bot.onText(/\/track (.+)/ , async (msg,match) => {
    const chatid = msg.chat.id;
    const userinput = match[1];

    bot.sendMessage(chatid,"Starting Tracking........")
    bot.sendMessage(chatid,"Tell Company")


      const repodata = await octokit.request(
        "GET /search/repositories",{

            q: userinput
        }

        
      )

      const repodataa = repodata.data.items[0]

      bot.sendMessage(chatid,"This is your repo data by octokit use it and go f*ck yourself baby")

    //    bot.sendMessage(chatid,`🎁 Repo ${repodataa.name}`)
    //    bot.sendMessage(chatid,`🎁 Stars Count ${repodataa.stargazers_count}`)
    //    bot.sendMessage(chatid,`🎁 Repo URL ${repodataa.html_url}`)  
        

   



   
})


bot.on("message", async (msg) => {
    if(msg.text.startsWith("/"))return;
    const chatid = msg.chat.id;

    const userinput = msg.text;

    console.log("We recieved user input")
    console.log("Send to ai so that we can start process")
    bot.sendMessage(chatid,`You Said ${userinput}`)
})