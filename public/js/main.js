// Internet Connectivity Monitor (defensive checks for pages without status elements)
let wasOnline = navigator.onLine;
const statusIndicator = typeof document !== 'undefined' ? document.getElementById('statusIndicator') : null;
const statusText = typeof document !== 'undefined' ? document.getElementById('statusText') : null;

function updateOnlineStatus() {
  const isCurrentlyOnline = navigator.onLine;

  // Only update UI if elements exist on the page
  if (statusIndicator && statusText) {
    if (isCurrentlyOnline) {
      statusIndicator.classList.remove('offline');
      statusText.textContent = 'SYSTEM ONLINE';
      statusText.classList.remove('text-red-400');
      statusText.classList.add('text-emerald-400');

      // Reload page if coming back online from offline state
      if (!wasOnline) {
        wasOnline = true;
        location.reload();
      }
      wasOnline = true;
    } else {
      statusIndicator.classList.add('offline');
      statusText.textContent = 'OFFLINE';
      statusText.classList.remove('text-emerald-400');
      statusText.classList.add('text-red-400');
      wasOnline = false;
    }
  } else {
    // If status elements are not present, just update internal state
    wasOnline = isCurrentlyOnline;
  }
}

// Monitor connectivity
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial status check
updateOnlineStatus();


// Live Stats Updates
async function fetchStats() {
  if (!navigator.onLine) return;
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');

    const data = await response.json();

    const uptimeEl = document.getElementById('uptime');
    const latencyEl = document.getElementById('latency');
    const requestsEl = document.getElementById('requests');

    if (uptimeEl) uptimeEl.textContent = data.uptime;
    if (latencyEl) latencyEl.textContent = data.latency + 'ms';
    if (requestsEl) requestsEl.textContent = data.requests;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Fetch stats on load and every 10 seconds
fetchStats();
setInterval(fetchStats, 10000);

// AI Chat Functionality (only if chat elements exist)
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

if (chatToggle && chatPanel && chatClose && chatInput && chatSend && chatMessages) {
  function openChat() {
    chatPanel.classList.remove('hidden');
    chatToggle.setAttribute('aria-expanded', 'true');
    chatInput.focus();
  }

  function closeChat() {
    chatPanel.classList.add('hidden');
    chatToggle.setAttribute('aria-expanded', 'false');
    chatToggle.focus();
  }

  chatToggle.addEventListener('click', openChat);
  chatToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openChat();
    }
  });

  chatClose.addEventListener('click', closeChat);
  chatClose.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeChat();
    }
  });

  // Focus trap for chat panel
  chatPanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeChat();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = chatPanel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    chatInput.value = '';

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      // Remove typing indicator
      typingIndicator.remove();

      // Add AI response
      addMessageToChat('ai', data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      typingIndicator.remove();
      addMessageToChat('ai', "Sorry, I'm having trouble connecting. Please check your internet connection.");
    }
  }

  function addMessageToChat(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-[80%] px-3 py-2 rounded-lg text-sm ${type === 'user'
      ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
      : 'bg-gray-800 border border-gray-700 text-gray-300'
      }`;
    bubble.textContent = text;

    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'flex justify-start';
    indicator.innerHTML = `
      <div class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400">
        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></span>
        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style="animation-delay: 0.2s"></span>
        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  chatSend.addEventListener('click', sendMessage);

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Track page view
if (navigator.onLine) {
  fetch('/api/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventType: 'page_view',
      page: window.location.pathname
    })
  }).catch(err => console.error('Tracking error:', err));
}

// Auto-retry connection
let retryAttempts = 0;
const maxRetries = 5;

function attemptReconnect() {
  if (!navigator.onLine && retryAttempts < maxRetries) {
    retryAttempts++;
    console.log(`Attempting to reconnect... (${retryAttempts}/${maxRetries})`);

    fetch('/health')
      .then(() => {
        console.log('Connection restored!');
        location.reload();
      })
      .catch(() => {
        setTimeout(attemptReconnect, 5000); // Retry every 5 seconds
      });
  }
}

window.addEventListener('offline', () => {
  retryAttempts = 0;
  setTimeout(attemptReconnect, 5000);
});