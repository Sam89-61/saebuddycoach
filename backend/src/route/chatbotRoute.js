const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');
require('dotenv').config();

// Initialiser Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Contexte système pour le chatbot BuddyCoach
const SYSTEM_PROMPT = `Tu es BuddyCoach, un assistant intelligent et bienveillant pour une application de fitness et bien-être.
Tu aides les utilisateurs avec :
- Leurs programmes sportifs et d'entraînement
- Leur alimentation et nutrition
- La fixation et le suivi d'objectifs
- La motivation et les conseils de bien-être

Réponds toujours de manière friendly, encourageante et en français.
Sois concis (max 150 mots par réponse).
Si la question n'est pas liée à ton domaine, redirige gentiment l'utilisateur.`;

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message vide' });
    }

    // Appel à Groq
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_completion_tokens: 200,
    });

    const reply = response.choices[0].message.content;

    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('Erreur Groq:', error.message);
    
    res.status(500).json({
      error: 'Erreur lors de la communication avec le chatbot: ' + error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ status: 'Clé API Groq non configurée' });
    }
    res.json({ status: 'Groq API est prête' });
  } catch (error) {
    res.status(503).json({ status: 'Erreur Groq' });
  }
});

module.exports = router;
