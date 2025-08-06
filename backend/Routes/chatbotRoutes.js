import express from 'express';
import {  MedicalChatService, ChatController} from '../Controllers/chatbotController.js';
import authenticateUser from '../Middleware/authMiddleware.js';
import swaggerJSDoc from 'swagger-jsdoc';

const router = express.Router();
const chatController = new ChatController();
const medicalChat = new MedicalChatService();

/**
 * @swagger
 * tags:
 *   name: Medical Chat
 *   description: AI-powered medical consultation chat
 */

/**
 * @swagger
 * /api/chatbot/conversations/start:
 *   post:
 *     summary: Start a new medical consultation
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - initial_symptoms
 *             properties:
 *               patient_id:
 *                 type: string
 *                 description: Patient's user ID
 *               initial_symptoms:
 *                 type: string
 *                 description: Patient's initial symptom description
 *     responses:
 *       200:
 *         description: Conversation started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation_id:
 *                   type: string
 *                 ai_response:
 *                   type: object
 *                 recommendation:
 *                   type: object
 */

/**
 * @swagger
 * /api/chatbot/conversations/{conversation_id}/message:
 *   post:
 *     summary: Send message in existing conversation
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - patient_id
 *             properties:
 *               message:
 *                 type: string
 *               patient_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */


//test route for u amel 

/**
 * @swagger
 * /api/chatbot/test-chat:
 *   post:
 *     summary: Test chat conversation with AI (no auth, no DB)
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message from the user (patient)
 *               history:
 *                 type: array
 *                 description: Chat history (optional)
 *                 items:
 *                   type: object
 *                   properties:
 *                     sender_type:
 *                       type: string
 *                       enum: [patient, ai]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Successful AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ai_response:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                 updated_history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sender_type:
 *                         type: string
 *                         enum: [patient, ai]
 *                       content:
 *                         type: string
 *       500:
 *         description: Server error during chat processing
 */


router.post('/test-chat', async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const aiResponse = await medicalChat.processMessage(history, message);

    // (simulate chat)
    const updatedHistory = [
      ...history,
      { sender_type: 'patient', content: message },
      { sender_type: 'ai', content: aiResponse.content }
    ];

    res.json({
      success: true,
      ai_response: aiResponse,
      updated_history: updatedHistory
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur lors de la communication avec l\'IA' });
  }
});



// Start new conversation
router.post('/conversations/start', authenticateUser, chatController.startConversation.bind(chatController));

// Send message in existing conversation
router.post('/conversations/:conversation_id/message', authenticateUser, chatController.sendMessage.bind(chatController));

// Get conversation history
router.get('/conversations/:conversation_id', authenticateUser, chatController.getConversation.bind(chatController));

// Get patient's conversations
router.get('/patients/:patient_id/conversations', authenticateUser, chatController.getPatientConversations.bind(chatController));

// End conversation
router.put('/conversations/:conversation_id/end', authenticateUser, chatController.endConversation.bind(chatController));

export default router;






































// import express from 'express';

// const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Medical Chatbot
//  *   description: AI-powered medical symptom assessment chatbot
//  */

// /**
//  * @swagger
//  * /api/chatbot/first-question:
//  *   get:
//  *     summary: Get the first question for symptom assessment
//  *     tags: [Medical Chatbot]
//  *     description: Retrieve the initial question to start the medical assessment conversation
//  *     responses:
//  *       200:
//  *         description: First question retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ChatQuestion'
//  *             example:
//  *               id: 1
//  *               text: "What is your primary symptom?"
//  *               choices:
//  *                 - id: 1
//  *                   text: "Fever"
//  *                   nextQuestionId: 2
//  *                 - id: 2
//  *                   text: "Cough"
//  *                   nextQuestionId: 3
//  */

// /**
//  * @swagger
//  * /api/chatbot/next-question:
//  *   post:
//  *     summary: Get next question based on user choice
//  *     tags: [Medical Chatbot]
//  *     description: Get the next question in the symptom assessment flow based on user's previous answer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - choiceId
//  *             properties:
//  *               choiceId:
//  *                 type: integer
//  *                 description: ID of the selected choice from previous question
//  *             example:
//  *               choiceId: 1
//  *     responses:
//  *       200:
//  *         description: Next question or end of assessment
//  *         content:
//  *           application/json:
//  *             schema:
//  *               oneOf:
//  *                 - $ref: '#/components/schemas/ChatQuestion'
//  *                 - type: object
//  *                   properties:
//  *                     message:
//  *                       type: string
//  *                       example: "End of questionnaire"
//  *       400:
//  *         description: Choice ID required
//  *       404:
//  *         description: Question not found
//  */

// // Hardcoded questions and answers
// const questions = {
//   1: { id: 1, text: "What is your primary symptom?", choices: [{ id: 1, text: "Fever", nextQuestionId: 2 }, { id: 2, text: "Cough", nextQuestionId: 3 }] },
//   2: { id: 2, text: "Do you have a high fever?", choices: [{ id: 3, text: "Yes", nextQuestionId: null }, { id: 4, text: "No", nextQuestionId: null }] },
//   3: { id: 3, text: "Is your cough dry or wet?", choices: [{ id: 5, text: "Dry", nextQuestionId: null }, { id: 6, text: "Wet", nextQuestionId: null }] }
// };

// // Route to get the first question
// router.get('/first-question', (req, res) => {
//   res.json(questions[1]);
// });

// // Route to get the next question based on user choice
// router.post('/next-question', (req, res) => {
//   const { choiceId } = req.body;

//   let nextQuestionId = null;

//   // Find the next question from current choices
//   for (let key in questions) {
//     const question = questions[key];
//     const selectedChoice = question.choices.find(choice => choice.id === choiceId);
//     if (selectedChoice) {
//       nextQuestionId = selectedChoice.nextQuestionId;
//       break;
//     }
//   }

//   if (!nextQuestionId) {
//     return res.json({ message: "End of questionnaire" });
//   }

//   res.json(questions[nextQuestionId]);
// });

// export default router;
