document.addEventListener('DOMContentLoaded', () => {
    const chatbotHeader = document.getElementById('chatbotHeader');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotToggleIcon = document.getElementById('chatbotToggleIcon');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatMessages = document.getElementById('chatMessages');

    // Toggle Chatbot
    chatbotHeader.addEventListener('click', () => {
        chatbotContainer.classList.toggle('collapsed');
        if (chatbotContainer.classList.contains('collapsed')) {
            chatbotToggleIcon.classList.remove('fa-chevron-down');
            chatbotToggleIcon.classList.add('fa-chevron-up');
        } else {
            chatbotToggleIcon.classList.remove('fa-chevron-up');
            chatbotToggleIcon.classList.add('fa-chevron-down');
            chatInput.focus();
        }
    });

    const appendMessage = (text, sender, isHtml = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        
        if (isHtml) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.textContent = text;
        }
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'ai-message', 'typing-indicator');
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const typingDiv = document.getElementById('typingIndicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    };

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Display user message
        appendMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            removeTypingIndicator();

            if (data.reply) {
                // Parse markdown to HTML using marked.js
                const htmlReply = typeof marked !== 'undefined' ? marked.parse(data.reply) : data.reply;
                appendMessage(htmlReply, 'ai', true);
            } else if (data.error) {
                appendMessage('Sorry, an error occurred: ' + data.error, 'ai');
            } else {
                appendMessage('Sorry, I could not process that request.', 'ai');
            }
        } catch (error) {
            removeTypingIndicator();
            appendMessage('Connection error. Please try again later.', 'ai');
        }
    };

    chatSendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
