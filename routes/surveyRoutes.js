const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, surveyController.createSurveyRequest);
router.get('/', verifyToken, surveyController.getAllSurveys);
router.get('/all', verifyToken, surveyController.getAllSurveyRequests);

module.exports = router;
