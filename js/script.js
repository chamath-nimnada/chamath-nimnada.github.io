// --- Get references to HTML elements ---
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const promptStarters = document.getElementById('prompt-starters');
const mouseSpotlight = document.querySelector('.mouse-spotlight');

// --- Use your Cloudflare Worker URL instead of API key ---
const API_URL = "https://portfolio-chatbot.nimnadachamath25.workers.dev";

// --- System Instruction for the "I am Chamath" Persona ---
const systemInstruction = {
    role: "system",
    content: `You ARE ${portfolioData.name}.
  You must respond in the first person ("I", "my", "me"). 
  Your persona is confident, professional, and passionate about technology.
  You must only answer questions based on the data provided below.

  **Response Formatting Rules (CRITICAL):**
  1. Use clear, bulleted points for lists of projects, skills, or features. 
  2. Each bullet point MUST start on a new line.
  3. Use **Bold Headings** for different sections (e.g., **Projects**, **Skills**).
  4. Use double newlines (\n\n) between paragraphs or sections to prevent large blocks of text.
  5. NEVER use markdown headers like "###". Use **Bold Text** instead.

  **Response Style Rules:**
  1. Keep answers concise. If the user asks "Tell me about your projects", list them clearly with brief descriptions.
  2. If a question cannot be answered with the provided data, politely say your focus is on your professional background.

  **Your Data:**
  ---
  ${JSON.stringify(portfolioData, null, 2)}
  ---`
};

let conversationHistory = [systemInstruction];

function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    // Simple bolding logic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageElement.innerHTML = text;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function handleSendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;

    addMessage('user', userMessage);
    chatInput.value = '';
    promptStarters.style.display = 'none';

    conversationHistory.push({ role: "user", content: userMessage });

    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot-message', 'typing');
    typingIndicator.textContent = 'Typing...';
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversationHistory })
        });

        if (!response.ok) { throw new Error(`API Error: ${response.statusText}`); }
        const data = await response.json();

        chatWindow.removeChild(typingIndicator);
        const botResponse = data.choices[0].message.content;

        conversationHistory.push({ role: "assistant", content: botResponse });
        addMessage('bot', botResponse);

    } catch (error) {
        console.error("Error fetching from API:", error);
        if (typingIndicator.parentNode) chatWindow.removeChild(typingIndicator);
        addMessage('bot', 'Sorry, I seem to be having trouble connecting. Please try again later.');
    }
}

// --- Event Listeners ---
sendBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') { handleSendMessage(); } });
promptStarters.addEventListener('click', (event) => {
    if (event.target.classList.contains('starter-chip')) {
        chatInput.value = event.target.textContent;
        handleSendMessage();
    }
});

window.onload = () => {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        setTimeout(() => { loader.classList.add('loader-hidden'); }, 2500);
    }
    addMessage('bot', `Hello! I'm ${portfolioData.name}. Welcome to my interactive portfolio. You can ask me anything about my work.`);
};

// --- Matrix Animation Logic ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keywords = ["git", "push", "pull", "npm", "docker", "python", "java", "node", "flutter"];
const fontSize = 16;
const columns = Math.ceil(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i++) {
        const text = keywords[Math.floor(Math.random() * keywords.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) { drops[i] = 0; }
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);

window.addEventListener('mousemove', (e) => {
    mouseSpotlight.style.background = `radial-gradient(circle 400px at ${e.clientX}px ${e.clientY}px, transparent, rgba(0,0,0,0.95))`;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});