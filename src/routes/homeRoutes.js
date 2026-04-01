const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');

router.get('/', homeController.index);

router.get('/login', authController.login);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/termos', homeController.termos);
router.get('/privacidade', homeController.privacidade);

module.exports = router;