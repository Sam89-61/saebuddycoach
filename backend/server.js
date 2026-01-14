const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken'); // Supprimé car inutilisé ici
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { checkApiKey } = require('./src/middleware/auth');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const profilRoutes = require('./src/route/profilRoute');
const authRoutes = require('./src/route/authRoute');
const classementRoutes = require('./src/route/classementRoute');
const recordRoutes = require('./src/route/recordRoute');
const alimentationRoutes = require('./src/route/alimentationRoute');
const evenementRoutes = require('./src/route/evenementRoute');
const exosRoutes = require('./src/route/exosRoute');
const mascotteRoutes = require('./src/route/mascotteRoute');
const objectifRoutes = require('./src/route/objectifRoute');
const programmeRoutes = require('./src/route/programmeRoute');
const sessionSportRoutes = require('./src/route/sessionSportRoute');
const sessionRepasRoutes = require('./src/route/sessionRepasRoute');
const equipementRoute = require('./src/route/equipementRoute');
const modeleSeanceRoutes = require('./src/route/modeleSeanceRoute');
const adminRoutes = require('./src/route/adminRoute');
const errorHandler = require('./src/middleware/errorHandler');

const chatbotRoutes = require('./src/route/chatbotRoute');
const app = express();

// Sécurité : En-têtes HTTP
app.use(helmet());

app.use(cors());
app.use(express.json());

// Sécurité : Limitation de débit pour l'authentification (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de tentatives de connexion depuis cette IP, veuillez réessayer plus tard.'
});

// Appliquer le rate limiting uniquement aux routes d'auth
app.use('/api/auth', authLimiter);

// Middleware de sécurité API Key (sauf pour Swagger, Chatbot, Auth et routes Frontend protégées par JWT)
app.use((req, res, next) => {
  // On rend ces routes publiques au niveau API Key (la sécurité JWT prend le relais ensuite)
  const isPublicRoute = 
    req.path.startsWith('/api-docs') || 
    req.path.startsWith('/api/chatbot') || 
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/profil') ||   // Protégé par JWT
    req.path.startsWith('/api/programme') || // Protégé par JWT
    req.path.startsWith('/api/sessionSport') || // Protégé par JWT
    req.path.startsWith('/api/sessionRepas') || // Protégé par JWT
    req.path.startsWith('/api/modeleSeance') || // Protégé par JWT
    req.path.startsWith('/api/classement') ||   // Protégé par JWT
    req.path.startsWith('/api/evenement') ||    // Protégé par JWT (sauf getAll potentiellement)
    req.path.startsWith('/api/admin') ||        // Protégé par JWT + Role Admin
    req.path === '/api/test';

  if (isPublicRoute) {
    return next();
  }
  
  // Pour toutes les autres routes purement back-office, on vérifie la clé
  checkApiKey(req, res, next);
}); 

// Routes
app.use('/api/profil', profilRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/classement', classementRoutes);
app.use('/api/record', recordRoutes);
app.use('/api/alimentation', alimentationRoutes);
app.use('/api/evenement', evenementRoutes);
app.use('/api/programme', programmeRoutes);
app.use('/api/exos', exosRoutes);
app.use('/api/mascotte', mascotteRoutes);
app.use('/api/objectif', objectifRoutes);
app.use('/api/sessionSport', sessionSportRoutes);
app.use('/api/sessionRepas', sessionRepasRoutes);
app.use('/api/equipement', equipementRoute);
app.use('/api/modeleSeance', modeleSeanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne!' });
});

// Gestionnaire d'erreurs global (doit être après toutes les routes)
app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // En prod, mettre l'URL du front
    methods: ["GET", "POST"]
  }
});

// LOGIQUE SIGNALING WEBRTC
io.on('connection', (socket) => {
  console.log('Nouveau socket connecté:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    console.log(`Utilisateur ${userId} rejoint la salle ${roomId} avec le socket ${socket.id}`);
    socket.join(roomId);
    
    // Récupérer tous les autres utilisateurs déjà dans la salle
    const clients = io.sockets.adapter.rooms.get(roomId);
    const otherUsers = clients ? Array.from(clients).filter(id => id !== socket.id) : [];
    
    // Envoyer au nouvel arrivant la liste des gens déjà là
    socket.emit('all-users', otherUsers);
  });

  // Relais des offres/réponses WebRTC
  socket.on('sending-signal', payload => {
    io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on('returning-signal', payload => {
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('disconnecting', () => {
    // Notifier toutes les salles que ce socket quitte
    socket.rooms.forEach(roomId => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket déconnecté:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} (HTTP + Socket.io)`);
});



// SWAGGER DOCS
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BuddyCoach API',
      version: '1.0.0',
      description: 'Documentation de l\'API BuddyCoach',
      contact: {
        name: 'Support Technique',
        email: 'support@buddycoach.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        }
      },
    },
    security: [
      {
        bearerAuth: [],
        apiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/route/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
