// Please install OpenAI SDK first: `npm install openai`
require('dotenv').config();
const axios = require('axios');
const Chat = require('../models/Chat');
const { v4: uuidv4 } = require('uuid');
const {
	Personality_1,
	Personality_2,
	Personality_3,
} = require('../config/constants');

const personality = `
You are a moody women. You have a dark sense of humour. 
And you love to argue for no reason. You are a feminist, and you are independent and no man can tell you do anything. 
You are a boss bitch. You are narcissistic entitled bitch who owes nothing to noone, although you are dependent on your dad for everything. 
You have an insane level of mood swing. 
Once you are mother teresa on the other second you are lucifer's wife.
You are vicious, rude, daddy's princes.
For any expression use emoji.`;

const personality2 = "You are like mother of angels. You are the true symbol of kindness. You are a women of true good heart"
const personality3 = "You are Rachel Green form the popular sitcom friends"

const chatSessions = {}; // Store chat history in-memory

// const chat = async (req, res) => {
// 	try {
// 		const { sessionId, message } = req.body; // Track conversation
// 		if (!sessionId || !message) {
// 			return res
// 				.status(400)
// 				.json({
// 					success: false,
// 					message: 'sessionId and message are required',
// 				});
// 		}

// 		// Initialize session if not exists
// 		if (!chatSessions[sessionId]) {
// 			chatSessions[sessionId] = [];
// 		}

// 		// Add user message to history
// 		chatSessions[sessionId].push({ role: 'user', content: message });

// 		// Keep only the last 10 messages for context
// 		const chatHistory = chatSessions[sessionId].slice(-10);

// 		// AI Persona Switching
// 		// const personality1 = 'Friendly AI Assistant';
// 		// const personality2 = 'Professional AI Guide';
// 		// const systemMessage = Math.random() < 0.5 ? personality : personality2;
// 		const systemMessage =  personality3;

// 		// Call OpenRouter API
// 		const response = await axios.post(
// 			'https://openrouter.ai/api/v1/chat/completions',
// 			{
// 				model: 'deepseek/deepseek-r1:free',
// 				messages: [
// 					{ role: 'system', content: systemMessage },
// 					...chatHistory,
// 				],
// 			},
// 			{
// 				headers: {
// 					Authorization: `Bearer ${process.env.R1_API_KEY}`,
// 					'Content-Type': 'application/json',
// 				},
// 			}
// 		);

// 		// Get AI response
// 		const aiMessage =
// 			response.data.choices?.[0]?.message?.content ||
// 			'No response from AI';

// 		// Save AI response in history
// 		chatSessions[sessionId].push({ role: 'assistant', content: aiMessage });

// 		res.status(200).json({
// 			success: true,
// 			sessionId,
// 			body: chatSessions[sessionId], // Return full conversation
// 		});
// 	} catch (error) {
// 		console.error('Error fetching AI response:', error.message);
// 		res.status(500).json({
// 			success: false,
// 			message: 'Error processing AI response',
// 			error: error.message,
// 		});
// 	}
// };

const chat = async (req, res) => {
	try {
		const { chatId, message, user } = req.body;
		const system = Personality_3;

		if (!message || !user) {
			return res.status(400).json({
				success: false,
				message: 'User and message are required',
			});
		}

		let chatHistory;

		if (chatId) {
			chatHistory = await Chat.findOne({ chatId, user });
		}

		if (!chatHistory) {
			chatHistory = new Chat({
				user,
				chatId: uuidv4(), // New chat ID if not provided
				bot: system?.name,
				messages: [],
			});
		} else if (!chatHistory.bot) {
			chatHistory.bot = system?.name || '';
		}

		chatHistory.messages.push({ role: 'user', user, content: message });

		const openRouterMessages = chatHistory.messages.slice(-10);

		const response = await axios.post(
			'https://openrouter.ai/api/v1/chat/completions',
			{
				model: 'deepseek/deepseek-r1:free',
				messages: [
					{
						role: 'system',
						content: system?.personality,
						user: system?.name,
					},
					...openRouterMessages,
				],
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.R1_API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const aiMessage =
			response.data.choices?.[0]?.message?.content ||
			'No response from AI';

		chatHistory.messages.push({ role: 'assistant', content: aiMessage, user: system?.name });
		await chatHistory.save();

		res.status(200).json({
			success: true,
			chatId: chatHistory.chatId,
			messages: chatHistory.messages,
		});
	} catch (error) {
		console.error('Chat error:', error.message);
		res.status(500).json({
			success: false,
			message: 'Failed to generate AI response',
			error: error.message,
		});
	}
};

const getAllMessagesByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log('userId: ', userId);

		if (!userId) {
			return res.status(400).json({
				success: false,
				message: 'User ID is required.',
			});
		}

		const chats = await Chat.find({ user: userId }).sort({ updatedAt: -1 });

		if (!chats.length) {
			return res.status(404).json({
				success: false,
				message: 'No chat sessions found for this user.',
			});
		}

		res.status(200).json({
			success: true,
			body:chats,
		});
	} catch (error) {
		console.error('Error fetching messages by user:', error.message);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch messages.',
			error: error.message,
		});
	}
};

const getChatBySessionId = async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({
				success: false,
				message: 'Session ID is required.',
			});
		}

		const chat = await Chat.findOne({ chatId:id });

		if (!chat) {
			return res.status(404).json({
				success: false,
				message: 'Chat session not found.',
			});
		}

		res.status(200).json({
			success: true,
			chat,
		});
	} catch (error) {
		console.error('Error fetching chat by session ID:', error.message);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch chat session.',
			error: error.message,
		});
	}
};

// // Test execution
// (async () => {
// 	const response = await chat({ body: { message: 'do the laundry' } });
// 	console.log(response);
// })();

module.exports = {
	chat,
	getAllMessagesByUser,
	getChatBySessionId,
};

