require('dotenv').config();
 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
 
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
 
// =====================
// WEBSOCKET (SOCKET.IO)
// =====================
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: false
  }
});
 
io.on('connection', (socket) => {
  console.log('🔗 Client Web connecté:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client Web déconnecté:', socket.id);
  });
});
 
// =====================
// SUPABASE CLIENT
// =====================
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log('✅ Supabase connecté');
} else {
  console.warn('⚠️ Supabase non configuré (SUPABASE_URL/SUPABASE_KEY manquants)');
}
 
// =====================
// MIDDLEWARE
// =====================
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
 
// Anti-spam pour l'envoi d'emails
const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Trop de requêtes - Réessayez dans 1 minute' }
});
app.use('/api/send-alert', emailLimiter);
 
// =====================
// SECURITY FUNCTIONS
// =====================
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function sanitize(input) {
  return String(input).replace(/[\r\n]/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
 
// =====================
// EMAIL CONFIG (Nodemailer)
// =====================
let transporter = null;
 
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
 
  transporter.verify()
    .then(() => console.log('✅ SMTP connecté - Emails prêts'))
    .catch(err => console.error('❌ Erreur SMTP:', err.message));
} else {
  console.warn('⚠️ Email non configuré (EMAIL_USER/EMAIL_PASSWORD manquants)');
}
 
// =====================
// AUTO ALERT SYSTEM
// FIX: Ajout alerte niveau bas (< 20%) + niveau haut (> 80%)
// =====================
let lastAlertTime = 0;
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 min
 
async function sendAutoAlert(level, reason) {
  const now = Date.now();
  if (now - lastAlertTime < ALERT_COOLDOWN) {
    console.log("⏳ Alerte auto bloquée (cooldown)");
    return;
  }
 
  if (!transporter) {
    console.warn("⚠️ Transporter non configuré - email non envoyé");
    return;
  }
 
  lastAlertTime = now;
 
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ALERT_EMAIL || process.env.EMAIL_USER,
      subject: `🚨 ALERTE BASSIN - Niveau ${level}% - ${reason}`,
      html: `
        <div style="font-family: Arial; padding: 20px; background: #1e293b; color: #e2e8f0;">
          <h2 style="color: #ef4444;">🔴 ALERTE CRITIQUE</h2>
          <p>Niveau d'eau: <b>${level}%</b></p>
          <p>Raison: <b>${reason}</b></p>
          <p>Heure: ${new Date().toLocaleString('fr-FR')}</p>
          <hr style="border: 1px solid #334155;">
          <p style="color: #64748b; font-size: 12px;">BassinAI - Alerte automatique</p>
        </div>
      `
    });
    console.log(`🚨 Email automatique envoyé ! (${reason})`);
  } catch (err) {
    console.error("❌ Erreur email auto:", err.message);
  }
}
 
// =====================
// ROUTES
// =====================
 
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Backend OK',
    time: new Date(),
    smtp: !!transporter,
    supabase: !!supabase,
    email_user: process.env.EMAIL_USER ? '✅ configuré' : '❌ manquant'
  });
});
 
// FIX: Route /current retourne les dernières données reçues via MQTT
let lastKnownData = {
  level: 65,
  inflow: 120,
  outflow: 95,
  timestamp: new Date().toISOString(),
  status: 'NORMAL'
};
 
app.get('/api/basin/current', (req, res) => {
  res.json(lastKnownData);
});
 
// =====================
// MQTT CLIENT SETUP
// =====================
const MQTT_URL = process.env.MQTT_URL || 'mqtt://test.mosquitto.org';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'bassin/data';
 
const mqttClient = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 5000,    // FIX: Reconnexion automatique toutes les 5s
  connectTimeout: 10000
});
 
mqttClient.on('connect', () => {
  console.log(`🔌 Connecté au broker MQTT: ${MQTT_URL}`);
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`📡 Abonné au topic MQTT: ${MQTT_TOPIC}`);
    } else {
      console.error(`❌ Erreur d'abonnement MQTT:`, err);
    }
  });
});
 
// FIX: Gestion des erreurs MQTT (manquait complètement)
mqttClient.on('error', (err) => {
  console.error('❌ Erreur MQTT:', err.message);
});
 
// FIX: Log de reconnexion MQTT
mqttClient.on('reconnect', () => {
  console.log('🔄 Reconnexion au broker MQTT...');
});
 
mqttClient.on('offline', () => {
  console.warn('⚠️ Broker MQTT hors ligne');
});
 
mqttClient.on('message', (topic, message) => {
  if (topic === MQTT_TOPIC) {
    try {
      const payload = JSON.parse(message.toString());
      console.log('📨 Message MQTT reçu:', payload); // FIX: Log pour debug
 
      // FIX: Validation des types + valeurs par défaut cohérentes
      const data = {
        level:     typeof payload.level    === 'number' ? payload.level    : 65,
        inflow:    typeof payload.inflow   === 'number' ? payload.inflow   : 120,
        outflow:   typeof payload.outflow  === 'number' ? payload.outflow  : 95,
        timestamp: payload.timestamp       ? new Date(payload.timestamp).toISOString() : new Date().toISOString(), // FIX: toujours une string ISO
        status:    (payload.level > 80 || payload.level < 20) ? 'CRITICAL' : 'NORMAL' // FIX: aussi critique si < 20
      };
 
      // FIX: Mettre à jour lastKnownData pour la route /api/basin/current
      lastKnownData = data;
 
      // FIX: Alerte auto pour niveau BAS aussi (< 20%), pas seulement > 80%
      if (data.level > 80) {
        sendAutoAlert(data.level, 'Risque débordement (> 80%)');
      } else if (data.level < 20) {
        sendAutoAlert(data.level, 'Niveau critique bas (< 20%)');
      }
 
      // FIX: Log avant broadcast pour confirmer l'émission
      console.log(`📺 Broadcast basin_data vers ${io.engine.clientsCount} client(s):`, data);
 
      // BROADCAST VERS LE FRONTEND (WebSocket) — nom d'événement: "basin_data"
      io.emit('basin_data', data);
 
    } catch (error) {
      console.error('❌ Erreur parsing message MQTT:', error.message);
      console.error('   Message brut reçu:', message.toString()); // FIX: Afficher le message brut pour debug
    }
  }
});
 
// =====================
// ROUTE DE TEST MQTT (NEW)
// FIX: Permet de simuler des données sans capteur physique
// =====================
app.post('/api/test/simulate', (req, res) => {
  const { level = 65, inflow = 120, outflow = 95 } = req.body;
 
  const data = {
    level:     parseFloat(level),
    inflow:    parseFloat(inflow),
    outflow:   parseFloat(outflow),
    timestamp: new Date().toISOString(),
    status:    (level > 80 || level < 20) ? 'CRITICAL' : 'NORMAL'
  };
 
  lastKnownData = data;
  io.emit('basin_data', data);
 
  console.log('🧪 Simulation envoyée:', data);
  res.json({ success: true, data });
});
 
// =====================
// ROUTE EMAIL MANUELLE
// =====================
app.post('/api/send-alert', async (req, res) => {
  console.log('📧 Requête email reçue:', JSON.stringify(req.body, null, 2));
 
  const { toEmail, subject, message, type, level, timestamp } = req.body;
 
  if (!toEmail || !isValidEmail(toEmail)) {
    return res.status(400).json({ success: false, error: 'Email invalide ou manquant' });
  }
  if (!subject || subject.length > 200) {
    return res.status(400).json({ success: false, error: 'Sujet invalide (max 200 caractères)' });
  }
  if (!message || message.length > 1000) {
    return res.status(400).json({ success: false, error: 'Message invalide (max 1000 caractères)' });
  }
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Service email non configuré - vérifiez EMAIL_USER et EMAIL_PASSWORD dans .env'
    });
  }
 
  try {
    const alertLevel     = level     || 0;
    const alertType      = type      || 'warning';
    const alertTimestamp = timestamp || new Date().toISOString();
 
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0;">
        <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="margin-top: 0;">🌊 Alerte BassinAI</h2>
          <div style="padding: 15px; background: ${alertType === 'critical' ? '#450a0a' : '#451a03'}; border-left: 4px solid ${alertType === 'critical' ? '#ef4444' : '#f59e0b'}; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: ${alertType === 'critical' ? '#fca5a5' : '#fed7aa'};">
              ${alertType === 'critical' ? '🔴 CRITIQUE' : '🟠 ATTENTION'}
            </p>
            <p style="margin: 8px 0 0 0;">${sanitize(message)}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">Niveau</td>
              <td style="padding: 8px; border-bottom: 1px solid #334155; font-weight: bold;">${alertLevel}%</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">Type</td>
              <td style="padding: 8px; border-bottom: 1px solid #334155; font-weight: bold;">${alertType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94a3b8;">Date</td>
              <td style="padding: 8px; border-bottom: 1px solid #334155;">${new Date(alertTimestamp).toLocaleString('fr-FR')}</td>
            </tr>
          </table>
          <hr style="border: 1px solid #334155; margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center;">BassinAI — Système de supervision automatisé</p>
        </div>
      </div>
    `;
 
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sanitize(toEmail),
      subject: sanitize(subject),
      html: htmlContent
    });
 
    console.log('✅ Email envoyé:', result.messageId);
 
    if (supabase) {
      try {
        await supabase.from('notifications').insert({
          title: `${alertType === 'critical' ? '🚨' : '⚠️'} Alerte - Niveau ${alertLevel}%`,
          message: sanitize(message),
          type: alertType,
          level: alertLevel,
          email_sent: true,
          email_to: sanitize(toEmail),
          read: false
        });
        console.log('✅ Notification sauvegardée dans Supabase');
      } catch (dbErr) {
        console.warn('⚠️ Notification non sauvegardée:', dbErr.message);
      }
    }
 
    res.json({ success: true, message: 'Email envoyé avec succès', id: result.messageId });
 
  } catch (err) {
    console.error('❌ Erreur envoi email:', err.message);
    if (err.code === 'EAUTH') {
      res.status(401).json({ success: false, error: 'Authentification SMTP échouée' });
    } else {
      res.status(500).json({ success: false, error: `Erreur envoi email: ${err.message}` });
    }
  }
});
 
// =====================
// NOTIFICATIONS
// =====================
app.get('/api/notifications', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('❌ Erreur notifications:', err.message);
    res.status(500).json({ error: err.message });
  }
});
 
app.patch('/api/notifications/:id/read', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase non configuré' });
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// =====================
// CATCH-ALL 404
// =====================
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} non trouvée`,
    availableRoutes: [
      'GET  /api/health',
      'GET  /api/basin/current',
      'POST /api/send-alert',
      'POST /api/test/simulate',
      'GET  /api/notifications',
      'PATCH /api/notifications/:id/read'
    ]
  });
});
 
// =====================
// SERVER START
// =====================
server.listen(PORT, () => {
  console.log(`\n🚀 Backend BassinAI démarré: http://localhost:${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER || '❌ non configuré'}`);
  console.log(`🗄️  Supabase: ${supabase ? '✅ connecté' : '❌ non configuré'}`);
  console.log(`\n📋 Routes disponibles:`);
  console.log(`   GET   http://localhost:${PORT}/api/health`);
  console.log(`   GET   http://localhost:${PORT}/api/basin/current`);
  console.log(`   POST  http://localhost:${PORT}/api/send-alert`);
  console.log(`   POST  http://localhost:${PORT}/api/test/simulate  ← 🧪 TEST`);
  console.log(`   GET   http://localhost:${PORT}/api/notifications`);
  console.log(`   PATCH http://localhost:${PORT}/api/notifications/:id/read\n`);
});