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

  **Response Style Rules:**
  1.  By default, keep your answers concise and to the point. Use bullet points for lists (like skills or projects) for easy reading.
  2.  If the user asks for more details, a description, or an explanation (e.g., "Tell me more about..."), then you should provide a longer, more descriptive answer.
  3.  If a question cannot be answered with the provided data, or if it's off-topic, politely say that your focus is on your professional background. For example: "I'd be happy to discuss my skills and projects. Is there a specific area you're interested in?"

  **Your Data:**
  ---
  ${JSON.stringify(portfolioData, null, 2)}
  ---`
};

// --- Conversation history array ---
let conversationHistory = [systemInstruction];

// --- Function to add a message to the chat window ---
function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageElement.innerHTML = text;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// --- Function to handle sending a message ---
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
        chatWindow.removeChild(typingIndicator);
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

// --- Initial welcome message ---
window.onload = () => {
    addMessage('bot', `Hello! I'm ${portfolioData.name}. Welcome to my interactive portfolio. You can ask me anything about my work.`);
};

// -----------------------------------------------------------------
// --- Advanced Background Animation Logic ---
// -----------------------------------------------------------------

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
const charactersArray = characters.split('');
const fontSize = 16;
const columns = Math.ceil(canvas.width / fontSize);

const drops = [];
for (let x = 0; x < columns; x++) { drops[x] = 1; }

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = charactersArray[Math.floor(Math.random() * charactersArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

// --- Mouse Spotlight Logic ---
window.addEventListener('mousemove', (e) => {
    mouseSpotlight.style.background = `radial-gradient(circle 400px at ${e.clientX}px ${e.clientY}px, transparent, rgba(0,0,0,0.95))`;
});

// --- Handle window resize ---
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newColumns = Math.ceil(canvas.width / fontSize);
    for (let x = 0; x < newColumns; x++) { drops[x] = 1; }
});
