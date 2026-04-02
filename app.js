const Tgfancy = require('tgfancy')
const telegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv').config()
const axios = require('axios')
const { Octokit } = require('@octokit/rest')
const Anthropic = require('@anthropic-ai/sdk')
const { GoogleGenAI } = require('@google/genai')
const cron = require('node-cron')
const saveddata = require('./models/userdata')
const userdata = require('./models/userdata')
const trackedcompanies = {}


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
    bot.sendMessage(chatid, "/set_stack for getting preference of you current stack data from companies")
})



bot.onText(/\/track (.+)/, async (msg, match) => {
    const chatid = msg.chat.id;
    const userinput = match[1];




    //Github all Data Code
    bot.sendMessage(chatid, `Hmm ${userinput}`).then((sent) => {




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
        }, 11000)




    })









    const org = userinput;


    const getstack = await saveddata.findOne({ name: chatid })
    if (getstack) {
        const userstack = getstack.stack;
        console.log(`Users Stack Language is ${userstack}`)

    } else {
        bot.sendMessage(chatid, "Not found Id of user")
    }

    const userstack = getstack.stack.toLowerCase();

    const userstackget = userstack;




    // const stack = getstackfromid;
    // console.log(stack)


    const orgdata = await octokit.rest.repos.listForOrg({
        org: org,

    });

    const orgdatas = orgdata.data;

    const filteruserbase = orgdatas.filter(repo => {

        const language = repo.language ? repo.language.toLowerCase() : "";
        const description = repo.description ? repo.description.toLowerCase() : "";


        return (
            language.includes(userstackget) || description.includes(userstackget)
        )


    })




    let orgass;

    if (filteruserbase.length > 0) {
        orgass = filteruserbase[0];
    } else {
        orgass = orgdatas[0];
    }

    // bot.sendMessage(chatid, `${orgass.name}`)
    // bot.sendMessage(chatid,`${orgass.html_url}`)


    const owner = orgass.owner.login;
    const repo = orgass.name;
    const language = orgass.language;
    console.log(`Company Organisation Language is: ${language}`)
    const description = orgass.description;
    console.log(description)

    const bothdata = language + description







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
        path,


    })

    console.log(repo)

    //  console.log(repoalldata)



    const alldata = { orgass, repoalldata, readmedata, commass }
    const alldatastr = JSON.stringify(alldata)

    //checking every hours data



    const key = `${userinput}_${chatid}`

    trackedcompanies[key] = {
        chatid: chatid,

    }





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

    const blogdata = await axios.request(`https://dev.to/api/articles?tag=${userinput}`)
    // console.log(blogdata)

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
        //     contents: `You are a Shadow, a company intelligence bot. That genberates  clean report using only plain text
        // and emojis. No Markdown, no LaTeX, no special formatting but for now its just for github repo data not other reports add this too.
        // Generate a precise text report on what this ${alldatastr} company github repo data gives so that user can prepare for the company better
        //  and with their current jobs that are ${jobdata} Just give important data dont give all and also in that just show when updated and in last
        //   type started Survillance agains company giving all necessary report please be attente now this is ${blogdata} is blogs data of the company which user asked now make 
        //   a small short report that gives all correct data from all these data thats which user wants all data and it should be small and
        //   precise which user understand what you want to say.`
        //         contents: `You are Shadow, a company intelligence bot.
        // Generate a short and precise intelligence report using only plain text and emojis.
        // No markdown, no formatting symbols, no LaTeX.

        // Use this exact structure —

        // 🕵️ SHADOW INTELLIGENCE REPORT — ${userinput}

        // 🏗️ WHAT THEY ARE BUILDING
        // [From GitHub data — 2 to 3 lines max]

        // 💼 OPEN POSITIONS
        // [From jobs data — top 3 jobs only with title and location]

        // 📰 LATEST FROM THEIR TECH BLOG
        // [From blog data — 1 to 2 recent article titles and what they are about]

        // 🛠️ TECH STACK SIGNALS
        // [Any new technology detected from GitHub]


        // 🌑 Surveillance started. Shadow is watching.

        // Data: GitHub — ${alldatastr} Jobs — ${jobdata} Blog — ${blogdata}`

        // contents: `You are a Shadow Bot that uses to get a Company Insights Report that gives user a report of the user's company that he gives check the company repo and their all latest blogs and all latest job hiring for that 
        // and also make the report not on latex not on any other format just plain text no emojis and it should not be ugly and its good to read the report. and thats users ${userinput} company name that he gave and also make it short and best ${jobdata} ${blogdata} `


        contents: `
You are Shadow — an AI Company Intelligence Analyst.

Your job is to generate a SHORT, CLEAN, and STRUCTURED company intelligence report.

STRICT RULES:
- Output must be plain text only
- No markdown, no symbols like *, #, -, etc.
- No emojis
- Keep it clean and easy to read
- Keep it concise (max 10–12 lines)
- Do NOT dump raw data
- Only include meaningful insights

STRUCTURE (follow exactly):

SHADOW REPORT: ${userinput}

WHAT THEY ARE BUILDING:
(2 lines max based on GitHub)

HIRING SIGNALS:
(Top roles + what they are hiring for)

TECH STACK:
(Detected technologies from GitHub)

LATEST INSIGHTS:
(From blogs — what problems they are solving)

HOW TO PREPARE:
(What user should study for interview)

WHY THIS MATTERS:
(1–2 lines explaining impact)

If data is unclear, make reasonable assumptions instead of dumping raw data.

DATA:
GitHub: ${alldatastr}
Jobs: ${jobdata}
Blogs: ${blogdata}
`
    })

    // console.log(response.text)


    bot.sendMessage(chatid, response.text)



})


bot.onText(/\/set_stack (.+)/, async (msg, match) => {
    const chatid = msg.chat.id;
    const userstack = match[1];


    const userstackfind = await saveddata.findOne({ name: chatid })
    if (userstackfind) {
        userstackfind.stack = userstack;
        await userstackfind.save();



    } else {
        const mewstack = new saveddata({
            name: chatid,
            stack: userstack
        })
        await mewstack.save()
    }



    bot.sendMessage(chatid, `${userstack} Great now shadow will give report according to your stack`)
    bot.sendMessage(chatid, "Just Type /track <companyName>")


})




cron.schedule('* 30 8 * * *', () => {
    for (const key in trackedcompanies) {
        const saved = trackedcompanies[key]

    }
    bot.sendMessage(saved.chatid, "Hello from schedule")

})






bot.on("message", async (msg) => {
    if (msg.text.startsWith("/")) return;
    const chatid = msg.chat.id;

    const userinput = msg.text;

    console.log("We recieved user input")
    console.log("Send to ai so that we can start process")
    bot.sendMessage(chatid, `You Said ${userinput}`)
})