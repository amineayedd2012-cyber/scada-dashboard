# 🌊 BassinAI - Dashboard Supervision Bassins d'Eau

**Système professionnel de supervision en temps réel des bassins d'eau industriels**

---

## 📋 Table des matières
- [🎯 Objectifs](#objectifs)
- [✨ Fonctionnalités](#fonctionnalités)
- [🏗️ Architecture](#architecture)
- [🚀 Installation rapide](#installation)
- [📖 Guide complet débutant](#guide-complet)
- [🔑 Identifiants de test](#identifiants)
- [🎓 Explications détaillées](#explications)
- [🐛 Troubleshooting](#troubleshooting)

---

## 🎯 Objectifs

Ce projet crée un **dashboard professionnel** pour superviser des bassins d'eau dans une station industrielle avec:

✅ **Affichage temps réel** du niveau d'eau  
✅ **Alertes intelligentes** selon seuils critiques  
✅ **Graphiques en direct** avec Recharts  
✅ **Système d'authentification** (Admin + Utilisateur)  
✅ **Accès restreint** à l'historique (Admin seulement)  
✅ **Design moderne** SCADA industriel (Dark mode)  
✅ **Déconnexion** retour page d'accueil  

---

## ✨ Fonctionnalités

### 1️⃣ **Deux profils d'accès**

| Fonctionnalité | Admin | Utilisateur |
|---|---|---|
| Connexion | ✅ Email + mot de passe | ✅ Sans connexion |
| Dashboard | ✅ Complet | ✅ Complet |
| Alertes | ✅ Oui | ✅ Oui |
| **Historique** | ✅ **OUI** | ❌ **NON** |
| Recommandations | ✅ Oui | ✅ Oui |
| Déconnexion | ✅ Retour accueil | ✅ Retour accueil |

### 2️⃣ **Dashboard Principal**

```
┌────────────────────────────────────────────┐
│  BassinAI Dashboard                Logout  │
├────────────────────────────────────────────┤
│                                            │
│  📊 Niveau d'eau    💧 Débit entrant       │
│   [65%] ████░░░     [120 L/min]            │
│                                            │
│  📉 Débit sortant   🏠 Réservoir animé    │
│   [95 L/min]        [████░░░░░]            │
│                                            │
│  ⚠️ ALERTES          💡 RECOMMANDATIONS   │
│  [Niveau bas]       [Réduire débit]       │
│  [Anomalie]         [Stable]              │
│                                            │
│  📈 HISTORIQUE (Admin)                    │
│  [Graphique détaillé des 24 dernières h]  │
│                                            │
└────────────────────────────────────────────┘
```

### 3️⃣ **Alertes Intelligentes**

```javascript
// Logique automatique
if (level < 20%) 
  → 🔴 CRITIQUE: "Risque arrêt production"

if (level > 90%) 
  → 🔴 CRITIQUE: "Risque débordement"

if (outflow > inflow) 
  → 🔴 ANOMALIE: "Débit sortie > entrée"

if (30% < level < 80%) 
  → ✅ NORMAL: "Système fonctionnel"
```

### 4️⃣ **Animation du Réservoir**

```
Réservoir
┌─────────────┐
│             │
│ █████░░░░░  │ 65% (Bleu = Normal)
│             │
└─────────────┘

// Couleurs automatiques:
Bleu   = Normal (40-80%)
Orange = Attention (20-40% ou 80-90%)
Rouge  = Critique (< 20% ou > 90%)
```

### 5️⃣ **Graphiques en Temps Réel**

- **Niveau d'eau** (AreaChart) - mise à jour toutes les 5 secondes
- **Débit entrant/sortant** (LineChart) - suivi simultané
- **Historique détaillé** (Réservé Admin)

---

## 🏗️ Architecture

```
superbassisn/
│
├── frontend/                      ← Application React (Port 3001)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      ← Page connexion (2 onglets)
│   │   │   └── Dashboard.jsx      ← Dashboard principal
│   │   ├── services/
│   │   │   ├── supabase.js        ← Services API/BD
│   │   │   └── alertGenerator.js  ← Logique alertes
│   │   ├── config/
│   │   │   └── supabase.js        ← Configuration
│   │   ├── App.jsx                ← Routing
│   │   ├── main.jsx               ← Entry point
│   │   └── index.css              ← Styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
│
├── backend/                       ← Backend Express (Port 3000) [OPTIONNEL]
│   ├── server.js                  ← Serveur Express
│   ├── package.json
│   ├── supabase/
│   │   ├── schema.sql            ← Création tables
│   │   └── seed.sql              ← Données initiales
│   └── .env.example
│
└── README.md                      ← Ce fichier
```

---

## 🚀 Installation rapide

### **Étape 1: Installation des dépendances**

**Frontend:**
```bash
cd frontend
npm install
```

**Backend (optionnel):**
```bash
cd backend
npm install
```

### **Étape 2: Configuration Supabase**

1. Créez un compte gratuit: [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Copiez l'URL et la clé anon
4. Modifiez `frontend/src/config/supabase.js`:

```javascript
export const supabaseConfig = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseKey: "YOUR_ANON_KEY"
};
```

5. Exécutez les scripts SQL:
   - `backend/supabase/schema.sql` (créer tables)
   - `backend/supabase/seed.sql` (ajouter données)

### **Étape 3: Lancer l'application**

**Frontend:**
```bash
cd frontend
npm run dev
```
→ Ouvre http://localhost:3001

**Backend (si utilisé):**
```bash
cd backend
npm start
```
→ Serveur http://localhost:3000

---

## 📖 Guide complet DÉBUTANT

### 🎓 COMPRENDRE LE PROJET

#### **Qu'est-ce que c'est?**
C'est une application web qui affiche le niveau d'eau d'un bassin industrial (comme dans une usine ou station de traitement d'eau). Le système:
- ✅ Montre le niveau en temps réel
- ✅ Génère des alertes si problème
- ✅ Fait des recommandations
- ✅ Garde l'historique des mesures

#### **Pourquoi deux profils (Admin + Utilisateur)?**
- **Admin**: Accès complet (peut voir l'historique, tout l'historique)
- **Utilisateur**: Accès limité (voir le dashboard en direct, PAS d'historique)

#### **La sécurité**
Seul l'Admin peut voir l'historique des mesures (pour protéger les données sensibles).

---

### 🔑 Identifiants de test

**Mode DÉMO** (sans Supabase):
- Aucune connexion requise
- Les données sont simulées
- Cliquez juste sur les onglets

**Avec Supabase (mode production):**

**Admin:**
```
Email:    admin@example.com
Password: 1234
```

**Utilisateur:**
```
Cliquez sur "Entrer en tant qu'Utilisateur"
(pas de mot de passe)
```

---

## 🎓 Explications détaillées

### 1️⃣ **PAGE DE CONNEXION (LoginPage.jsx)**

```jsx
// Vous voyez 2 ONGLETS:
┌──────────────┬──────────────────┐
│  Admin 🔒    │  Utilisateur 👤  │
└──────────────┴──────────────────┘

// Admin: entre email + password
// User: juste clique le bouton (pas de formulaire)
```

**Code simplifié:**
```javascript
if (role === 'admin') {
  // Vérifier email + password
  if (email === 'admin@example.com' && password === '1234') {
    localStorage.setItem('userRole', 'admin');
    navigate('/dashboard');
  }
}

if (role === 'user') {
  // Accès direct sans vérification
  localStorage.setItem('userRole', 'user');
  navigate('/dashboard');
}
```

---

### 2️⃣ **DASHBOARD (Dashboard.jsx)**

**Que se passe-t-il?**

1. **Récupère le rôle** depuis `localStorage`:
```javascript
const userRole = localStorage.getItem('userRole'); // 'admin' ou 'user'
```

2. **Affiche les données** (simules):
```javascript
// Niveau d'eau: 0-100%
level = 65%

// Débit entrant (L/min)
inflow = 120

// Débit sortant (L/min)
outflow = 95
```

3. **Génère les alertes** selon logique:
```javascript
if (level < 20) → 🔴 CRITIQUE
if (level > 90) → 🔴 DÉBORDEMENT
if (outflow > inflow) → 🔴 ANOMALIE
else → ✅ NORMAL
```

4. **Affiche l'historique** (ADMIN SEULEMENT):
```javascript
if (userRole === 'admin') {
  // Afficher le graphique complet
  <HistoriqueChart />
} else {
  // Afficher message "Accès refusé"
  <p>🔒 Historique: Admin seulement</p>
}
```

5. **Bouton déconnexion**:
```javascript
function handleLogout() {
  localStorage.clear(); // Effacer le rôle
  window.location.href = '/'; // Retour accueil
}
```

---

### 3️⃣ **SYSTÈME D'ALERTES (alertGenerator.js)**

**Comment fonctionnent les alertes?**

```javascript
// Classe AlertGenerator avec 3 méthodes:

1. checkWaterLevel(level)
   // Vérifier si niveau d'eau ok
   input:  65%
   output: { message: "✅ Normal", type: "info" }

2. checkFlowRate(inflow, outflow)
   // Vérifier si débit ok
   input:  inflow=120, outflow=95
   output: { message: "✅ Débits stables", type: "info" }

3. getBasinStatus(level)
   // Retourner état bassin
   input:  65%
   output: { status: "NORMAL", color: "green" }
```

**Exemple complet:**
```javascript
// Scenario: Niveau baisse à 15%
level = 15

// Vérifier:
if (level < 20) {
  alert = {
    message: "🔴 CRITIQUE: Niveau d'eau 15% - Risque arrêt!",
    type: "critical",
    color: "red"
  }
}

// Afficher alerte rouge et recommandation:
// "🔴 Activer pompe d'apport d'eau immédiatement"
```

---

### 4️⃣ **GRAPHIQUES TEMPS RÉEL**

**Avec Recharts:**

```jsx
<AreaChart data={chartData}>
  <Area 
    dataKey="level" 
    stroke="#3b82f6" 
    fill="url(#colorLevel)" 
  />
</AreaChart>
```

**Le graphique se met à jour automatiquement:**
```javascript
setInterval(() => {
  // Ajouter nouvelle mesure
  setChartData(prev => [
    ...prev.slice(-19),  // Garder 20 derniers points
    {
      time: "10:05:30",
      level: 65.5,
      inflow: 120,
      outflow: 95
    }
  ]);
}, 5000); // Mise à jour tous les 5 secondes
```

---

### 5️⃣ **RESTRICTION D'ACCÈS**

**Code qui restreint l'historique:**

```javascript
// Dans Dashboard.jsx

if (userRole === 'admin') {
  // ✅ AFFICHER l'historique
  return (
    <div>
      <h3>Historique détaillé (Admin)</h3>
      <LineChart data={chartData} />
    </div>
  );
}

if (userRole === 'user') {
  // ❌ REFUSER l'historique
  return (
    <div className="bg-red-900/20">
      <p>🔒 Accès historique refusé - Réservé à l'admin</p>
    </div>
  );
}
```

---

### 6️⃣ **SUPABASE (temps réel)**

**Pourquoi Supabase?**

Supabase permet:
- 📡 **Realtime**: Les données se mettent à jour en temps réel
- 🔐 **Authentification**: Gérer les utilisateurs
- 📊 **Base de données**: PostgreSQL dans le cloud

**Comment ça marche?**

```javascript
// S'abonner aux changements
supabase
  .from('water_level')
  .on('*', payload => {
    console.log('Nouvelle mesure:', payload.new);
    setLevel(payload.new.level); // Mise à jour auto
  })
  .subscribe();
```

---

## 📂 Fichiers importants

### **`frontend/src/pages/LoginPage.jsx`**
- Page avec 2 onglets (Admin/User)
- Formulaire Admin avec email + password
- Bouton direct pour User

### **`frontend/src/pages/Dashboard.jsx`**
- Dashboard principal
- Affiche niveau, débit, alertes
- Animation réservoir
- Graphiques temps réel
- **RESTRICTION**: Historique pour Admin seulement
- Bouton déconnexion

### **`frontend/src/services/supabase.js`**
- Connexion à Supabase
- Récupérer données BD
- S'abonner aux changes temps réel

### **`frontend/src/services/alertGenerator.js`**
- Logique génération alertes
- Calcule l'état du bassin
- Donne recommandations

### **`backend/supabase/schema.sql`**
- Crée les tables Supabase:
  - `water_level` (niveau d'eau)
  - `flow_rate` (débits)
  - `alerts` (alertes)

---

## 🎨 Design et couleurs

```
🔵 BLEU     = Normal (40-80%)
🟠 ORANGE   = Attention (20-40% ou 80-90%)
🔴 ROUGE    = Critique (< 20% ou > 90%)
🟢 VERT     = Status OK
```

---

## 🛠️ Modification du projet

### **Ajouter une nouvelle métrique**

1. Ajouter colonne Supabase:
```sql
ALTER TABLE water_level ADD COLUMN temperature FLOAT;
```

2. Ajouter dans Dashboard:
```jsx
const [temperature, setTemperature] = useState(0);
// Afficher la valeur...
```

### **Changer les seuils d'alerte**

Modifier `alertGenerator.js`:
```javascript
// Avant:
if (level < 20) → CRITIQUE

// Après:
if (level < 30) → CRITIQUE  // Seuil plus bas
```

### **Ajouter login social (Google)**

Supabase le supporte nativement:
```javascript
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

---

## 🐛 Troubleshooting

### **❌ "Erreur: Supabase URL invalide"**
→ Vérifier `frontend/src/config/supabase.js`  
→ Remplacer `YOUR_PROJECT_ID` par votre vrai projet

### **❌ "Dashboard vide"**
→ Les données sont en simulation  
→ Actualiser la page (F5)
→ Vérifier console pour erreurs (F12)

### **❌ "Déconnexion ne marche pas"**
→ Vérifier localStorage:
```javascript
// Dans la console:
localStorage.getItem('userRole') // Doit être vide après logout
```

### **❌ "Admin ne peut pas se connecter"**
→ Vérifier les identifiants de démo:
```
Email: admin@example.com
Pass:  1234
```

### **❌ "Historique visible pour User"**
→ Le code vérifie `userRole` automatiquement  
→ Vérifier localStorage:
```javascript
localStorage.getItem('userRole') // Doit être 'user' pas 'admin'
```

---

## 📊 Améliorations futures

- [ ] Intégration capteurs réels
- [ ] Export données CSV/PDF
- [ ] Notifications email
- [ ] Multi-bassins
- [ ] Mobile app (React Native)
- [ ] API REST complète
- [ ] Authentification 2FA
- [ ] Dashboard analytics avancé

---

## 📞 Support

**Questions?** Vérifiez:
1. Console navigateur (F12) pour erreurs
2. Ce README (section Troubleshooting)
3. Documentation Supabase: https://supabase.com/docs
4. Documentation React: https://react.dev

---

## 📄 Licence

MIT - Libre d'utilisation pour projets personnels et commerciaux

---

**🌟 Bon développement!**  
*Créé avec ❤️ pour la supervision industrielle*
