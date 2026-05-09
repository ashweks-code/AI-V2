// =========================
// ASHWEK AI CONFIG
// =========================
const OPENROUTER_API_KEY = "PASTE_YOUR_OPENROUTER_API_KEY_HERE";
const MODEL_NAME = "inclusionai/ring-2.6-1t:free";

const messages = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const newChat = document.getElementById('newChat');
const themeToggle = document.getElementById('themeToggle');
const chatForm = document.getElementById('chatForm');
const toast = document.getElementById('toast');
const brandLogo = document.getElementById('brandLogo');

const conversation = [
  {
    role: 'system',
    content: 'You are Ashwek AI, a premium futuristic AI assistant. Reply in a clean ChatGPT-like style with markdown, clear structure, helpful tone, and concise professional formatting.'
  }
];

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

const savedTheme = localStorage.getItem('ashwek-theme');
if (savedTheme === 'light') document.body.classList.add('light');
updateThemeIcon();

function updateThemeIcon() {
  themeToggle.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
}

themeToggle.onclick = () => {
  document.body.classList.toggle('light');
  localStorage.setItem('ashwek-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  updateThemeIcon();
  showToast(document.body.classList.contains('light') ? 'Light mode enabled' : 'Dark mode enabled');
};

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  const html = window.marked ? marked.parse(text) : text.replace(/\n/g, '<br>');

  div.innerHTML = role === 'bot'
    ? `<div class="agent-logo msg-logo active"><div class="logo-ring"></div><div class="agent-face small-face">A</div></div><div class="bubble">${html}</div>`
    : `<div class="bubble">${html}</div>`;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function setThinking(isThinking) {
  document.querySelectorAll('.agent-logo').forEach(el => el.classList.toggle('active', isThinking));
}

async function getAIReply(userMessage) {
  conversation.push({ role: 'user', content: userMessage });

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
      messages: conversation
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(errorText);
    throw new Error(errorText);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  conversation.push({ role: 'assistant', content: reply });
  return reply;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
  input.value = '';
  input.style.height = 'auto';

  const typing = addMessage('bot', 'Thinking...');
  setThinking(true);

  try {
    const reply = await getAIReply(text);
    typing.remove();
    addMessage('bot', reply);
  } catch (error) {
    typing.remove();
    addMessage('bot', '⚠️ **API Error**\n\nPlease check your OpenRouter API key, model name, or browser console.');
  } finally {
    setThinking(false);
  }
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage();
});

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
  conversation.splice(1);
  addMessage('bot', 'New conversation started. I am **Ashwek AI** — ready to help you write, plan, analyze, or solve anything.');
  showToast('New conversation started');
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const panel = btn.dataset.panel;
    const text = {
      conversations: 'Conversation area is active.',
      templates: 'Templates ready: emails, reports, summaries, project plans.',
      tools: 'AI Toolkit ready: write, analyze, summarize, brainstorm.',
      voice: 'Voice mode ready. Tap the microphone to speak.',
      memory: 'Memory core panel opened.',
      settings: 'Settings opened. Use the top button to switch dark/light mode.',
      support: 'Support panel opened.'
    }[panel];
    showToast(text);
  };
});

document.querySelectorAll('.feature-list button').forEach(btn => {
  btn.onclick = () => showToast(btn.querySelector('strong').textContent + ' selected');
});

document.querySelectorAll('.quick-prompts button').forEach(btn => {
  btn.onclick = () => {
    input.value = btn.textContent.replace(/^.+?\s/, '');
    input.focus();
  };
});

document.getElementById('searchBtn').onclick = () => showToast('Search UI ready');
document.getElementById('magicBtn').onclick = () => {
  brandLogo.classList.add('active');
  showToast('Ashwek AI pulse activated');
};
document.getElementById('plusBtn').onclick = () => showToast('Attach option ready');
document.getElementById('webBtn').onclick = () => showToast('Web/reason mode selected');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.continuous = false;

  micBtn.onclick = () => {
    micBtn.classList.add('listening');
    showToast('Listening...');
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
