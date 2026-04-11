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
const { parse } = require('dotenv')

const token = process.env.BOT_TOKEN;

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const GEMINI_API_KEY = process.env.GEMINI_API_KEY5;

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


async function generateAndSendReport(chatid, userinput, userstackget) {
    try {


        const org = userinput;


        const getstack = await saveddata.findOne({ name: chatid })
        if (getstack) {
            const userstack = getstack.stack;
            console.log(`Users Stack Language is ${userstack}`)

        } else {
            bot.sendMessage(chatid, "Not found Id of user")
        }

        const userstack = getstack.stack.toLowerCase();

   
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

      

        const alldata = { orgass, repoalldata, readmedata, commass }
        const alldatastr = JSON.stringify(alldata)
          

        console.log(alldatastr)


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
                
                'x-rapidapi-key': process.env.RAPIDAPI_KEY2,
                'x-rapidapi-host': 'jsearch.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        };

        const responsej = await axios.request(options);
  
        const jobdata = JSON.stringify(responsej.data.data)

        const blogdata = await axios.request(`https://dev.to/api/articles?tag=${userinput}`)
      



        //Generating Shadow reports with gemini


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',

           

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

      

        const aireport = response.text;






        //DB Data Cache

        const usercheck = await saveddata.findOne({ name: chatid })
        if (usercheck) {
          
            usercheck.userinput = userinput,
                usercheck.alldatastr = alldatastr,
                usercheck.aireport = aireport,
                usercheck.stack = userstackget,
                usercheck.trackedcompany = userinput,
                usercheck.lastgeneratedat = new Date(),
                usercheck.scheduling = false,


                await usercheck.save();

        } else {
            const newuserdata = new saveddata({
                name: chatid,
                userinput: userinput,
                alldatastr: alldatastr,
                aireport: aireport,
                stack: userstackget,
                trackedcompany: userinput,
                lastgeneratedat: new Date(),
                scheduling: false,


            })

            await newuserdata.save()

        }


        return aireport

    } catch (err) {
        console.log("Error in generating reports")
        console.log(err)
        return null
    }
}



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
            stack: userstack,

        })
        await mewstack.save()
    }



    bot.sendMessage(chatid, `${userstack} Great now shadow will give report according to your stack`)
    bot.sendMessage(chatid, "Just Type /track <companyName>")


})


bot.onText(/\/track (.+)/, async (msg, match) => {
    const chatid = msg.chat.id;
    const userinput = match[1];


    const userdata = await saveddata.findOne({ name: chatid })





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
        }, 10000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`🧠 Synthesizing intelligence and generating your personalized report...`, {
                chat_id: chatid,
                message_id: sent.message_id

            })
        }, 11000)








    })





    const userstackget = userdata.stack.toLowerCase()
    const aireport = await generateAndSendReport(chatid, userinput, userstackget)

    if (!aireport) {
        bot.sendMessage(chatid, "Error Generating report")
    } else {
        bot.sendMessage(chatid, aireport)
        bot.sendMessage(chatid, `Wanted Every New Report of ${userinput} at every 9 AM`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: `schedule_true_${userinput}` }],
                    [{ text: "No", callback_data: "schedule_false" }]
                ]
            }
        })

    }










})








cron.schedule('0 9 * * *', async () => {
    const scheduleusers = await saveddata.find({ scheduling: true })
   
    for (const users of scheduleusers) {
        if (!users.trackedcompany || !users.stack) continue
        const aireport = await generateAndSendReport(users.name, users.trackedcompany, users.stack.toLowerCase())
        const chatid = users.name;
        
        bot.sendMessage(chatid,aireport)
    }
})

bot.onText(/\/latestreport (.+)/, async (msg, match) => {
    const chatid = msg.chat.id;
    const userinput = match[1];
    const userdata = await saveddata.findOne({ name: chatid })


    const sixhours = 6 * 60 * 60 * 1000
    const now = new Date()

    if (userdata.aireport && userdata.trackedcompany == userinput && userdata.lastgeneratedat && (now - new Date(userdata.lastgeneratedat)) < sixhours) {
        bot.sendMessage(chatid, `The lastest report of ${userinput}`)
        bot.sendMessage(chatid, userdata.aireport)
        return
    } else {
        bot.sendMessage(chatid, "Timed our Generating new Report")

    }


})


bot.onText(/\/status/, async (msg) => {
    const chatid = msg.chat.id;
    const getuserdata = await saveddata.findOne({ name: chatid })

    if (!getuserdata) {
        bot.sendMessage(chatid, "No data Found first /track")
        return
    }

    const sent = bot.sendMessage(chatid, `<b> ${getuserdata.trackedcompany} </b>`, {
        parse_mode: 'HTML'
    })

    const pinned = bot.pinChatMessage(chatid, (await sent).message_id)
    if (pinned === true) {
        bot.unpinAllChatMessages(chatid, sent.message_id)
    } else {
        bot.pinChatMessage(chatid, (await sent).message_id)
    }

})

bot.onText(/\/help/, async (msg) => {
    const chatid = msg.chat.id;
    bot.sendMessage(chatid, `<b> Bot Commands </b> \n <b>/start </b> \n <b>/track +companyname </b> \n <b>/set_stack </b> \n <b>/latestreport +previouscompanyname </b> \n <b>/status </b> \n <b>/report</b> \n <b>/interview +companyname </b> \n <b>/mock +companyname </b> \n\n <strong>Enjoy Shadow </strong>`, {
        parse_mode: 'HTML'
    })
})

bot.onText(/\/report/, async (msg) => {
    const chatid = msg.chat.id;

    const prevreport = await saveddata.findOne({ name: chatid })
    if (!prevreport) {
        bot.sendMessage(chatid, "No data found first /track")
    }
    const newreport = await generateAndSendReport(chatid, prevreport.trackedcompany, prevreport.stack.toLowerCase())
    bot.sendMessage(chatid, newreport)
})

// /mock with Shadow Mock Question Engine Just see what I do.....


bot.onText(/\/mock (.+)/, async (msg, match) => {
    const chatid = msg.chat.id;
    const userinput = match[1];

    bot.sendMessage(chatid, "Welcome to Mock By Shadow ready to prepare according to Company Specific Way")
    bot.sendMessage(chatid, `Getting Ready for giving you interview questions on based on ${userinput} Activities`).then((sent) => {
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`Checking ${userinput} latest activities`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 1000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`Gathering Info of ${userinput} from Github and other platforms`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 2000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`Checking data and Generating Question Please Wait..`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 3000)
        setTimeout(() => {
            bot.sendChatAction(chatid, "typing")
            bot.editMessageText(`Just Polishing Questions and Making them in Format`, {
                chat_id: chatid,
                message_id: sent.message_id
            })
        }, 4000)

          
    })

     const org = userinput;
        const userdbdatastored = await saveddata.findOne({ name: chatid })
        const mockorg = await octokit.rest.repos.listForOrg({
            org: org,
        })

        const mockorgdata = mockorg.data;

        const filtermockbase = mockorgdata.filter(repo => {
            const language = repo.language ? repo.language.toLowerCase() : "";
            const description = repo.description ? repo.description.toLowerCase() : "";

            return (
                language.includes(userdbdatastored.stack) || description.includes(userdbdatastored.stack)
            )
        })

        let mockorgass;

        if (filtermockbase.length > 0) {
            mockorgass = filtermockbase[0];
        } else {
            mockorgass = mockorgdata[0];
        }

      

        const owner = mockorgass.owner.login;
        const repo = mockorgass.name;
        const language = mockorgass.language;
        console.log(`Company Organisation Language is: ${language}`)
        const description = mockorgass.description;
        console.log(description)

        const bothdata = language + description







        const mockcommitsdata = await octokit.rest.repos.listCommits({
            owner,
            repo
        })

        const mockcommass = mockcommitsdata.data[0];
          




        const mockreadmedata = await octokit.rest.repos.getReadme({
            owner,
            repo
        })


        const path = mockreadmedata.data["README.md"];


        const mockrepoalldata = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,


        })

        console.log(repo)



        const mockalldata = { mockorgass, mockrepoalldata, mockreadmedata, mockcommass }
        const mockalldatastr = JSON.stringify(mockalldata)



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
             
                'x-rapidapi-key': process.env.RAPIDAPI_KEY2,
                'x-rapidapi-host': 'jsearch.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        };

        const responsej = await axios.request(options);
       

        //Loop to get salary and titles

        const alljobdata = responsej.data.data;




    const alljobdataapi  = (title) => {
        const t = title.toLowerCase();

        if(t.includes("backend")){
            return "system design"
        }else if(t.includes("frontend")){
            return "performance based"
        }else if(t.includes("data")){
            return "data pipeline"
        }else if(t.includes("ai")){
            return "ai based"
        }else{
            return "general based"
        }
    }
         
    console.log(alljobdataapi)


    const getdet = alljobdata.map((job,index) => {
        const title = job.job_title;

        const salary = job.job_salary || (job.job_min_salary && job.job_max_salary ? `${job.job_min_salary - job.job_max_salary}`: "Not Disclosed");

        console.log(`${index + 1},${title} -> ${salary}`)

        const category = alljobdataapi(title);

        return {
            title: title,
            salary: salary,
            category: category
        }
    })

    console.log(getdet)

        const blogdata = await axios.get(`https://dev.to/api/articles?tag=${userinput}`)

  

  
     const mockcomassone = mockcommass.commit.message;
      const githubdata = {mockcomassone, language, description}
  

 


//Question Title checking Function code


    

    const classifyingfromdatatotemplate = getdet;

 

const questionkeys = {
    "system design": [
        "Name 3 ways you would scale this",
        "What database would you choose and why",
        "How would you handle failure in this system",
        "What would break first at 10x traffic",
        "How would you monitor this in production",
    ],
    "data pipeline": [
        "Name 3 steps in this data flow",
        "How would you handle data loss here",
        "What would you cache and why",
        "How would you make this pipeline faster",
        "What happens if this pipeline fails midway"
    ],
    "performance based": [
        "Name 3 things causing slowness here",
        "What would you optimize first and why",
        "How would you reduce load time here",
        "What metrics would you track for this",
        "How would you test performance here"
    ],
    "ai based": [
        "Name 3 ways to improve this model",
        "What data would you need to train this",
        "How would you handle wrong predictions",
        "What would you measure to track accuracy",
        "How would you reduce model response time"
    ],
    "general based": [
        "What would you check first if this broke",
        "Name 3 improvements you would make",
        "How would you make this more reliable",
        "What security risk do you see here",
        "How would you make this easier to maintain"
    ]
}
    const pickquestionkey = (category) => {
        const question = questionkeys[category] || questionkeys["general based"]
        const randomque = Math.floor(Math.random() * question.length)
        return question[randomque]
    }
    

    const combinecontext = classifyingfromdatatotemplate.map((item) => {
        
        const keyword = pickquestionkey(item.category)

        if(item.category==="system design"){
            

     const questionuser = `${userinput} just Commited ${mockcomassone} to their ${language} codebase. They are Building ${description}. \n\n${keyword}?`
            return {questionuser, category: item.category, title: item.title}
        }else if(item.category==="performance based"){
    


            const questionuser = `${userinput} just Commited ${mockcomassone} to their ${language} codebase. They are Building ${description}. \n\n${keyword}?`
            return {questionuser, category: item.category, title: item.title}
        }else if(item.category==="data pipeline"){

    const questionuser = `${userinput} is building ${description} using ${language}. Their Latest Commit was "${mockcomassone}".\n\n${keyword}?`
            return {questionuser, category: item.category, title: item.title}
        }else if(item.category==="ai based"){
     
             const questionuser = `${userinput}  recently updated their ${language} AI System. Commit Message was : "${mockcomassone}" \n\n${keyword}?`
            return {questionuser, category: item.category, title: item.title}
        }else{
        
         const questionuser = `${userinput} is acitvely working on their ${repo} their latest commit was ${mockcomassone} in language ${language} \n\n${keyword}?`
            return {questionuser, category: item.category, title: item.title}
        }
    })




    const storecontext  = await saveddata.findOne({name: chatid})
    if(storecontext){
        storecontext.mockquestion = combinecontext,
        storecontext.mockindex = 0,
        storecontext.mockactive = true
        
  
        await storecontext.save();

    }else{
        const context = new saveddata({
            mockquestion: combinecontext,
            mockindex: 0,
            mockactive: true


            
        })
        await context.save();
    }



    const finalquestion = combinecontext[0].questionuser;
    console.log("Generated question: ",finalquestion)
    
    bot.sendMessage(chatid, `Shadow Mock Interview - ${userinput}\n\n Q.1: \n${finalquestion}`, {
        reply_markup: {
            inline_keyboard: [
                [{text: "Get Summary of Mock Question", callback_data:"summarymock"}],
                [{text: "Get Short answer", callback_data: "shortanswer"}],
                [{text: "Skip to next", callback_data:"skipped"}]
            ]
        }
    })
    
})


bot.on("message", async (msg,match) => {
    const chatid = msg.chat.id;
    const getmockstartdata = await saveddata.findOne({name: chatid})

    
    const getmockindex = getmockstartdata.mockindex;
    const getmockquestion = getmockstartdata.mockquestion;
    const getquestiondata = getmockquestion[`${getmockindex}`]
   

    if(!getmockstartdata) return;
    if(getmockstartdata.mockactive===true){
        const useranswer = msg.text;

           const checkquestionanswer = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:`${getquestiondata.questionuser} This is the question and this is the ${useranswer} users answer check the 
    answer of user as lenient way and give recommendation how to improve the stack or their coding environment 
    to help him crack the company and always answer in shorter format not long and give structured possible way
    so that user understand dont use stars or any other make short response which only tells user response is correct 
    or not if not then tell how to improve it and move on to next question say`
   })

   getmockstartdata.mockactive = false;
   await getmockstartdata.save();

   bot.sendMessage(chatid,checkquestionanswer.text,{
    reply_markup: {
        inline_keyboard: [
            [{text: "nextquestion", callback_data:"nextquestion"}]
        ]
    }
   })

    }

   

   
})


bot.onText(/\/interview/,async (msg,match) => {
    const chatid = msg.chat.id;
    const userinput = await saveddata.findOne({name: chatid});
    const comp = await userinput.trackedcompany;
    const useri = await userinput.userinput;


    bot.sendMessage(chatid, `Welcome to /interview Ready to Prepare according to companies latest activity`)
    const alldata = await saveddata.findOne({name: chatid})
    const somespecifidata = alldata.aireport;
    
    const shadowquestion = await alldata.mockquestion;
    

    const generatingintq = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Data: ${comp} ${useri} ${somespecifidata} ${shadowquestion}these are all data of user
        now generate 10 short but valuable question using all data there is also i have provided 
        shadow bot question that bot prepared for user use also that to generate question
        but those question from which user gets help to prepare best for the company dont use the word Shadow Report use only 
        valuable things to generate question dont use any other thing from report`
    })

    console.log(generatingintq.text);
    const responsefromdb = generatingintq.text;
    bot.sendMessage(chatid, `<b>${responsefromdb}</b>`, {
        parse_mode: "HTML"
    })

    bot.sendMessage(chatid,"Next Question",{
        reply_markup:{
            inline_keyboard:[
                [{text: "nextquestion",callback_data:"nextquestion"}]
            ]
        }
    })

  


})






bot.on("callback_query", async (query,finalquestion) => {
    const chatid = query.message.chat.id;


    //Cron Callback Queries


      if (query.data.startsWith("schedule_true_")) {
        const company = query.data.replace("schedule_true", "")
        const user = await saveddata.findOne({ name: chatid })
        if (user) {
            user.scheduling = true
            user.trackedcompany = company,
                await user.save()
        }
        bot.answerCallbackQuery(query.id, {
            text: "Done Bot will send a new report at every 9 AM"

        })
        bot.pinChatMessage(chatid, query.message_id)

    } else if (query.data === "schedule_false") {
        const user = await saveddata.findOne({ name: chatid })
        if (user) {
            user.scheduling = false
            await user.save();
        }
        bot.answerCallbackQuery(query.id, {
            text: "No problem we will not send any report if want a report just type /track"
        })
    }


   
    if(query.data.startsWith("summarymock")){
        const getprevmockdata = await saveddata.findOne({name: chatid})
        const prevdata = getprevmockdata.mockindex;
        const prevquestiondata = getprevmockdata.mockquestion;
        const getboth = prevquestiondata[`${prevdata}`]
        const comits = JSON.parse(getprevmockdata.alldatastr);
        const getstr = comits.commass;
        const getgith = comits.repoalldata;
        const aldatata = {comits,getstr,getgith}

        const summary = await ai.models.generateContent({
            model:"gemini-2.5-flash",
            contents:`${getboth.questionuser} this is the Question that give to the user so generate a summary and here is github context ${comits.orgass?.name},
             Language: ${comits.orgass?.language} , Description: ${comits.orgass?.description}, Latest Commit: ${comits.commass?.commit?.message},
             Summarize in 3-4 short bullet points so that user can answer confidently`
        })

        bot.sendMessage(chatid,summary.text)
    }


    if(query.data.startsWith("nextquestion")){
         const nextdat = await saveddata.findOne({name: chatid})
    const nextdatsimp = nextdat.mockindex;
    const nextmockqe = nextdat.mockquestion;
    const currentnext = nextmockqe[`${nextdatsimp}`]
        bot.sendMessage(chatid,"Please wait giving next question")
        bot.sendMessage(chatid,`${currentnext.questionuser}`)
    }








    //Mock Callbacks Queries
    if(query.data.startsWith("shortanswer")){
        bot.sendMessage(chatid,"Ok prividing short answer")
        const findindexquestion = await saveddata.findOne({name: chatid})
        
        const findquestind = findindexquestion.mockindex;
        const findquesti = findindexquestion.mockquestion;
        const currentuserquestio = findquesti[`${findquestind}`]
        console.log(findquesti)
        console.log(findquestind)
        console.log(currentuserquestio)
        const shortanswer = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents:`${currentuserquestio.questionuser} this is the question answer always question in three bulleted points and not more than 3 lines 
            and give answer always in points so that user gets all understandable`
        })

        bot.sendMessage(chatid, `Short Answer: \n\n ${shortanswer.text}`)
    }else if(query.data.startsWith("skipped")){
        bot.sendMessage(chatid,"I have saved moving on to the next question")
        const findindex = await saveddata.findOne({name: chatid})
        if(findindex && findindex.mockquestion || findindex.mockquestion.length===0){
            const nextindex = findindex.mockindex + 1;
            if(nextindex >= findindex.mockquestion.length){
                bot.sendMessage(chatid, "Mock Completed You have gone through all question ")
                return
            }
            const nextQuestion = findindex.mockquestion[nextindex].questionuser;

            findindex.mockindex = nextindex;
            await findindex.save()
     
            console.log(findindex)
            bot.sendMessage(chatid, `Q. ${nextindex + 1}: ${nextQuestion}`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text: "short answer", callback_data: "shortanswer"}],
                        [{text: "skip question", callback_data: "skipped"}]
                    ]
                }
            })
        }
    }
})

