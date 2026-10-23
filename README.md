# 📚 Student Book

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Local First](https://img.shields.io/badge/Storage-LocalFirst%20(localStorage)-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Capture ideas, organize thoughts, and study smarter with an AI-augmented local workspace.**

[Features](#-key-features) • [Getting Started](#-getting-started) • [AI Integration](#-ai-features--providers) • [Deployment](#-deployment) • [Privacy & Security](#-privacy--security)

</div>

---

## 📖 Overview

**Student Book** is a fast, lightweight, and modern note-taking application designed specifically for students and learners. Built with pure Vanilla HTML5, CSS3, and JavaScript, it runs entirely in the browser with **zero dependencies**, **zero build steps**, and **complete privacy**.

All your notes, sticky reminders, and to-do lists are saved directly to your browser's `localStorage`—no servers, no logins, and no monthly subscriptions.

---

## ✨ Key Features

### 📝 Rich Note Taking & Dashboard
- **WYSIWYG Rich Editor**: Format text with bold, italics, bullet lists, numbered lists, custom font colors, and highlighters.
- **Image Support**: Insert images and adjust alignment or sizes (`30%`, `50%`, `75%`, `100%`).
- **Sticky Notes**: Color-coded quick notes (Yellow, Green, Blue, Pink) for quick reminders and fleeting thoughts.
- **To-Do List**: Built-in task manager with completion status tracking.
- **Instant Search**: Real-time filtering across all your notes from the dashboard.
- **Word Counter & Zoom**: Live word count display and zoom controls (`50%` to `150%`) for comfortable reading.
- **Export to PDF**: Clean print stylesheets for one-click PDF generation and printing.
- **Mental Refresh Break**: Built-in reaction-time test to refresh your mind between intense study sessions.

### 🤖 Built-in AI Study Tools
- **AI Note Summarizer**: Condense lengthy lecture notes into concise, digestible study points.
- **AI Exam Generator**: Automatically generate Multiple Choice Questions (MCQ) and True/False quizzes based directly on your notes to test your understanding.
- **AI Grammar & Spell Checker**: Hybrid grammar checking combining rule-based heuristics and AI to detect and fix writing errors in one click.
- **Voice Typing**: Hands-free dictation using the Web Speech API.

### 🎨 Themes & Customization
- **Dark Theme (Scholarly)**: Elegant, eye-friendly dark mode for late-night studying.
- **Light Theme (Warm)**: Clean paper-like aesthetic for daytime reading.
- **Black & White (High Contrast)**: Minimalist monochrome theme for distraction-free focus.
- **Notebook Customization**: Customize your notebook title and subtitle directly from the settings panel.

---

## 🧠 AI Features & Providers

Student Book lets you connect your preferred AI provider using your own API key. Keys are stored locally in your browser and are never transmitted to third parties:

| Provider | Supported Models | Custom Endpoint |
| :--- | :--- | :---: |
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-3.5-turbo | ✅ |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku | ✅ |
| **Google Gemini** | Gemini 1.5 Flash, Gemini 1.5 Pro | ✅ |
| **OpenRouter** | 100+ Free & Paid open-source / proprietary models | ✅ |
| **Custom Endpoint** | Any OpenAI-compatible endpoint (Ollama, LM Studio, etc.) | ✅ |

> [!TIP]
> You can also browse and select **free models** when using OpenRouter!

---

## 🚀 Getting Started

### Prerequisites
You only need a modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, or Brave).

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/faizancodecom/student-book.git
   cd student-book
   ```

2. **Open the project**:
   - Simply double-click `index.html` in your file explorer.
   - **OR** serve it with any local server (e.g., VS Code *Live Server* or Python):
     ```bash
     # Using Python
     python -m http.server 3000
     ```
   - Open your browser at `http://localhost:3000`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + S` / `Cmd + S` | Save current note |
| `Ctrl + B` / `Cmd + B` | Toggle Bold |
| `Ctrl + I` / `Cmd + I` | Toggle Italic |

---

## 🔒 Privacy & Security

- **100% Local-First**: All notes, stickies, and tasks remain inside your browser's `localStorage`.
- **Private API Keys**: AI provider keys are stored exclusively in your local browser storage and sent directly to the AI service provider API.
- **No Analytics / Tracking**: No third-party analytics, telemetry, or user trackers are included.

---

## 🌐 Deployment

You can host **Student Book** freely on any static hosting provider:

### Deploy to GitHub Pages
1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and `/ (root)`.
4. Click **Save**. Your site will be live within minutes!

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/faizancodecom/student-book)
- Or simply run `vercel` in the project root.

---

## 📂 Project Structure

```text
student-book/
├── .gitattributes      # Line endings & binary file configurations
├── .gitignore          # Rules for ignoring sensitive & temporary files
├── index.html          # Dashboard (Notes, Stickies, Tasks, Search)
├── editor.html         # Rich text editor with AI & export tools
├── app.js              # Core logic, storage, AI integration & event handlers
├── style.css           # Styling, themes, responsive layout & print styles
├── favicon.svg         # Application icon
└── README.md           # Documentation
```

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
Made with ❤️ for students worldwide.
</div>
