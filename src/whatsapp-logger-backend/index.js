const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const port = 3000;
const connectDB = require("./config/db");
const chat = require("./models/chat");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

//endpoint untuk mengambil data chatroom
app.get("/api/chats", async (req, res,) => {
    try {
        const chatroom = await chat.aggregate([
            {
                $sort: { timestamp: -1 } // Urutkan pesan dari yang terbaru ke yang terlama
            },
            {
                $group: {
                    "_id": "$_id.remote",
                    "chatroom_name": "$notifyName",
                    "profile": "$profile_url",
                    "last_time": {$first: "$body"},
                    "last_chat": {$first: "$timestamp"},
                }
            },
            {
                $sort: { last_time: -1 } // Urutkan chatrooms berdasarkan waktu pesan terakhir
            }
        ]);
        res.status(200).json(chatrooms);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching chatrooms", error });
    }
});

// Endpoint untuk mendapatkan riwayat chat berdasarkan _id.remote
app.get("/api/chats/:remote", async (req, res) => {
    try {
        const { remote } = req.params;

        // Query database untuk mendapatkan semua pesan dengan _id.remote yang sesuai
        const chatHistory = await Chat.find({ "_id.remote": remote })
            .sort({ timestamp: 1 }); // Urutkan berdasarkan timestamp secara ascending untuk urutan waktu

        res.status(200).json(chatHistory);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat history", error });
    }
});

app.listen(port, () => {
    console.log(`Backend menggunakan express di port ${port}`);
});