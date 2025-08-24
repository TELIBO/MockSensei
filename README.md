Here’s a clean **single README.md snippet** you can copy-paste directly into your repo 👇

````markdown
# MockMantra 🎤

MockMantra is an AI-powered mock interview platform that generates **role-specific verbal interview questions** based on job position, description, and experience. Candidates can practice with their mic & webcam, review recordings, and improve like it’s a real interview.

---

## ✨ Features
- 🎯 Job-tailored AI interview questions  
- 🎤 Verbal practice with mic & webcam  
- 🤖 Sample answers for guidance  
- 📊 Feedback & analysis (coming soon)  

---

## 🛠️ Tech Stack
- Next.js, React, TailwindCSS, shadcn/ui  
- react-webcam, react-hook-speech-to-text  
- Gemini API / Hugging Face / OpenAI (configurable)  
- Vercel for deployment  

---

## 🚀 Getting Started
```bash
git clone https://github.com/your-username/mockmantra.git
cd mockmantra
npm install
npm run dev
````

App runs at **[http://localhost:3000](http://localhost:3000)**

Add `.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

---

## 📌 Prompt Template

```plaintext
Job position: ${jobPosition}
Interview round: ${interviewRound}
Job Description: ${jobDesc}
Years of Experience: ${jobExperience}

Generate exactly ${jobQuestions} verbal interview questions with answers.  
Return ONLY a valid JSON array:
[
  { "question": "string", "answer": "string" }
]
```

---

## 🛤️ Roadmap

* [ ] AI-powered feedback
* [ ] Company-specific question sets
* [ ] Export Q\&A to PDF

---

## 📄 License

MIT © 2025 \[Your Name]

```

Want me to also add a **preview screenshot section** in this README so your repo looks more polished on GitHub?
```

