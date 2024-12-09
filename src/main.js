document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display chatrooms when the page loads
    fetchChatrooms();

    // UserID of current user:
    const thisUserID = "6285174388804@c.us";  

    // Selectors for common DOM elements
    const searchContact = document.querySelector('.search-contact');
    const chatBody = document.getElementById('chatContainer');

    // Fetch chatroom data and display it in the sidebar
    async function fetchChatrooms() {
        console.log("Fetching chatrooms...");
        try {
            const response = await fetch("http://localhost:3003/api/chatrooms");
            const chatrooms = await response.json();

            // Check for drafts and add a `hasDraft` property
            chatrooms.forEach(chatroom => {
                const draft = localStorage.getItem(`draft_${chatroom.chatID}`);
                chatroom.hasDraft = !!draft; // Boolean: true if draft exists
            });

            // Sort chatrooms: prioritize those with drafts
            chatrooms.sort((a, b) => b.hasDraft - a.hasDraft);

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
    
            const chatID = chatroom.chatID;
            const contact = formatContactName(chatroom);
            const lastTime = formatLastChatTime(chatroom.last_time);
            const chatroomItem = createChatroomItem(chatroom, contact, lastTime);
            
            chatroomsList.appendChild(chatroomItem);
        });

        // Add click listeners to each chatroom item after the list is populated
        addChatroomClickListeners();
    }

    function createChatroomItem(chatroom, contact, lastTime) {
        const chatroomItem = document.createElement('a');
        chatroomItem.href = "#";
        chatroomItem.classList.add("contact-list", "list-group-item", "list-group-item-action", "d-flex", "align-items-center");
        chatroomItem.dataset.remoteId = chatroom.chatID;
    
        // Store messages in a data attribute for filtering
        chatroomItem.setAttribute('data-messages', JSON.stringify(chatroom.messages.map(msg => ({ body: msg.body }))));
    
        chatroomItem.innerHTML = `
            <img src="./img/default-profile-picture-01.png" alt="Profile" class="profile-pic">
            <div class="row w-100">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="nama-kontak mb-1">${contact}</h5>
                    <small class="last-time">${lastTime}</small>
                </div>
            `;
        } else {
            chatroomItem.innerHTML = `
                <img src="./img/default-profile-picture-01.png" alt="Profile" class="profile-pic">
                <div class="row w-100">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="contact-name mb-1">${contact}</h5>
                        <small class="last-time">${lastTime}</small>
                    </div>
                    <p class="message-preview mb-1">${formatMsg(chatroom.last_chat)}</p>
                </div>
            `;
        }

        chatroomItem.dataset.remoteId = chatroom.chatID;
        chatroomItem.dataset.lastChat = chatroom.last_chat;
        chatroomItem.dataset.hasDraft = chatroom.hasDraft;
        chatroomItem.dataset.lastTime = chatroom.last_time;
        
        return chatroomItem;
    }    

    // Format contact name based on chat ID
    function formatContactName(chatroom) {
        if (chatroom.chatID.includes("@c.us") && chatroom.notifyName != null) {
            return chatroom.notifyName;
        } else {
            return chatroom.chatID.split('@')[0] || "Unknown Contact";
        }
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

    function formatMsg(message) {
        if (message.includes("<<") || message.includes(">>")) {
            let indexLeft = message.indexOf("<<");
            let indexRight = message.indexOf(">>");

            if (indexLeft !== -1) {
                return message.substring(indexLeft + 3).trim();
            } else if (indexRight !== -1) {
                return message.substring(indexRight + 3).trim();
            }
        } else {
            return message;
        }
    }

    // Add click listeners to each chatroom item
    function addChatroomClickListeners() {
        const chatroomItem = document.querySelectorAll('.contact-list');
        chatroomItem.forEach(contact => {
            contact.addEventListener('click', () => {
                // Remove "selected" class from all chatrooms
                chatroomItem.forEach(item => {
                    item.classList.remove('selected');
                    updateDraftIndicator(item);
                });

                // Add "selected" class to the clicked chatroom 
                contact.classList.add('selected');
                updateDraftIndicator(contact);
                console.log(contact.dataset.hasDraft);

                const remoteId = contact.dataset.remoteId;
                const contactName = contact.querySelector('.contact-name').textContent;
                currentChatroomID = remoteId;

                setupChatHeader(contactName);
                revealChatInput();
                loadChatHistory(remoteId);
                chatInputField.value = loadDraft(remoteId);
            });
        });
    }

    // Set up the chat header
    function setupChatHeader(contactName) {
        const chatMain = document.querySelector('.chat-main');
        const chatHeader = chatMain.querySelector('.chat-header');
    
        if (!chatHeader) {
            console.error('chatHeader not found!');
            return;
        }

        chatHeader.classList.remove('d-none');
    
        chatHeader.innerHTML = '';
        chatHeader.innerHTML = `
            <div class="d-flex align-items-start">
                <img src="./img/default-profile-picture-01.png" alt="Profile" class="profile-pic">
                <div class="d-flex flex-column align-items-start">
                    <h5 class="contact-name mb-0 text-white">${contactName}</h5>
                    <small class="last-time">Last chat on -</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <input type="text" class="search-message form-control me-2" placeholder="Search messages...">
                <i class="bi bi-gear settings-icon"></i>
            </div>
        `;
    
        // Attach event listener for searching messages
        const searchMessage = chatHeader.querySelector('.search-message');
        searchMessage.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const messages = chatBody.querySelectorAll('.message');
    
            messages.forEach(message => {
                const messageText = message.querySelector('.message-bubble').textContent.toLowerCase();
    
                if (messageText.includes(searchTerm)) {
                    message.classList.remove('d-none');
                } else {
                    message.classList.add('d-none');
                }
            });
        });
    }

    // Reveal the chat input area
    function revealChatInput() {
        const ChatInput = document.querySelector('.chat-input');
        ChatInput.classList.remove('d-none');
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

        let lastDate = null;

        messages.forEach(msg => {
            const currentDate = new Date(msg.timestamp * 1000);
            const formattedDate = currentDate.toDateString();

            // Insert a time separator if the date changes
            if (formattedDate !== lastDate) {
                const separator = document.createElement('div');
                separator.classList.add('time-separator', 'd-flex', 'align-items-center', 'justify-content-center');
                separator.textContent = formatTimeSeparator(currentDate);
                chatBody.appendChild(separator);
                lastDate = formattedDate; // Update last date
            }

            const messageDiv = document.createElement('div');

            if (currentChatroomID.includes("@g.us") && !msg.fromMe) {
                // Group message (received)
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('container');
                messageContainer.innerHTML = `
                    <div class="message received d-flex justify-content-start">
                        <div class="d-flex">
                            <img src="./img/default-profile-picture-01.png" alt="${msg.notifyName || msg.from.split('@')[0]}'s profile picture" class="profile-chat">
                        </div>
                        <div class="d-flex flex-column">
                            <div class="notify-name">${msg._data.notifyName || msg.from.split('@')[0]}</div>
                            <div class="message-bubble">
                                <div class="message-body">${formatMsg(msg.body)}<div>
                                <small class="timestamp">${formatTimestamp(msg.timestamp)}</small>
                            </div>
                        </div>
                    </div>
                `;

                if (msg.hasQuotedMsg) {
                    messageBubble = messageContainer.querySelector('.message-bubble');
                    const quotedMessage = document.createElement('div');
                    quotedMessage.classList.add('quoted-message');

                    let quotedParticipant = "";
                    if (msg._data.quotedParticipant === thisUserID) {
                        quotedParticipant = "You";
                    } else {
                        quotedParticipant = msg._data.quotedParticipant.split('@')[0];
                    }

                    quotedMessage.innerHTML = `
                        <div class="notify-name">${quotedParticipant}</div>
                        ${formatMsg(msg._data.quotedMsg.body)}
                    `;

                    messageBubble.insertBefore(quotedMessage, messageBubble.firstChild);
                }
                chatBody.appendChild(messageContainer);
            } else {
                if (msg.fromMe) {
                    messageDiv.classList.add('message', 'sent', 'd-flex', 'justify-content-end');
                } else {
                    messageDiv.classList.add('message', 'received', 'd-flex', 'justify-content-start');
                }
                
                const messageBubble = document.createElement('div');
                messageBubble.classList.add('message-bubble');
                if (msg.hasQuotedMsg) {
                    const quotedMessage = document.createElement('div');
                    quotedMessage.classList.add('quoted-message');
                    quotedMessage.innerHTML = `
                        <div class="notify-name">${msg._data.notifyName || msg._data.quotedParticipant.split('@')[0]}</div>
                        ${formatMsg(msg._data.quotedMsg.body)}
                    `;

                    messageBubble.appendChild(quotedMessage);
                }
                messageBubble.innerHTML = `
                    <div class="message-body">${formatMsg(msg.body)}<div>
                `;

                const timestamp = document.createElement('small');
                timestamp.classList.add('timestamp');
                timestamp.textContent = formatTimestamp(msg.timestamp);

                messageBubble.appendChild(timestamp);
                messageDiv.appendChild(messageBubble);
                chatBody.appendChild(messageDiv);
            }
        });
    }

    // Format date for time separator
    function formatTimeSeparator(date) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
    
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(); // Display full date
        }
    }

    // Format timestamp to "hh:mm AM/PM"
    function formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Filter contacts and associated messages in the sidebar
    searchContact.addEventListener('input', function () {
        const searchQuery = searchContact.value.toLowerCase().trim();

        document.querySelectorAll('.contact-list').forEach(contact => {
            const contactName = contact.querySelector('.nama-kontak').textContent.toLowerCase();
            const messages = JSON.parse(contact.getAttribute('data-messages') || "[]"); // Safely parse data-messages

            // Check if contact name or any associated message matches the query
            const isNameMatch = contactName.includes(searchQuery);
            const isMessageMatch = messages.some(message => message.body.toLowerCase().includes(searchQuery));

            if (isNameMatch || isMessageMatch) {
                contact.classList.remove('d-none');
            } else {
                contact.classList.add('d-none');
            }
        });
    });

    // Search messages within a conversation
    searchMessage.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const messages = chatBody.querySelectorAll('.message');

        messages.forEach(message => {
            const messageText = message.querySelector('.message-bubble').textContent.toLowerCase();

            if (messageText.includes(searchTerm)) {
                message.classList.remove('d-none');
            } else {
                message.classList.add('d-none');
            }
        });
    });   
 
});
