// ===== SERVICE D'ENVOI D'EMAILS =====

export const emailService = {
  // Envoyer une alerte par email
  sendAlert: async (email, alert) => {
    try {
      // FIX: Sujet adapté selon le type d'alerte
      //   - critical → 🔴 URGENT
      //   - warning  → 🟠 Attention
      let subject;
      if (alert.type === 'critical') {
        subject = `🔴 URGENT - Bassin Sartex: ${alert.message}`;
      } else if (alert.type === 'warning') {
        subject = `🟠 Attention - Bassin Sartex: ${alert.message}`;
      } else {
        subject = `🚨 Alerte Bassin Sartex: ${alert.message}`;
      }

      const response = await fetch('http://localhost:3001/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: email,
          subject: subject,
          message: alert.message,
          type: alert.type,
          level: alert.level,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'alerte');
      }

      const data = await response.json();
      console.log('✅ Alerte envoyée par email:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return { success: false, error: error.message };
    }
  }
};

export default emailService;