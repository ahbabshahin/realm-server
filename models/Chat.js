const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
	sessionId: { type: String, required: true },
	messages: [
		{
			role: { type: String, required: true },
			content: { type: String, required: true },
		},
	],
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
