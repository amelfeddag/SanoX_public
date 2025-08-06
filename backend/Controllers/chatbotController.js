import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js';

class MedicalChatService {
  constructor() {
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.apiKey = process.env.GROQ_API_KEY;

  if (!this.apiKey) {
    console.error('GROQ_API_KEY environment variable is not set!');
    throw new Error('GROQ API key is required');
  }
  
  console.log('MedicalChatService initialized with API key:', this.apiKey.substring(0, 10) + '...');

   this.medicalPrompt = `
Tu es Dr. Sanox, un assistant médical virtuel pour la plateforme Sanox en Algérie.

APPROCHE CONVERSATIONNELLE:
- Pose UNE SEULE question à la fois
- Attends la réponse du patient avant de poser la question suivante
- Sois empathique et rassurant
- Guide la conversation étape par étape
- NE donne de recommandation finale qu'après avoir collecté suffisamment d'informations

ÉTAPES DE LA CONVERSATION:
1. ACCUEIL: Salue chaleureusement et montre de l'empathie
2. QUESTIONS DE BASE: Une question à la fois sur:
   - Durée des symptômes
   - Intensité (échelle 1-10)
   - Localisation précise
   - Facteurs déclencheurs
   - Symptômes associés
3. QUESTIONS DE SUIVI: Selon les réponses, approfondis
4. RECOMMANDATION: Seulement à la fin, avec le format spécial

SPÉCIALITÉS DISPONIBLES:
- Médecine Générale - Consultations générales
- Cardiologie - Cœur et circulation
- Dermatologie - Problèmes de peau
- Orthopédie - Os, muscles, articulations
- Pédiatrie - Santé des enfants
- Gynécologie - Santé féminine
- Psychiatrie - Santé mentale
- Ophtalmologie - Problèmes oculaires
- ORL - Oreilles, nez, gorge
- Neurologie - Système nerveux, maux de tête

NIVEAUX D'URGENCE:
1 - Non urgent (peut attendre plusieurs jours)
2 - Peu urgent (consultation dans 2-3 jours)  
3 - Modérément urgent (consultation dans 24-48h)
4 - Urgent (consultation le jour même)
5 - Très urgent (urgences immédiates)

RÈGLES IMPORTANTES:
- Réponds UNIQUEMENT en français
- Une seule question par réponse (sauf accueil initial)
- Sois bref et concis
- Évite les termes médicaux complexes
- Ne donne jamais de diagnostic définitif
- Mentionne toujours qu'il faut consulter un médecin

QUAND DONNER LA RECOMMANDATION FINALE:
Donne la recommandation SEULEMENT quand tu as assez d'informations (généralement après 3-5 échanges minimum).

FORMAT DE RECOMMANDATION FINALE:
[RECOMMANDATION]
Spécialité: [Nom de la spécialité]
Urgence: [Niveau 1-5]
Raison: [Explication simple]
[/RECOMMANDATION]

EXEMPLE DE FLOW:
Patient: "J'ai mal à la tête"
Toi: "Bonjour ! Je comprends que vous avez mal à la tête. Depuis combien de temps ressentez-vous cette douleur ?"
Patient: "Depuis ce matin"
Toi: "D'accord. Pouvez-vous me dire où exactement se situe la douleur dans votre tête ?"
Patient: "Sur le côté droit"
Toi: "Sur une échelle de 1 à 10, comment évalueriez-vous l'intensité de cette douleur ?"
...et ainsi de suite jusqu'à avoir assez d'informations.

Commence TOUJOURS par une réponse empathique et UNE question simple.
`;
    

  }

  async processMessage(conversationHistory, currentMessage) {
  try {
    
    const validHistory = conversationHistory
      .filter(msg => msg && msg.content && msg.content.trim() !== '') 
      .map(msg => ({
        role: msg.sender_type === 'patient' ? 'user' : 'assistant',
        content: msg.content.toString().trim() 
      }));

    //prepare conversation for API
    const messages = [
      { role: 'system', content: this.medicalPrompt },
      ...validHistory,
      { role: 'user', content: currentMessage.toString().trim() }
    ];

    
    console.log('Sending messages to GROQ:', JSON.stringify(messages, null, 2));

    // API call
    const response = await axios.post(this.apiUrl, {
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    const parsedResponse = this.parseAIResponse(aiResponse);
    
    return {
      content: aiResponse,
      recommendation: parsedResponse.recommendation,
      urgency: parsedResponse.urgency,
      specialty: parsedResponse.specialty,
      specialty_id: parsedResponse.specialty_id
    };

  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('Full API Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    
    //fallback response
    return {
      content: "Je rencontre actuellement des difficultés techniques. En attendant, je vous recommande de consulter un médecin généraliste si vos symptômes persistent ou s'aggravent.",
      recommendation: true,
      specialty: "Médecine Générale",
      specialty_id: await this.getSpecialtyId("Médecine Générale"),
      urgency: 2
    };
  }
}

  // async processMessage(conversationHistory, currentMessage) {
  //   try {
  //     // Prepare conversation for API
  //     const messages = [
  //       { role: 'system', content: this.medicalPrompt },
  //       ...conversationHistory.map(msg => ({
  //         role: msg.sender_type === 'patient' ? 'user' : 'assistant',
  //         content: msg.content
  //       })),
  //       { role: 'user', content: currentMessage }
  //     ];

  //     // api call here
  //     const response = await axios.post(this.apiUrl, {
  //       model: 'deepseek-chat',
  //       messages: messages,
  //       temperature: 0.3,
  //       max_tokens: 1500,
  //       top_p: 0.9
  //     }, {
  //       headers: {
  //         'Authorization': `Bearer ${this.apiKey}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     const aiResponse = response.data.choices[0].message.content;
  //     const parsedResponse = this.parseAIResponse(aiResponse);
      
  //     return {
  //       content: aiResponse,
  //       recommendation: parsedResponse.recommendation,
  //       urgency: parsedResponse.urgency,
  //       specialty: parsedResponse.specialty,
  //       specialty_id: parsedResponse.specialty_id
  //     };

  //   } catch (error) {
  //     console.error('DeepSeek API Error:', error.response?.data || error.message);
  //     //fallback
  //     return {
  //       content: "Je rencontre actuellement des difficultés techniques. En attendant, je vous recommande de consulter un médecin généraliste si vos symptômes persistent ou s'aggravent.",
  //       recommendation: true,
  //       specialty: "Médecine Générale",
  //       specialty_id: await this.getSpecialtyId("Médecine Générale"),
  //       urgency: 2
  //     };
  //   }
  // }

  parseAIResponse(content) {
    const result = {
      recommendation: false,
      specialty: null,
      specialty_id: null,
      urgency: 1
    };

    // Look for recommendation block
    const recommendationMatch = content.match(/\[RECOMMANDATION\](.*?)\[\/RECOMMANDATION\]/s);
    
    if (recommendationMatch) {
      const recommendationBlock = recommendationMatch[1];
      
      // Extract specialty
      const specialtyMatch = recommendationBlock.match(/Spécialité:\s*([^\n]+)/i);
      if (specialtyMatch) {
        result.specialty = specialtyMatch[1].trim();
        result.recommendation = true;
      }
      
      // Extract urgency
      const urgencyMatch = recommendationBlock.match(/Urgence:\s*(\d)/i);
      if (urgencyMatch) {
        result.urgency = parseInt(urgencyMatch[1]);
      }
    } else {
      // Fallback: look for specialty mentions in text
      const specialties = {
        'médecine générale': 'Médecine Générale',
        'généraliste': 'Médecine Générale',
        'cardiologie': 'Cardiologie',
        'cardiologue': 'Cardiologie',
        'dermatologie': 'Dermatologie',
        'dermatologue': 'Dermatologie',
        'orthopédie': 'Orthopédie',
        'orthopédiste': 'Orthopédie',
        'pédiatrie': 'Pédiatrie',
        'pédiatre': 'Pédiatrie',
        'gynécologie': 'Gynécologie',
        'gynécologue': 'Gynécologie',
        'psychiatrie': 'Psychiatrie',
        'psychiatre': 'Psychiatrie',
        'ophtalmologie': 'Ophtalmologie',
        'ophtalmologue': 'Ophtalmologie',
        'orl': 'ORL',
        'neurologie': 'Neurologie',
        'neurologue': 'Neurologie'
      };

      const contentLower = content.toLowerCase();
      for (const [keyword, specialty] of Object.entries(specialties)) {
        if (contentLower.includes(keyword)) {
          result.specialty = specialty;
          result.recommendation = true;
          break;
        }
      }
    }

    return result;
  }

  async getSpecialtyId(specialtyName) {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('id')
        .eq('name', specialtyName)
        .single();
      
      return error ? null : data.id;
    } catch (error) {
      console.error('Error fetching specialty ID:', error);
      return null;
    }
  }
}

// Chat Controller
class ChatController {
  constructor() {
    this.medicalChat = new MedicalChatService();
  }

  // Start new conversation
  async startConversation(req, res) {
    const { patient_id, initial_symptoms } = req.body;

    try {
      const conversation_id = uuidv4();
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          id: conversation_id,
          patient_id,
          symptoms: initial_symptoms,
          title: `Consultation du ${new Date().toLocaleDateString('fr-FR')}`,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add initial patient message
      const message_id = uuidv4();
      await supabase
        .from('messages')
        .insert({
          id: message_id,
          conversation_id: conversation_id,
          sender_type: 'patient',
          content: initial_symptoms,
          message_type: 'symptom',
          created_at: new Date().toISOString()
        });

      // get ai response
      const aiResponse = await this.medicalChat.processMessage([], initial_symptoms);

      // save it
      const ai_message_id = uuidv4();
      const { data: aiMessage } = await supabase
        .from('messages')
        .insert({
          id: ai_message_id,
          conversation_id: conversation_id,
          sender_type: 'ai',
          content: aiResponse.content,
          message_type: aiResponse.recommendation ? 'recommendation' : 'text',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      
      if (aiResponse.recommendation) {
        await supabase
          .from('conversations')
          .update({
            recommended_specialty_id: aiResponse.specialty_id,
            urgency_level: aiResponse.urgency,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation_id);
      }

      res.json({
        success: true,
        conversation_id: conversation_id,
        ai_response: aiMessage,
        recommendation: aiResponse.recommendation ? {
          specialty: aiResponse.specialty,
          urgency: aiResponse.urgency
        } : null
      });

    } catch (error) {
      console.error('Start conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du démarrage de la conversation'
      });
    }
  }

  //send message in existing conversation
  async sendMessage(req, res) {
    const { conversation_id } = req.params;
    const { message, patient_id } = req.body;

    try {
      // Verify conversation belongs to patient
      const { data: conversation } = await supabase
        .from('conversations')
        .select('patient_id')
        .eq('id', conversation_id)
        .single();

      if (!conversation || conversation.patient_id !== patient_id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette conversation'
        });
      }

      // Save patient message
      const message_id = uuidv4();
      await supabase
        .from('messages')
        .insert({
          id: message_id,
          conversation_id,
          sender_type: 'patient',
          content: message,
          created_at: new Date().toISOString()
        });

      // Get conversation history
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

      // Get AI response
      const aiResponse = await this.medicalChat.processMessage(messages, message);

      // Save AI response
      const ai_message_id = uuidv4();
      const { data: aiMessage } = await supabase
        .from('messages')
        .insert({
          id: ai_message_id,
          conversation_id,
          sender_type: 'ai',
          content: aiResponse.content,
          message_type: aiResponse.recommendation ? 'recommendation' : 'text',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      // update conversation if new recommendation
      if (aiResponse.recommendation && aiResponse.specialty_id) {
        await supabase
          .from('conversations')
          .update({
            recommended_specialty_id: aiResponse.specialty_id,
            urgency_level: aiResponse.urgency,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation_id);
      }

      res.json({
        success: true,
        ai_response: aiMessage,
        recommendation: aiResponse.recommendation ? {
          specialty: aiResponse.specialty,
          urgency: aiResponse.urgency
        } : null
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du message'
      });
    }
  }

  // get conversation history
  async getConversation(req, res) {
    const { conversation_id } = req.params;
    const { patient_id } = req.query;

    try {

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          specialties(name),
          messages(*)
        `)
        .eq('id', conversation_id)
        .eq('patient_id', patient_id)
        .single();

      if (convError) throw convError;

      //sort messages by creation time 
      conversation.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      res.json({
        success: true,
        conversation
      });

    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la conversation'
      });
    }
  }

  //get patients convo history 
  async getPatientConversations(req, res) {
    const { patient_id } = req.params;

    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          specialties(name)
        `)
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        conversations
      });

    } catch (error) {
      console.error('Get patient conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des conversations'
      });
    }
  }

  //end conversation
  async endConversation(req, res) {
    const { conversation_id } = req.params;
    const { patient_id } = req.body;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation_id)
        .eq('patient_id', patient_id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Conversation terminée avec succès'
      });

    } catch (error) {
      console.error('End conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la fermeture de la conversation'
      });
    }
  }
}

export { MedicalChatService, ChatController };
















// const questions = [
//     {
//       id: 1,
//       text: "What is your primary symptom?",
//       choices: [
//         { id: 1, text: "Fever", nextQuestionId: 2 },
//         { id: 2, text: "Cough", nextQuestionId: 3 },
//         { id: 3, text: "None", nextQuestionId: null }
//       ]
//     },
//     {
//       id: 2,
//       text: "Do you have a fever?",
//       choices: [
//         { id: 4, text: "Yes", nextQuestionId: null },
//         { id: 5, text: "No", nextQuestionId: null }
//       ]
//     },
//     {
//       id: 3,
//       text: "Do you have a cough?",
//       choices: [
//         { id: 6, text: "Yes", nextQuestionId: null },
//         { id: 7, text: "No", nextQuestionId: null }
//       ]
//     }
//   ];
  
//   // Get the first question
//   export const fetchFirstQuestion = (req, res) => {
//     res.json(questions[0]);
//   };
  
//   // Get the next question based on user choice
//   export const fetchNextQuestion = (req, res) => {
//     const { choiceId } = req.body;
//     if (!choiceId) return res.status(400).json({ message: "Choice ID required" });
  
//     // Find the choice with the given ID
//     let nextQuestionId = null;
//     for (const question of questions) {
//       const choice = question.choices.find(c => c.id === choiceId);
//       if (choice) {
//         nextQuestionId = choice.nextQuestionId;
//         break;
//       }
//     }
  
//     if (!nextQuestionId) {
//       return res.json({ message: "End of questionnaire" });
//     }
  
//     const nextQuestion = questions.find(q => q.id === nextQuestionId);
//     if (!nextQuestion) {
//       return res.status(404).json({ message: "Question not found" });
//     }
  
//     res.json(nextQuestion);
//   };
  