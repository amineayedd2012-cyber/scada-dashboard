require('dotenv').config();
const mqtt = require('mqtt');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://test.mosquitto.org';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'bassin/data';

console.log(`🔌 Connexion au broker MQTT (${MQTT_URL})...`);
const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  console.log('✅ Connecté au broker ! Début de la simulation des capteurs...');
  
  // Envoie de nouvelles données toutes les 3 secondes
  setInterval(() => {
    // On génère des valeurs aléatoires mais réalistes pour la démonstration
    const data = {
      level: Math.floor(Math.random() * 60) + 20, // entre 20% et 80%
      inflow: Math.floor(Math.random() * 50) + 80,
      outflow: Math.floor(Math.random() * 50) + 70,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📤 Publication de données vers ${MQTT_TOPIC} :`, data);
    client.publish(MQTT_TOPIC, JSON.stringify(data));
  }, 3000); 
});

client.on('error', (err) => {
  console.error('❌ Erreur MQTT:', err);
});
