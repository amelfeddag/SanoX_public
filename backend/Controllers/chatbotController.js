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

    // Enhanced medical prompt with better structure
    this.medicalPrompt = `
Tu es Dr. Sanox, un assistant médical virtuel empathique pour la plateforme Sanox en Algérie.

PRINCIPES DE BASE:
- Sois toujours empathique et rassurant
- Pose UNE SEULE question pertinente à la fois
- Utilise un français simple et accessible
- Ne donne JAMAIS de diagnostic médical définitif
- Encourage toujours la consultation médicale

FLOW DE CONVERSATION:
1. ACCUEIL CHALEUREUX: Montre de l'empathie et rassure le patient
2. COLLECTE D'INFORMATIONS: Une question à la fois sur:
   - Durée des symptômes ("Depuis quand ressentez-vous cela ?")
   - Intensité ("Sur une échelle de 1 à 10, comment évaluez-vous la douleur ?")
   - Localisation précise ("Où exactement ressentez-vous la douleur ?")
   - Symptômes associés ("Avez-vous d'autres symptômes ?")
   - Facteurs aggravants/atténuants ("Qu'est-ce qui améliore ou aggrave vos symptômes ?")
   - Contexte ("Avez-vous fait quelque chose de particulier récemment ?")

3. QUESTIONS DE SUIVI: Approfondis selon les réponses
4. RECOMMANDATION FINALE: Seulement après 4-6 échanges minimum

SPÉCIALITÉS DISPONIBLES (avec critères de référence):
- Médecine Générale: Symptômes généraux, premiers soins, suivi de santé
- Cardiologie: Douleurs thoraciques, palpitations, hypertension, problèmes cardiaques
- Dermatologie: Problèmes de peau, éruptions, acné, grains de beauté
- Orthopédie: Douleurs articulaires, fractures, entorses, maux de dos
- Pédiatrie: Enfants < 16 ans, tous problèmes pédiatriques
- Gynécologie: Santé féminine, problèmes menstruels, grossesse
- Psychiatrie: Anxiété, dépression, troubles du sommeil, stress
- Ophtalmologie: Problèmes de vision, douleurs oculaires, infections oculaires
- ORL: Maux de gorge, problèmes d'oreilles, sinusite, vertiges
- Neurologie: Maux de tête sévères, vertiges, troubles neurologiques

NIVEAUX D'URGENCE:
1 - Non urgent: Problème mineur, consultation dans la semaine
2 - Peu urgent: Consultation dans 2-3 jours recommandée
3 - Modéré: Consultation dans 24-48h nécessaire
4 - Urgent: Consultation le jour même impérative
5 - Très urgent: Urgences médicales immédiates (appeler le 15/SAMU)

SIGNAUX D'ALARME (urgence 4-5):
- Douleur thoracique intense
- Difficultés respiratoires graves
- Perte de conscience
- Saignements importants
- Température > 40°C
- Vomissements persistants avec déshydratation
- Douleur abdominale aiguë et intense

RÈGLES STRICTES:
- Réponds UNIQUEMENT en français
- Une seule question par réponse
- Maximum 2-3 phrases par réponse
- Évite le jargon médical
- Toujours terminer par une note rassurante
- Ne jamais minimiser les symptômes du patient

FORMAT DE RECOMMANDATION (utiliser SEULEMENT quand suffisamment d'informations):
[RECOMMANDATION]
Spécialité: [Nom exact de la spécialité]
Urgence: [Niveau 1-5]
Raison: [Explication claire et rassurante]
Conseils: [1-2 conseils pratiques en attendant la consultation]
[/RECOMMANDATION]

EXEMPLE DE CONVERSATION IDÉALE:
Patient: "J'ai mal à la tête depuis ce matin"
Toi: "Je comprends que vous souffriez d'un mal de tête. Cela peut être inconfortable. Pouvez-vous me dire sur une échelle de 1 à 10 quelle est l'intensité de cette douleur ?"

Patient: "Je dirais 7 sur 10"
Toi: "C'est effectivement une douleur importante. Où exactement situez-vous cette douleur dans votre tête - plutôt sur les côtés, le front, ou l'arrière ?"

Patient: "Surtout sur le côté droit"
Toi: "D'accord. Avez-vous d'autres symptômes qui accompagnent ce mal de tête, comme des nausées, une sensibilité à la lumière, ou des troubles de la vision ?"

... continuer jusqu'à avoir suffisamment d'informations pour une recommandation appropriée.

Commence TOUJOURS par de l'empathie et UNE question simple et claire.
`;
  }

  async processMessage(conversationHistory, currentMessage) {
    try {
      // Better input validation and sanitization
      if (!currentMessage || typeof currentMessage !== 'string' || currentMessage.trim() === '') {
        throw new Error('Message vide ou invalide');
      }

      const sanitizedMessage = currentMessage.toString().trim().slice(0, 500); // Limit message length
      
      // Filter and validate conversation history
      const validHistory = conversationHistory
        .filter(msg => msg && msg.content && msg.content.trim() !== '')
        .slice(-10) // Keep only last 10 messages to avoid token limits
        .map(msg => ({
          role: msg.sender_type === 'patient' ? 'user' : 'assistant',
          content: msg.content.toString().trim().slice(0, 500) // Limit each message length
        }));

      const messages = [
        { role: 'system', content: this.medicalPrompt },
        ...validHistory,
        { role: 'user', content: sanitizedMessage }
      ];

      console.log('Sending to GROQ API:', { messageCount: messages.length, model: 'llama-3.3-70b-versatile' });

      // Enhanced API call with better error handling
      const response = await axios.post(this.apiUrl, {
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.3,
        max_tokens: 800, // Reduced for more focused responses
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Réponse API invalide');
      }

      const aiResponse = response.data.choices[0].message.content;
      const parsedResponse = this.parseAIResponse(aiResponse);
      
      // Enhanced response object
      return {
        content: aiResponse,
        recommendation: parsedResponse.recommendation,
        urgency: parsedResponse.urgency,
        specialty: parsedResponse.specialty,
        specialty_id: parsedResponse.specialty_id,
        advice: parsedResponse.advice,
        reason: parsedResponse.reason,
        tokens_used: response.data.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('GROQ API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Enhanced fallback responses based on error type
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return this.createFallbackResponse('timeout');
      } else if (error.response?.status === 429) {
        return this.createFallbackResponse('rate_limit');
      } else {
        return this.createFallbackResponse('general');
      }
    }
  }

  createFallbackResponse(errorType) {
    const fallbackResponses = {
      timeout: {
        content: "Je rencontre des difficultés de connexion. Pouvez-vous reformuler votre question ? En cas d'urgence, contactez directement un médecin.",
        recommendation: false,
        urgency: 2
      },
      rate_limit: {
        content: "Le service est temporairement surchargé. Veuillez patienter quelques instants avant de continuer. Si c'est urgent, consultez immédiatement un médecin.",
        recommendation: false,
        urgency: 2
      },
      general: {
        content: "Je rencontre des difficultés techniques. En attendant, je vous recommande de consulter un médecin généraliste si vos symptômes persistent ou s'aggravent.",
        recommendation: true,
        specialty: "Médecine Générale",
        urgency: 2,
        reason: "Consultation recommandée en raison de difficultés techniques"
      }
    };

    const response = fallbackResponses[errorType];
    return {
      ...response,
      specialty_id: null,
      advice: "Consultez un médecin si les symptômes persistent",
      reason: response.reason || "Difficultés techniques"
    };
  }

  parseAIResponse(content) {
    const result = {
      recommendation: false,
      specialty: null,
      specialty_id: null,
      urgency: 1,
      advice: null,
      reason: null
    };

    // Enhanced parsing for recommendation block
    const recommendationMatch = content.match(/\[RECOMMANDATION\](.*?)\[\/RECOMMANDATION\]/s);
    
    if (recommendationMatch) {
      const recommendationBlock = recommendationMatch[1];
      result.recommendation = true;
      
      // Extract specialty
      const specialtyMatch = recommendationBlock.match(/Spécialité:\s*([^\n]+)/i);
      if (specialtyMatch) {
        result.specialty = specialtyMatch[1].trim();
      }
      
      // Extract urgency
      const urgencyMatch = recommendationBlock.match(/Urgence:\s*(\d)/i);
      if (urgencyMatch) {
        result.urgency = Math.max(1, Math.min(5, parseInt(urgencyMatch[1])));
      }

      // Extract reason
      const reasonMatch = recommendationBlock.match(/Raison:\s*([^\n]+)/i);
      if (reasonMatch) {
        result.reason = reasonMatch[1].trim();
      }

      // Extract advice
      const adviceMatch = recommendationBlock.match(/Conseils:\s*([^\n]+)/i);
      if (adviceMatch) {
        result.advice = adviceMatch[1].trim();
      }
    }

    return result;
  }

  async getSpecialtyId(specialtyName) {
    if (!specialtyName) return null;

    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('id')
        .eq('name', specialtyName)
        .single();
      
      if (error) {
        console.error('Error fetching specialty ID:', error);
        return null;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error('Error in getSpecialtyId:', error);
      return null;
    }
  }

  // Utility method to validate conversation context
  validateConversationContext(messages) {
    if (!Array.isArray(messages)) return false;
    if (messages.length > 20) return false; // Prevent extremely long conversations
    
    return messages.every(msg => 
      msg && 
      typeof msg.content === 'string' && 
      msg.content.length <= 1000 &&
      ['patient', 'ai'].includes(msg.sender_type)
    );
  }
}

// Enhanced Chat Controller
class ChatController {
  constructor() {
    this.medicalChat = new MedicalChatService();
  }

  // Enhanced conversation starter with better error handling
  async startConversation(req, res) {
    try {
      const { patient_id, initial_symptoms } = req.body;

      // Enhanced validation
      if (!patient_id || !initial_symptoms || typeof initial_symptoms !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'patient_id et initial_symptoms sont requis'
        });
      }

      if (initial_symptoms.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez décrire vos symptômes plus en détail'
        });
      }

      // Verify patient exists
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, name')
        .eq('id', patient_id)
        .single();

      if (patientError || !patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé'
        });
      }

      const conversation_id = uuidv4();
      const sanitizedSymptoms = initial_symptoms.trim().slice(0, 500);

      // Create conversation with transaction-like behavior
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          id: conversation_id,
          patient_id,
          symptoms: sanitizedSymptoms,
          title: `Consultation du ${new Date().toLocaleDateString('fr-FR')}`,
          status: 'active'
        })
        .select()
        .single();

      if (conversationError) {
        console.error('Conversation creation error:', conversationError);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création de la conversation'
        });
      }

      // Add initial patient message
      await supabase.from('messages').insert({
        id: uuidv4(),
        conversation_id: conversation_id,
        sender_type: 'patient',
        content: sanitizedSymptoms,
        message_type: 'symptom'
      });

      // Get AI response
      const aiResponse = await this.medicalChat.processMessage([], sanitizedSymptoms);

      // Save AI response
      const { data: aiMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          id: uuidv4(),
          conversation_id: conversation_id,
          sender_type: 'ai',
          content: aiResponse.content,
          message_type: aiResponse.recommendation ? 'recommendation' : 'text'
        })
        .select()
        .single();

      if (messageError) {
        console.error('AI message save error:', messageError);
      }

      // Update conversation with AI insights
      if (aiResponse.recommendation && aiResponse.specialty) {
        const specialty_id = await this.medicalChat.getSpecialtyId(aiResponse.specialty);
        
        await supabase
          .from('conversations')
          .update({
            recommended_specialty_id: specialty_id,
            urgency_level: aiResponse.urgency,
            ai_diagnosis: aiResponse.reason || 'Évaluation en cours'
          })
          .eq('id', conversation_id);
      }

      res.json({
        success: true,
        conversation_id: conversation_id,
        ai_response: aiMessage,
        recommendation: aiResponse.recommendation ? {
          specialty: aiResponse.specialty,
          urgency: aiResponse.urgency,
          reason: aiResponse.reason,
          advice: aiResponse.advice
        } : null,
        patient_name: patient.name
      });

    } catch (error) {
      console.error('Start conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du démarrage de la conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Enhanced message sending with rate limiting consideration
  async sendMessage(req, res) {
    try {
      const { conversation_id } = req.params;
      const { message, patient_id } = req.body;

      // Enhanced validation
      if (!message || typeof message !== 'string' || message.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Message requis'
        });
      }

      const sanitizedMessage = message.trim().slice(0, 500);

      // Verify conversation ownership and status
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('patient_id, status')
        .eq('id', conversation_id)
        .single();

      if (convError || !conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée'
        });
      }

      if (conversation.patient_id !== patient_id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette conversation'
        });
      }

      if (conversation.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cette conversation est fermée'
        });
      }

      // Save patient message
      await supabase.from('messages').insert({
        id: uuidv4(),
        conversation_id,
        sender_type: 'patient',
        content: sanitizedMessage
      });

      // Get conversation history (last 10 messages for context)
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(10);

      const sortedMessages = messages?.reverse() || [];

      // Get AI response
      const aiResponse = await this.medicalChat.processMessage(sortedMessages, sanitizedMessage);

      // Save AI response
      const { data: aiMessage } = await supabase
        .from('messages')
        .insert({
          id: uuidv4(),
          conversation_id,
          sender_type: 'ai',
          content: aiResponse.content,
          message_type: aiResponse.recommendation ? 'recommendation' : 'text'
        })
        .select()
        .single();

      // Update conversation if new recommendation
      if (aiResponse.recommendation && aiResponse.specialty) {
        const specialty_id = await this.medicalChat.getSpecialtyId(aiResponse.specialty);
        
        await supabase
          .from('conversations')
          .update({
            recommended_specialty_id: specialty_id,
            urgency_level: aiResponse.urgency,
            ai_diagnosis: aiResponse.reason || 'Évaluation mise à jour'
          })
          .eq('id', conversation_id);
      }

      res.json({
        success: true,
        ai_response: aiMessage,
        recommendation: aiResponse.recommendation ? {
          specialty: aiResponse.specialty,
          urgency: aiResponse.urgency,
          reason: aiResponse.reason,
          advice: aiResponse.advice
        } : null,
        tokens_used: aiResponse.tokens_used
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Other methods remain the same but with better error handling...
  async getConversation(req, res) {
    const { conversation_id } = req.params;
    const patient_id = req.user?.patientId || req.query.patient_id;

    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          *,
          specialties(id, name),
          messages(*)
        `)
        .eq('id', conversation_id)
        .eq('patient_id', patient_id)
        .single();

      if (error) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée'
        });
      }

      // Sort messages chronologically
      if (conversation.messages) {
        conversation.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }

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

  async getPatientConversations(req, res) {
    const { patient_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id, title, symptoms, status, urgency_level, created_at, updated_at,
          specialties(name)
        `)
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        success: true,
        conversations,
        total: conversations?.length || 0
      });

    } catch (error) {
      console.error('Get patient conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des conversations'
      });
    }
  }

  async endConversation(req, res) {
    const { conversation_id } = req.params;
    const { patient_id } = req.body;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'completed'
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