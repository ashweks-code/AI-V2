const OPENROUTER_API_KEY = "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";

const MODEL_NAME = "inclusionai/ring-2.6-1t:free";

const messages = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const newChat = document.getElementById('newChat');
const themeToggle = document.getElementById('themeToggle');

// =======================
// THEME
// =======================

const savedTheme = localStorage.getItem('ashwek-theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
}

themeToggle.textContent =
  document.body.classList.contains('light') ? '🌙' : '☀️';

themeToggle.onclick = () => {
  document.body.classList.toggle('light');

  const isLight = document.body.classList.contains('light');

  themeToggle.textContent = isLight ? '🌙' : '☀️';

  localStorage.setItem(
    'ashwek-theme',
    isLight ? 'light' : 'dark'
  );
};

// =======================
// ADD MESSAGE
// =======================

function addMessage(role, text) {

  const div = document.createElement('div');

  div.className = `message ${role}`;

  const html = window.marked
    ? marked.parse(text)
    : text.replace(/\n/g, '<br>');

  div.innerHTML =
    role === 'bot'
      ? `
        <div class="bot-avatar">A</div>
        <div class="bubble">${html}</div>
      `
      : `
        <div class="bubble">${html}</div>
      `;

  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
}

// =======================
// OPENROUTER AI
// =======================

async function getAIReply(userMessage) {

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href,
        "X-Title": "Ashwek AI Assistant"
      },

      body: JSON.stringify({
        model: MODEL_NAME,

        messages: [
          {
            role: "system",

            content:
              "You are Ashwek, a futuristic 2026 AI assistant. Respond in a modern ChatGPT-like style with proper formatting, markdown, clean structure, conversational tone, and professional responses."
          },

          {
            role: "user",
            content: userMessage
          }
        ]
      })
    }
  );

  if (!response.ok) {

    const errorText = await response.text();

    console.error(errorText);

    throw new Error(errorText);
  }

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ||
    "Sorry, I could not generate a response."
  );
}

// =======================
// SEND MESSAGE
// =======================

async function sendMessage() {

  const text = input.value.trim();

  if (!text) return;

  addMessage('user', text);

  input.value = '';

  input.style.height = 'auto';

  addMessage('bot', 'Typing...');

  const typingMessage = messages.lastElementChild;

  try {

    const reply = await getAIReply(text);

    typingMessage.remove();

    addMessage('bot', reply);

  } catch (error) {

    typingMessage.remove();

    addMessage(
      'bot',
      '⚠️ API Error. Please check your OpenRouter API key or model name.'
    );

    console.error(error);
  }
}

// =======================
// BUTTON EVENTS
// =======================

sendBtn.onclick = sendMessage;

input.addEventListener('keydown', e => {

  if (e.key === 'Enter' && !e.shiftKey) {

    e.preventDefault();

    sendMessage();
  }
});

// =======================
// AUTO HEIGHT TEXTAREA
// =======================

input.addEventListener('input', () => {

  input.style.height = 'auto';

  input.style.height =
    Math.min(input.scrollHeight, 140) + 'px';
});

// =======================
// NEW CHAT
// =======================

newChat.onclick = () => {

  messages.innerHTML = '';

  addMessage(
    'bot',
    'Hi 👋 I am **Ashwek, your AI Assistant**. New chat started. How can I help you today?'
  );
};

// =======================
// MICROPHONE
// =======================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition) {

  const recognition = new SpeechRecognition();

  recognition.lang = 'en-IN';

  recognition.interimResults = false;

  recognition.continuous = false;

  micBtn.onclick = () => {

    micBtn.classList.add('listening');

    recognition.start();
  };

  recognition.onresult = event => {

    input.value =
      event.results[0][0].transcript;

    input.focus();
  };

  recognition.onend = () => {

    micBtn.classList.remove('listening');
  };

  recognition.onerror = () => {

    micBtn.classList.remove('listening');

    alert(
      'Microphone permission is blocked or unavailable. Please allow microphone access in your browser.'
    );
  };

} else {

  micBtn.onclick = () => {

    alert(
      'Voice input is not supported in this browser. Please use Chrome or Edge.'
    );
  };
}

// =======================
// QUICK PROMPTS
// =======================

document
  .querySelectorAll('.quick-prompts button')
  .forEach(btn => {

    btn.onclick = () => {

      input.value =
        btn.textContent.replace(/^.+?\s/, '');

      input.focus();
    };
  });
