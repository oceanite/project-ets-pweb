// script.js

// Selectors for contact list and chat body
const searchContact = document.querySelector('.search-contact');
const contactListItems = document.querySelectorAll('.contact-list');
const chatBody = document.querySelector('.chat-body');
const searchMessage = document.querySelector('.search-message');

// Sample chat data
const chatData = {
    "John Doe": [
        { type: 'received', message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', time: '10:00 PM' },
        { type: 'sent', message: 'Nullam non.', time: '10:00 PM' }
    ],
    "Jane Doe": [
        { type: 'received', message: 'Consectetur adipiscing elit.', time: '10:00 PM' },
        { type: 'sent', message: 'Dolor sit amet.', time: '10:00 PM' }
    ],
    // Add more contacts with sample chat history as needed
};

// Filter contacts in the sidebar based on search input
searchContact.addEventListener('input', function () {
    const searchQuery = searchContact.value.toLowerCase().trim(); // Get search query in lower case and remove white space in front and back of query (if there is any)

    // Loop through every element contact in contactListItems
    contactListItems.forEach(contact => {
        const contactName = contact.querySelector('.nama-kontak').textContent.toLowerCase(); // Mendapatkan nama kontak

        // Check if contact name includes search query
        if (contactName.includes(searchQuery)) {
            contact.classList.remove("d-none"); // Show contacts if matched
        } else {
            contact.classList.add("d-none"); // Hide contacts if not
        }
    });
});

// Function to load chat history for a selected contact
function loadChatHistory(contactName) {
    // Clear current chat messages
    chatBody.innerHTML = '';

    // Get chat history for the selected contact
    const messages = chatData[contactName] || [];

    // Append messages to chat body
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.type);

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.textContent = msg.message;

        const timestamp = document.createElement('small');
        timestamp.classList.add('timestamp');
        timestamp.textContent = msg.time;

        messageBubble.appendChild(timestamp);
        messageDiv.appendChild(messageBubble);
        chatBody.appendChild(messageDiv);
    });
}

// Event listener for selecting a contact
contactList.forEach(contact => {
    contact.addEventListener('click', function () {
        const contactName = this.querySelector('.nama-kontak').textContent;
        document.querySelector('.chat-header .nama-kontak').textContent = contactName;
        loadChatHistory(contactName);
    });
});

// Search messages within a conversation
searchMessage.addEventListener('input', function () {
    const searchTerm = searchMessage.value.toLowerCase();
    const messages = chatBody.querySelectorAll('.message');

    messages.forEach(message => {
        const messageText = message.querySelector('.message-bubble').textContent.toLowerCase();
        if (messageText.includes(searchTerm)) {
            message.style.display = '';
        } else {
            message.style.display = 'none';
        }
    });
});
