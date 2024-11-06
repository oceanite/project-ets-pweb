const mongoose = require('mongoose');

// Define the schema for a message
const messageSchema = new mongoose.Schema({
    _id: { // Unique message ID
        fromMe: { type: Boolean, required: true},
        remote: { type: String, required: true },
        id: { type: String, required: true, unique: true },
        participant: [String],
        _serialized: { type: String, required: true }
     }, 
    from: { type: String, required: true }, // Sender ID
    to: { type: String, required: true }, // Receiver ID (or group ID)
    author: { type: String }, //Sender ID for group chat
    notifyName: { type: String, required: true }, //Sender/contact name
    groupName: { type: String }, //group chat room name
    body: { type: String, required: true }, // Message body
    timestamp: { type: Number, required: true }, // Unix timestamp for the message
    type: { type: String, required: true }, // Type of message
    hasMedia: { type: Boolean, required: true }, // Indicates if the message contains media
    media: { 
        type: {
            type: String, // Media type (e.g., 'image', 'video', 'document')
            enum: ['image', 'video', 'document', null] // Allow null if no media
        },
        url: { type: String }, // URL for the media
        caption: { type: String } // Caption for the media
    },
    links: [String], //list of links/URL in chat if any
    profile_url: { type: String, required: true }, //URL for profile chat
    gprofile_url: { type: String }, //URL for group profile
});

// Define the schema for a chat room
const chatSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true }, // Unique chat ID
    chatroom_name: { type: String, required: true },
    profile: { type: String, required: true }, //URL for profile chat
    last_time: { type: Number, required: true }, // Timestamp of the last chat message
    last_chat: { type: String, required: true },
    messages: [messageSchema] // Array of messages
});

// Create a model from the schema
const chat = mongoose.model('chat', chatSchema);

module.exports = chat;