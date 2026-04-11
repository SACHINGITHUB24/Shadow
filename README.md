# 🕵️ Shadow — AI Company Intelligence Bot

> *Stop guessing. Start preparing. Shadow watches so you don't have to.*

Shadow is a Telegram bot that gives you **real-time AI-powered intelligence on any company** — what they are building, who they are hiring, their tech stack, and company-specific mock interview questions — before your interview.

---

## 🌑 What is Shadow?

Most students walk into interviews blind. They read a company's about page, maybe skim LinkedIn, and hope for the best.

Shadow is different.

Shadow silently monitors a company's **GitHub activity**, **hiring trends**, and **engineering blogs** in real time — then uses Gemini AI to generate a clean, structured intelligence report matched to **your tech stack**. It then uses that live data to generate company-specific interview questions using its own classification and template engine — no generic AI questions.

---

## ✨ Features

### 🔍 Company Intelligence Reports (`/track`)
Tracks any company on GitHub + job boards + tech blogs and generates a clean Gemini-powered report covering:
- What they are currently building
- Latest hiring signals and open roles
- Their active tech stack from real repos
- Latest engineering insights from their blog
- Exactly how YOU should prepare based on your stack

### ⚡ Smart Caching (`/latestreport`)
Shadow uses a **6-hour cache system** backed by MongoDB. If you request a report within 6 hours of the last one, Shadow instantly returns the saved report — no unnecessary API calls, no waiting.

### 🎯 Shadow Mock Interview Engine (`/mock`)
The showstopper feature. Shadow builds company-specific interview questions from **live real data** using its own classification and template engine.

How it works:
1. You type `/mock aws`
2. Shadow fetches AWS's latest GitHub commits, active repos, and hiring data
3. It classifies each job posting into a category (system design, data pipeline, performance, AI, general)
4. It builds questions using real commit messages, languages, and repo descriptions as context
5. It sends the first question with three options — **Get Summary**, **Short Answer**, or **Skip**

**The key insight:** AI never generates the questions. Shadow's own engine does — using live company data. This makes every question specific to what the company is actually building right now.

Button options on each question:
- **Get Summary of Mock Question** → Gemini summarizes the GitHub context so you can answer confidently
- **Get Short Answer** → Gemini explains the ideal answer in 3 bullet points
- **Skip to Next** → Moves to the next question and saves your index in MongoDB

Type your own answer directly and Shadow will review it, tell you if it's correct, and give you improvement tips.

### 📋 Interview Question Generator (`/interview`)
Reads your tracked company's stored report, GitHub data, and mock questions from MongoDB, then generates **10 short, valuable interview questions** that company is likely to ask — based on what they are actually building right now.

### ⏰ Daily Scheduled Reports (Cron)
Opt in to receive a **fresh company intelligence report every day at 9 AM IST**, automatically sent to your Telegram. Shadow runs a cron job that checks all opted-in users and generates new reports for each.

### 📦 Stack-Personalised Reports (`/set_stack`)
Tell Shadow your tech stack once. Every report, every question, every insight is then filtered and personalised to your skills — Shadow picks repos that match your stack, highlights relevant roles, and tells you specifically how to prepare.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Telegram Bot | Tgfancy (with typing animations + callback buttons) |
| Database | MongoDB with Mongoose |
| AI Reports | Google Gemini API (gemini-2.5-flash) |
| GitHub Data | Octokit (GitHub REST API) |
| Job Postings | JSearch API via RapidAPI |
| Blog Data | Dev.to API |
| Scheduling | node-cron |
| Deployment | Railway |

---

## 🗄️ MongoDB Schema

```js
const userschema = new mongoose.Schema({
    name: String,           // Telegram chat ID
    userinput: String,      // Company name
    alldatastr: String,     // Raw GitHub data (stringified)
    aireport: String,       // Cached Gemini report
    stack: String,          // User's tech stack
    scheduling: Boolean,    // Daily report opt-in
    trackedcompany: String, // Currently tracked company
    lastgeneratedat: Date,  // Cache timestamp
    mockquestion: { type: Array, default: [] },   // Generated mock questions
    mockindex: { type: Number, default: 0 },      // Current question pointer
    mockactive: Boolean,    // Whether mock session is active
}, { timestamps: true })
```

---

## 🤖 Bot Commands

| Command | Description |
|---|---|
| `/start` | Start Shadow and get a welcome message |
| `/set_stack <tech>` | Set your tech stack for personalised reports |
| `/track <company>` | Generate a full intelligence report for any company |
| `/latestreport <company>` | Get cached report if under 6 hours old |
| `/report` | Regenerate a fresh report for your tracked company |
| `/status` | See which company you are currently tracking |
| `/mock <company>` | Start a company-specific mock interview session |
| `/interview` | Generate 10 interview questions from stored company data |
| `/help` | List all available commands |

---

## 🧠 How the Mock Question Engine Works

Shadow's classification engine reads every job posting returned from the JSearch API and classifies it:

```
title includes "backend"  → system design questions
title includes "frontend" → performance based questions
title includes "data"     → data pipeline questions
title includes "ai"       → ai based questions
else                      → general based questions
```

Then Shadow uses **live GitHub data** (latest commit message, language, repo description) as context to fill a question template:

```
[company] just committed [commit] to their [language] codebase.
They are building [description].

Name 3 ways you would scale this?
```

Every question is different. Every question is real. Because it is built from what the company actually committed this week.

---

## ⚙️ Environment Variables

```env
BOT_TOKEN=
GITHUB_TOKEN=
RAPIDAPI_KEY=
GEMINI_API_KEY=
MONGODB_URI=
ANTHROPIC_API_KEY=
```

---

## 🚀 Run Locally

```bash
git clone https://github.com/yourusername/shadow-bot
cd shadow-bot
npm install
# Add your .env file
node app.js
```

---

## 📌 Resume Description

> Built Shadow — a personalised AI company intelligence system that monitors GitHub activity, job postings and tech blogs, matches insights to user tech stack, generates company-specific interview questions from live data using a custom classification and template engine, delivers AI-powered answer explanations and daily scheduled intelligence reports via Telegram — Node.js, MongoDB, Gemini AI, GitHub API, node-cron

---

## 👤 Built By

Made by a student who got tired of walking into interviews unprepared.

Shadow is a solo project built from scratch — architecture, data pipelines, classification engine, question templates, caching logic, and deployment all designed and built independently.

---

*Shadow watches. You prepare. You get hired.*
