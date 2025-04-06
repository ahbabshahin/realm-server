// models/Chat.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
	role: String, // 'user' | 'assistant'
	user: String,
	content: String,
	timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
	{
		chatId: { type: String, unique: true, default: uuidv4 },
		user: { type: String, required: true },
		messages: [messageSchema],
	},
	{ timestamps: true }
);

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
