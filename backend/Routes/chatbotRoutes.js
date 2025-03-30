import express from 'express';

const router = express.Router();

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
