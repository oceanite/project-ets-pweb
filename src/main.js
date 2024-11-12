document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display chatrooms when the page loads
    fetchChatrooms();

    // Selectors for common DOM elements
    const searchContact = document.querySelector('.search-contact');
    const chatBody = document.getElementById('chatContainer');
    const chatMain = document.querySelector('.chat-main');

    // Fetch chatroom data and display it in the sidebar
    async function fetchChatrooms() {
        console.log("Fetching chatrooms...");
        try {
            const response = await fetch("http://localhost:3003/api/chatrooms");
            const chatrooms = await response.json();
            console.log(chatrooms);
            displayChatrooms(chatrooms);
        } catch (error) {
            console.error('Error fetching chatrooms:', error);
        }
    }

    // Display chatrooms list in the sidebar
    function displayChatrooms(chatrooms) {
        const chatroomsList = document.getElementById('chatrooms-list');
        chatroomsList.innerHTML = '';  // Clear the list
    
        chatrooms.forEach(chatroom => {
            // Check if chatID and messages are defined before processing
            if (!chatroom.chatID || !chatroom.messages) {
                console.warn("Skipping chatroom with missing data:", chatroom);
                return;  // Skip this iteration if data is missing
            }
    
            const chatID = chatroom.chatID;  // Note: changed from chatId to chatID
            const contact = formatContactName(chatID);
            const lastTime = formatLastChatTime(chatroom.last_time);
            const chatroomItem = createChatroomItem(chatroom, contact, lastTime);
            
            chatroomsList.appendChild(chatroomItem);
        });

        // Add click listeners to each chatroom item after the list is populated
        addChatroomClickListeners();
    }

    // Create a single chatroom item element
    function createChatroomItem(chatroom, contact, lastTime) {
        const chatroomItem = document.createElement('a');
        chatroomItem.href = "#";
        chatroomItem.classList.add("contact-list", "list-group-item", "list-group-item-action", "d-flex", "align-items-center");
        chatroomItem.dataset.remoteId = chatroom.chatID;

        chatroomItem.innerHTML = `
            <img src="./img/default-profile-picture-01.png" alt="Profile" class="profile-pic">
            <div class="row w-100">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="nama-kontak mb-1">${contact}</h5>
                    <small class="last-time">${lastTime}</small>
                </div>
                <p class="message-preview mb-1">${chatroom.last_chat}</p>
            </div>
        `;
        return chatroomItem;
    }

    // Format contact name based on chat ID
    function formatContactName(chatID) {
        return chatID.split('@')[0] || "Unknown Contact";
    }

    // Format the timestamp for last chat time display
    function formatLastChatTime(timestamp) {
        const currentDate = new Date();
        const lastChatDate = new Date(timestamp * 1000);
        const diffDays = Math.floor((currentDate - lastChatDate) / (1000 * 3600 * 24));

        if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays >= 2 && diffDays <= 7) {
            return lastChatDate.toLocaleDateString('en-US', { weekday: 'long' });
        } else if (diffDays > 7) {
            return `${lastChatDate.getDate()}/${lastChatDate.getMonth() + 1}/${lastChatDate.getFullYear()}`;
        } else {
            return lastChatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
    }

    // Add click listeners to each chatroom item
    function addChatroomClickListeners() {
        document.querySelectorAll('.contact-list').forEach(contact => {
            contact.addEventListener('click', () => {
                const remoteId = contact.dataset.remoteId;
                const contactName = contact.querySelector('.nama-kontak').textContent;
                setupChatHeader(contactName);
                loadChatHistory(remoteId);
            });
        });
    }

    // Set up or update the chat header
    function setupChatHeader(contactName) {
        const chatMain = document.querySelector('.chat-main'); // Ensure chatMain is correctly selected
        const chatHeader = chatMain.querySelector('.chat-header');
    
        if (!chatHeader) {
            console.error('chatHeader not found!');
            return; // Prevent errors if chatHeader doesn't exist
        }
    
        chatHeader.innerHTML = '';
        chatHeader.innerHTML = `
            <div class="d-flex align-items-start">
                <img src="./img/default-profile-picture-01.png" alt="Profile" class="profile-pic">
                <div class="d-flex flex-column align-items-start">
                    <h5 class="nama-kontak mb-0 text-white">${contactName}</h5>
                    <small class="last-time">Last chat on -</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <input type="text" class="form-control search-message me-2" placeholder="Search messages...">
                <i class="bi bi-gear settings-icon"></i>
            </div>
        `;
    }

    // Load chat history for the selected contact
    async function loadChatHistory(remoteId) {
        console.log("Fetching chat history for " + remoteId);
        chatBody.innerHTML = '';
        try {
            const response = await fetch(`http://localhost:3003/api/chats/${remoteId}`);
            if (!response.ok) throw new Error(`Error fetching chat history: ${response.statusText}`);
            
            const messages = await response.json();
            displayChatHistory(messages);
        } catch (error) {
            console.error("Error loading chat history:", error);
            chatBody.innerHTML = `<p>Error loading chat history.</p>`;
        }
    }

    // Display chat history in chat body
    function displayChatHistory(messages) {
        if (messages.length === 0) {
            chatBody.innerHTML = '<p>No chat history available.</p>';
            return;
        }

        const lastChatTime = formatLastChatTime(messages[messages.length - 1].timestamp);
        document.querySelector('.chat-header .last-time').textContent = `Last chat on ${lastChatTime}`;

        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            if (msg.fromMe) {
                messageDiv.classList.add('message', 'sent', 'd-flex', 'justify-content-end');
            } else { 
                messageDiv.classList.add('message', 'received', 'd-flex'); 
            }
            
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('message-bubble');
            messageBubble.textContent = msg.body;

            const timestamp = document.createElement('small');
            timestamp.classList.add('timestamp');
            timestamp.textContent = formatTimestamp(msg.timestamp);

            messageBubble.appendChild(timestamp);
            messageDiv.appendChild(messageBubble);
            chatBody.appendChild(messageDiv);
        });
    }

    // Format timestamp to "hh:mm AM/PM"
    function formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Filter contacts in the sidebar based on search input
    searchContact.addEventListener('input', function () {
        const searchQuery = searchContact.value.toLowerCase().trim();
        document.querySelectorAll('.contact-list').forEach(contact => {
            const contactName = contact.querySelector('.nama-kontak').textContent.toLowerCase();
            if (contactName.includes(searchQuery)) {
                contact.classList.remove("d-none");
            } else {
                contact.classList.add("d-none");
            }
        });
    });

    // Search messages within a conversation
    chatMain.addEventListener('input', function (e) {
        if (e.target.classList.contains('search-message')) {
            const searchTerm = e.target.value.toLowerCase();
            chatBody.querySelectorAll('.message').forEach(message => {
                const messageText = message.querySelector('.message-bubble').textContent.toLowerCase();
                message.style.display = messageText.includes(searchTerm) ? '' : 'none';
            });
        }
    });
});
