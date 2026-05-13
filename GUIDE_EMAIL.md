# 📧 GUIDE: Alertes par Email

**Envoyez des alertes par email à chaque problème détecté!**

---

## ⚙️ Configuration rapide (5 minutes)

### Étape 1: Créer un mot de passe d'application Gmail

1. Allez sur: https://myaccount.google.com/apppasswords
2. Sélectionnez:
   - **App**: Mail
   - **Device**: Windows
3. Copiez le mot de passe généré (ex: `abcd efgh ijkl mnop`)

### Étape 2: Créer le fichier `.env`

Créez un fichier `.env` dans `backend/`:

```
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
PORT=3000
```

### Étape 3: Installer Nodemailer

```bash
cd backend
npm install nodemailer
```

### Étape 4: Démarrer le backend

```bash
npm start
```

**Vous devriez voir:**
```
✅ Backend démarré sur http://localhost:3000
📧 Service email prêt
```

---

## 📱 Utilisation dans le Dashboard

### Comment ça marche?

1. Une alerte est détectée (ex: level < 20%)
2. L'alerte s'affiche dans le Dashboard
3. **Un email est envoyé automatiquement** 📧
4. L'utilisateur reçoit une notification

### Exemple d'email reçu:

```
🌊 Alerte BassinAI

🔴 ALERTE CRITIQUE
Niveau d'eau critique 15% - Risque d'arrêt production!

Détails de l'alerte:
- Type: critical
- Niveau d'eau: 15%
- Heure: 16/04/2026 10:05:30
```

---

## 🔧 Code d'intégration

### Frontend (Dashboard.jsx)

```javascript
import emailService from '../services/emailService';

// Dans le Dashboard
const handleAlertGenerated = async (alert) => {
  // Afficher l'alerte
  setAlerts(prev => [alert, ...prev].slice(0, 5));
  
  // Envoyer par email
  const userEmail = localStorage.getItem('userEmail') || 'chneneahmed460@gmail.com';
  await emailService.sendAlert(userEmail, alert);
};
```

### Déclencher l'email

```javascript
// Lors de la simulation des données
if (newLevel < 20) {
  const alert = {
    message: 'Niveau critique détecté!',
    type: 'critical',
    level: newLevel
  };
  
  // Appeler la fonction
  handleAlertGenerated(alert);
}
```

---

## 🔑 Variables d'environnement

### Requis
```
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=mot_de_passe_app
```

### Optionnel
```
PORT=3000
SUPABASE_URL=https://...
```

---

## ❌ Troubleshooting

### "535 5.7.8 Username and password not accepted"
→ Mot de passe d'application incorrect  
→ Vérifier: https://myaccount.google.com/apppasswords

### "Connect ECONNREFUSED 127.0.0.1:3000"
→ Backend ne fonctionne pas  
→ Démarrer: `npm start` dans `backend/`

### Email non reçu
→ Vérifier le dossier SPAM
→ Vérifier les logs du serveur

---

## 🎯 Prochaines étapes

1. ✅ Configurer `.env`
2. ✅ Installer `nodemailer`
3. ✅ Lancer backend: `npm start`
4. ✅ Tester avec une alerte
5. ✅ Vérifier l'email reçu

---

## 🔗 Ressources

- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Nodemailer Docs**: https://nodemailer.com
- **SendGrid (Alternative)**: https://sendgrid.com

---

**📧 Les alertes par email sont prêtes!**
