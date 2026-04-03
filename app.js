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

// const Startinglins = [
//     `🕵️ Welcome to Shadow. \n I watch. I listen. I report.Tell me which company you want to target and I will become your eyes inside their world.Send /track to begin.`,
//     "👤 Shadow — Company Intelligence System You are now connected.I silently monitor your target companies and deliver everything you need to know before walking into that interview.Send /track <company name> to start surveillance.",
//     "🌑 Shadow is online.No more blind applications.No more unprepared interviews.Who are we watching first? Send /track <company name>"
// ]


const Startinglins = [
`Shadow — AI Company Intelligence Bot

Get real insights about any company before interviews.

What you get:
• What they are building
• Hiring trends
• Tech stack
• How to prepare

Start by tracking a company:
/track <company name>`,

`Welcome to Shadow.

This bot helps you understand companies using real data from GitHub, hiring signals, and tech blogs.

You’ll get a short, structured report to help you prepare smarter.

Try now:
/track <company name>`,

`Shadow is ready.

Stop guessing interview questions.
Start preparing with real company intelligence.

Track any company:
/track <company name>`
];

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
    bot.sendMessage(chatid, `Shadow is initiating intelligence scan for ${userinput}...`).then((sent) => {




        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`Started Survillance on ${userinput}🕵️‍♀️...`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 1000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`🔎 Locating ${userinput}'s public repositories and engineering activity...`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 2000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`📦 Analyzing repositories, code patterns, and recent commits...`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 3000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`💼 Gathering hiring signals and open roles...`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 4000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`📰 Extracting latest engineering insights and blog signals...`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 5000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`🧠 Synthesizing intelligence and generating your personalized report...`, {
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



    // const key = `${userinput}_${chatid}`

    // trackedcompanies[key] = {
    //     chatid: chatid,

    // }





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
            // 'x-rapidapi-key': '9a225fd3b3msh1e8df5026b6beadp1bab82jsn5898b6462e44',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
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




    //Generating Shadow reports with gemini


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',

        // contents: `You are the Shadow Report Generator Bot You are a Company Intelligence Bot with correct data and also you provide leverage and 
        // Your Job is to Generate , Short, Clean ,asnd structure Company intelligence Report not the ugly one 
        // Strict Rules: 
        //  - Output must be in Plane Text 
        //  - Dont use much or more emojis that looks unprofessional
        //  - Dont make reports too complicated make it understandable and begginer freindly
        // - Do not dump raw data thats waht you will get best input
        // - make it clean and easy to read dont make letter capitalize just do it way best and professional way
        // -Add some important things from Raw Data like we taken repo from your stack base provided

        //  Structure (Follow This Strictly): 

        //  Shadow Company Report: ${userdata}
        //   ${alldatastr} What they are Building make this Easy and understandable for begginer and if he does not open the bot just see from 
        //  notification he can get what bot is saying thats most important and it should be short just with 1 to 2 lines not more than 
        //  that and also usefull not random stuff 

        //   Hiring Signals: ${jobdata}  Give data from this raw data about like what latest roles they are hiring and also what next they can using their ${alldatastr} 
        //   github data that + with their correct Jobs Hiring URL's that should be correct not more than 1 or 2 and also that should be correct data 
        //   using our raw data

        //   Tech Stack used by Company: 
        //   ${alldatastr} use this github repo data and tell what tech stack they used and how user can should apply this stack and make him
        //   best for the company 

        //   Latest Insights: 
        //   ${blogdata} Give user the best and latest the company he given their latest blogs data that i given to you and tell him what company 
        //   is solving right now and what he can do form this data he can also use this data to make his project according to this blog data and 
        //   prepare his project for company so that company should also be take him seriously he get latest update about the company

        //   Why this Matters: 
        //   With this report he can get prepare for todays era what and how he should be prepare for his interviews for getting standout

        //   and give him clear understandable report so that if begginer should read he gets best data and best info about company what 
        //   company is doing right now and how his stack can get job after this data

        //   and use these data: 
        //   Github: ${alldatastr}
        //   Job Data: ${jobdata}
        //   Blogs Data: ${blogdata}

        // `


        contents: `
You are Shadow — an AI Company Intelligence Assistant.

Generate a SHORT, CLEAN, and EASY TO READ report.

STRICT RULES:
- Plain text only
- Max 8–10 lines
- No raw data
- Beginner friendly
- Clear and professional

FORMAT:

SHADOW REPORT: ${userinput}

WHAT THEY ARE BUILDING:
(1–2 simple lines)

HIRING SIGNALS:
(Top roles + 1 hiring link if available)

TECH STACK:
(From GitHub — only important technologies)

LATEST INSIGHTS:
(What company is currently working on)

HOW TO PREPARE:
(What user should study based on their stack: ${userstackget})

WHY THIS MATTERS:
(1 short line)

IMPORTANT:
- Do NOT include raw JSON
- Summarize everything
- Focus on clarity over detail

DATA:
GitHub summary: ${orgass.name}, ${orgass.description}, ${orgass.language}
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