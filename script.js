const OPENROUTER_API_KEY = "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";
const MODEL_NAME = "inclusionai/ring-2.6-1t:free";

const messages = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const newChat = document.getElementById('newChat');
const themeToggle = document.getElementById('themeToggle');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sideInfo = document.getElementById('sideInfo');
const heroPanel = document.getElementById('heroPanel');

let chatHistory = [];

const savedTheme = localStorage.getItem('ashwek-theme');
if (savedTheme === 'light') document.body.classList.add('light');
themeToggle.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';

themeToggle.onclick = () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('ashwek-theme', isLight ? 'light' : 'dark');
};

menuBtn.onclick = () => sidebar.classList.toggle('open');

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  const html = window.marked ? marked.parse(text) : text.replace(/\n/g, '<br>');
  div.innerHTML = role === 'bot'
    ? `<div class="bot-avatar">A</div><div class="bubble">${html}</div>`
    : `<div class="bubble">${html}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function setHeroVisible() {
  heroPanel.style.display = messages.children.length ? 'none' : '';
}

async function getAIReply(userMessage) {
  chatHistory.push({ role: 'user', content: userMessage });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'Ashwek AI Assistant'
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are Ashwek, a futuristic 2026 AI assistant. Reply like ChatGPT with clean markdown formatting, short sections, bullets only when useful, and helpful professional language. Never say you are another bot name.'
        },
        ...chatHistory.slice(-12)
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(errorText);
    throw new Error(errorText);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  chatHistory.push({ role: 'assistant', content: reply });
  return reply;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
  setHeroVisible();
  input.value = '';
  input.style.height = 'auto';

  const typing = addMessage('bot', 'Typing...');

  try {
    const reply = await getAIReply(text);
    typing.remove();
    addMessage('bot', reply);
  } catch (error) {
    typing.remove();
    addMessage('bot', '⚠️ **API Error**\n\nPlease check your OpenRouter API key, model name, or browser console.');
  }
}

sendBtn.onclick = sendMessage;
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 140) + 'px';
});

newChat.onclick = () => {
  messages.innerHTML = '';
  chatHistory = [];
  setHeroVisible();
  input.value = '';
  input.focus();
  addMessage('bot', 'Hi 👋 I am **Ashwek, your AI Assistant**. New chat started. How can I help you today?');
  setHeroVisible();
};

function showPanel(title, text) {
  document.querySelectorAll('.panel-toast').forEach(e => e.remove());
  const panel = document.createElement('div');
  panel.className = 'panel-toast';
  panel.innerHTML = `<h4>${title}</h4><p>${text}</p>`;
  document.querySelector('.chat-area').appendChild(panel);
  setTimeout(() => panel.remove(), 4200);
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const action = btn.dataset.action;
    const content = {
      chat: ['Chat', 'You are already in the main AI chat.'],
      voice: ['Voice Assistant', 'Click the microphone button near the message box and allow browser microphone permission.'],
      tools: ['AI Tools', 'Try the quick prompt cards for email, explanation, planning, and coding help.'],
      history: ['History', 'Chat history is stored only during this session for privacy.'],
      saved: ['Saved', 'Saved responses feature can be added next using local storage.'],
      settings: ['Settings', 'Use the sun/moon button to switch between premium blue dark mode and clean light mode.']
    }[action];
    showPanel(content[0], content[1]);
    if (window.innerWidth < 900) sidebar.classList.remove('open');
  };
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    input.value = event.results[0][0].transcript;
    input.focus();
  };

  recognition.onend = () => micBtn.classList.remove('listening');
  recognition.onerror = () => {
    micBtn.classList.remove('listening');
    alert('Microphone permission is blocked or unavailable. Please allow microphone access in your browser.');
  };
} else {
  micBtn.onclick = () => alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
}

document.querySelectorAll('.quick-prompts button').forEach(btn => {
  btn.onclick = () => {
    input.value = btn.textContent.replace(/^.+?\s/, '');
    input.focus();
  };
});

addMessage('bot', 'Hi 👋 I am **Ashwek, your AI Assistant**. How can I help you today?');
setHeroVisible();
