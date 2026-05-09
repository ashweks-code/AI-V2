const messages = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const newChat = document.getElementById('newChat');
const themeToggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('ashwek-theme');
if (savedTheme === 'light') document.body.classList.add('light');
themeToggle.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';

themeToggle.onclick = () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('ashwek-theme', isLight ? 'light' : 'dark');
};

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  const html = window.marked ? marked.parse(text) : text.replace(/\n/g, '<br>');
  div.innerHTML = role === 'bot'
    ? `<div class="bot-avatar">A</div><div class="bubble">${html}</div>`
    : `<div class="bubble">${html}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function generateLocalReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes('email')) {
    return `Certainly — here is a clean email format:\n\n**Subject:** Quick Follow-Up\n\nHi [Name],\n\nI hope you're doing well. I wanted to quickly follow up regarding [topic]. Please let me know if there are any updates or if anything is needed from my side.\n\nBest regards,\nAshwek`;
  }
  if (lower.includes('hi') || lower.includes('hello')) {
    return `Hi Ashwek 👋\n\nI am **Ashwek, your AI Assistant**. How can I help you today?`;
  }
  return `I can help with that.\n\nHere is a clear response based on your message:\n\n${text}\n\nTell me the exact details and I will format it properly.`;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage('user', text);
  input.value = '';
  input.style.height = 'auto';
  addMessage('bot', 'Typing...');
  const last = messages.lastElementChild;
  setTimeout(() => {
    last.remove();
    addMessage('bot', generateLocalReply(text));
  }, 650);
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
  addMessage('bot', 'Hi! I am **Ashwek, your AI Assistant**. New chat started. How can I help you today?');
};

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
