const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

router.get('/dashboard', ensureAuthenticated, customerController.dashboard);
router.get('/infodevices', customerController.infoDevices);
router.post('/updatestream', customerController.updateDeviceStream);

module.exports = router;