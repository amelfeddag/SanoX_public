import express from 'express';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Medical Chatbot
 *   description: AI-powered medical symptom assessment chatbot
 */

/**
 * @swagger
 * /api/chatbot/first-question:
 *   get:
 *     summary: Get the first question for symptom assessment
 *     tags: [Medical Chatbot]
 *     description: Retrieve the initial question to start the medical assessment conversation
 *     responses:
 *       200:
 *         description: First question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatQuestion'
 *             example:
 *               id: 1
 *               text: "What is your primary symptom?"
 *               choices:
 *                 - id: 1
 *                   text: "Fever"
 *                   nextQuestionId: 2
 *                 - id: 2
 *                   text: "Cough"
 *                   nextQuestionId: 3
 */

/**
 * @swagger
 * /api/chatbot/next-question:
 *   post:
 *     summary: Get next question based on user choice
 *     tags: [Medical Chatbot]
 *     description: Get the next question in the symptom assessment flow based on user's previous answer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - choiceId
 *             properties:
 *               choiceId:
 *                 type: integer
 *                 description: ID of the selected choice from previous question
 *             example:
 *               choiceId: 1
 *     responses:
 *       200:
 *         description: Next question or end of assessment
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ChatQuestion'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "End of questionnaire"
 *       400:
 *         description: Choice ID required
 *       404:
 *         description: Question not found
 */

// Hardcoded questions and answers
const questions = {
  1: { id: 1, text: "What is your primary symptom?", choices: [{ id: 1, text: "Fever", nextQuestionId: 2 }, { id: 2, text: "Cough", nextQuestionId: 3 }] },
  2: { id: 2, text: "Do you have a high fever?", choices: [{ id: 3, text: "Yes", nextQuestionId: null }, { id: 4, text: "No", nextQuestionId: null }] },
  3: { id: 3, text: "Is your cough dry or wet?", choices: [{ id: 5, text: "Dry", nextQuestionId: null }, { id: 6, text: "Wet", nextQuestionId: null }] }
};

// Route to get the first question
router.get('/first-question', (req, res) => {
  res.json(questions[1]);
});

// Route to get the next question based on user choice
router.post('/next-question', (req, res) => {
  const { choiceId } = req.body;

  let nextQuestionId = null;

  // Find the next question from current choices
  for (let key in questions) {
    const question = questions[key];
    const selectedChoice = question.choices.find(choice => choice.id === choiceId);
    if (selectedChoice) {
      nextQuestionId = selectedChoice.nextQuestionId;
      break;
    }
  }

  if (!nextQuestionId) {
    return res.json({ message: "End of questionnaire" });
  }

  res.json(questions[nextQuestionId]);
});

export default router;
