const GOOGLE_API_KEY = "AIzaSyCRwcW2po_gHLQsf0wfYh8hPFAJzuOPILI";

const messages = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const newChat = document.getElementById('newChat');
const themeToggle = document.getElementById('themeToggle');

// =========================
// THEME SYSTEM
// =========================

const savedTheme = localStorage.getItem('ashwek-theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
}

themeToggle.textContent =
  document.body.classList.contains('light')
    ? '🌙'
    : '☀️';

themeToggle.onclick = () => {

  document.body.classList.toggle('light');

  const isLight =
    document.body.classList.contains('light');

  themeToggle.textContent =
    isLight ? '🌙' : '☀️';

  localStorage.setItem(
    'ashwek-theme',
    isLight ? 'light' : 'dark'
  );
};

// =========================
// ADD MESSAGE
// =========================

function addMessage(role, text) {

  const div = document.createElement('div');

  div.className = `message ${role}`;

  const html = window.marked
    ? marked.parse(text)
    : text.replace(/\n/g, '<br>');

  div.innerHTML =
    role === 'bot'
      ? `
      <div class="bot-avatar">
        <div class="ai-core">
          <div class="ai-ring"></div>
          <div class="ai-center">A</div>
        </div>
      </div>

      <div class="bubble">
        ${html}
      </div>
      `
      : `
      <div class="bubble">
        ${html}
      </div>
      `;

  messages.appendChild(div);

  messages.scrollTop =
    messages.scrollHeight;
}

// =========================
// GEMINI AI
// =========================

async function getAIReply(userMessage) {

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        contents: [
          {
            parts: [
              {
                text:
                  `
You are Ashwek AI.

A futuristic premium AI assistant from 2026.

Your personality:
- intelligent
- premium
- conversational
- modern
- clean formatting
- interactive
- human-like
- concise but detailed when needed

Formatting rules:
- Use markdown
- Use headings properly
- Use bullet points where needed
- Make responses look premium like ChatGPT
- Keep responses visually clean

User message:
${userMessage}
                  `
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {

    const errorText =
      await response.text();

    console.error(errorText);

    throw new Error(errorText);
  }

  const data = await response.json();

  return (
    data.candidates?.[0]
      ?.content?.parts?.[0]?.text
      ||
    "Sorry, I could not generate a response."
  );
}

// =========================
// SEND MESSAGE
// =========================

async function sendMessage() {

  const text = input.value.trim();

  if (!text) return;

  addMessage('user', text);

  input.value = '';

  input.style.height = 'auto';

  addMessage(
    'bot',
    '✨ Thinking...'
  );

  const typingMessage =
    messages.lastElementChild;

  try {

    const reply =
      await getAIReply(text);

    typingMessage.remove();

    addMessage('bot', reply);

  } catch (error) {

    typingMessage.remove();

    addMessage(
      'bot',
      `
⚠️ API Error

Please check:
- API key
- Gemini API access
- Browser console
      `
    );

    console.error(error);
  }
}

// =========================
// EVENTS
// =========================

sendBtn.onclick = sendMessage;

input.addEventListener(
  'keydown',
  e => {

    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendMessage();
    }
  }
);

// =========================
// AUTO TEXTAREA HEIGHT
// =========================

input.addEventListener(
  'input',
  () => {

    input.style.height = 'auto';

    input.style.height =
      Math.min(
        input.scrollHeight,
        140
      ) + 'px';
  }
);

// =========================
// NEW CHAT
// =========================

newChat.onclick = () => {

  messages.innerHTML = '';

  addMessage(
    'bot',
`
# Welcome 👋

I am **Ashwek AI** — your futuristic AI assistant.

I can help you with:
- Writing
- Coding
- Planning
- Research
- Creative ideas
- Productivity
- Problem solving

How can I help you today?
`
  );
};

// =========================
// VOICE INPUT
// =========================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition) {

  const recognition =
    new SpeechRecognition();

  recognition.lang = 'en-IN';

  recognition.interimResults =
    false;

  recognition.continuous =
    false;

  micBtn.onclick = () => {

    micBtn.classList.add(
      'listening'
    );

    recognition.start();
  };

  recognition.onresult =
    event => {

      input.value =
        event.results[0][0]
          .transcript;

      input.focus();
    };

  recognition.onend = () => {

    micBtn.classList.remove(
      'listening'
    );
  };

  recognition.onerror = () => {

    micBtn.classList.remove(
      'listening'
    );

    alert(
      'Please allow microphone access in browser settings.'
    );
  };

} else {

  micBtn.onclick = () => {

    alert(
      'Voice input is not supported in this browser.'
    );
  };
}

// =========================
// QUICK PROMPTS
// =========================

document
  .querySelectorAll(
    '.quick-prompts button'
  )
  .forEach(btn => {

    btn.onclick = () => {

      input.value =
        btn.textContent.replace(
          /^.+?\s/,
          ''
        );

      input.focus();
    };
  });
