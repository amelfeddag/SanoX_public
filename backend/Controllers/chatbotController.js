const questions = [
    {
      id: 1,
      text: "What is your primary symptom?",
      choices: [
        { id: 1, text: "Fever", nextQuestionId: 2 },
        { id: 2, text: "Cough", nextQuestionId: 3 },
        { id: 3, text: "None", nextQuestionId: null }
      ]
    },
    {
      id: 2,
      text: "Do you have a fever?",
      choices: [
        { id: 4, text: "Yes", nextQuestionId: null },
        { id: 5, text: "No", nextQuestionId: null }
      ]
    },
    {
      id: 3,
      text: "Do you have a cough?",
      choices: [
        { id: 6, text: "Yes", nextQuestionId: null },
        { id: 7, text: "No", nextQuestionId: null }
      ]
    }
  ];
  
  // Get the first question
  export const fetchFirstQuestion = (req, res) => {
    res.json(questions[0]);
  };
  
  // Get the next question based on user choice
  export const fetchNextQuestion = (req, res) => {
    const { choiceId } = req.body;
    if (!choiceId) return res.status(400).json({ message: "Choice ID required" });
  
    // Find the choice with the given ID
    let nextQuestionId = null;
    for (const question of questions) {
      const choice = question.choices.find(c => c.id === choiceId);
      if (choice) {
        nextQuestionId = choice.nextQuestionId;
        break;
      }
    }
  
    if (!nextQuestionId) {
      return res.json({ message: "End of questionnaire" });
    }
  
    const nextQuestion = questions.find(q => q.id === nextQuestionId);
    if (!nextQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
  
    res.json(nextQuestion);
  };
  