const GROQ_API_KEY = "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";

const MODEL_NAME = "llama-3.3-70b-versatile";

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
// GROQ AI FUNCTION
// =========================

async function getAIReply(userMessage) {

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        model: MODEL_NAME,

        messages: [

          {
            role: "system",

            content:
`
You are Ashwek AI.

A futuristic premium AI assistant.

Your personality:
- smart
- modern
- conversational
- premium
- interactive
- clean formatting

Rules:
- use markdown formatting
- use headings when needed
- keep responses visually clean
- sound like a premium AI assistant
- concise but detailed when needed
`
          },

          {
            role: "user",
            content: userMessage
          }
        ]
      })
    }
  );

  const data = await response.json();

  console.log("Groq Response:", data);

  if (data.error) {
    throw new Error(data.error.message);
  }

  return (
    data.choices?.[0]?.message?.content ||
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

${error.message}

Please check:
- API key
- Groq model
- Browser console
`
    );

    console.error("Groq Error:", error);
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
// AUTO HEIGHT TEXTAREA
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
