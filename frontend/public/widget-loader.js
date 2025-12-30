(function() {
    const scriptTag = document.currentScript;
    const apiKey = scriptTag.getAttribute('data-api-key');
    const API_BASE_URL = "https://admin-backend-m6dq.onrender.com"; // Your Backend
  
    // 1. Validate API Key with your backend
    fetch(`${API_BASE_URL}/api/companies/verify-key?apiKey=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.valid) {
          initChatWidget(apiKey);
        } else {
          console.error("FineChat: Invalid API Key. Chat widget failed to load.");
        }
      })
      .catch(err => console.error("FineChat: Connection error."));
  
      function initChatWidget(key) {
        const iframe = document.createElement('iframe');
        iframe.id = 'finechat-iframe';
        iframe.src = `https://finechat-imdq.onrender.com?apiKey=${key}`;
        
        // Initial style (just big enough for the button)
        iframe.style.position = 'fixed';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
        iframe.style.width = '80px'; 
        iframe.style.height = '80px';
        iframe.style.border = 'none';
        iframe.style.zIndex = '999999';
        iframe.style.transition = 'width 0.3s, height 0.3s'; // Smooth expansion
        
        document.body.appendChild(iframe);
    
        // Listen for messages from React to resize the iframe
        window.addEventListener('message', (event) => {
          if (event.data === 'openChat') {
            iframe.style.width = '400px';
            iframe.style.height = '600px';
          } else if (event.data === 'closeChat') {
            iframe.style.width = '80px';
            iframe.style.height = '80px';
          }
        });
    }
  })();