const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { ensureAuthenticated } = require('../middlewares/authMiddleware');

// router.get('/login', authController.login);
// router.post('/login', authController.login);
router.get('/register', authController.register);
router.post('/adduser', authController.addUser);
router.get('/check-session', authController.checkSession);
router.get('/stream-token', authController.getStreamToken);
router.get('/validate-stream-token', authController.validateStreamToken);
router.get('/stream-proxy', authController.streamProxy);

module.exports = router;