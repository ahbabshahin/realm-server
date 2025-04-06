const express = require('express');
const router = express.Router();

const { chat, getAllMessagesByUser, getChatBySessionId } = require('../controllers/chatController');

router.post('/', chat);
router.get('/:userId', getAllMessagesByUser);
router.get('/message/:id', getChatBySessionId);

module.exports = router;