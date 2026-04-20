# 👨‍💻 GUIDE DÉBUTANT - Explication pas à pas

## 📚 Qu'est-ce que c'est?

Ce projet est une **application web** (comme Facebook, Gmail) qui affiche le niveau d'eau d'un bassin.

### Les 3 parties:

```
┌─────────────────────────────────────────────┐
│          FRONTEND (React.js)                │
│  • Page d'accueil                          │
│  • Page connexion                          │
│  • Dashboard avec graphiques               │
│                                             │
│  (Ce que vous voyez à l'écran)             │
└─────────────────────────────────────────────┘
                    ↓
         (Comunique via Internet)
                    ↓
┌─────────────────────────────────────────────┐
│       BACKEND - Supabase (Cloud)            │
│  • Base de données (PostgreSQL)             │
│  • Authentification utilisateurs            │
│  • Temps réel (Realtime)                   │
│                                             │
│  (Ce qui se passe "derrière")              │
└─────────────────────────────────────────────┘
```

---

## 🎯 Les 2 profils d'accès

### 👨‍💼 ADMIN (Accès complet)

```
1. Accueil → Cliquer onglet "Admin"
2. Entrer email + password
3. Voir le DASHBOARD COMPLET
4. Cliquer sur "Historique" → Voir toutes les mesures
5. Déconnexion → Retour accueil
```

**Code:**
```javascript
// 1. Connexion
email = "admin@example.com"
password = "1234"

// 2. Vérification
if (email et password corrects) {
  // 3. Aller au dashboard
  window.location = "/dashboard"
  
  // 4. Sauvegarder le rôle
  localStorage.userRole = "admin"
}

// 5. Déconnexion
function logout() {
  localStorage.clear()
  window.location = "/"
}
```

### 👤 UTILISATEUR (Accès limité)

```
1. Accueil → Cliquer onglet "Utilisateur"
2. Cliquer bouton "Entrer" (pas de login!)
3. Voir le DASHBOARD (sans historique)
4. Essayer cliquer "Historique" → "Accès refusé"
5. Déconnexion → Retour accueil
```

**Code:**
```javascript
// 1. Pas de vérification
// 2. Accès direct
localStorage.userRole = "user"
window.location = "/dashboard"

// 3. Dans le dashboard
if (userRole === "admin") {
  // Afficher historique
} else if (userRole === "user") {
  // Afficher message: "Accès refusé"
  return <div>🔒 Historique Admin seulement</div>
}
```

---

## 🎨 Interface utilisateur

### Page d'accueil

```
        [BassinAI Logo]
    Système supervision bassins
    
    ┌─────────────┬──────────────┐
    │  Admin 🔒   │  User 👤     │
    │  Accès      │  Accès       │
    │  complet    │  limité      │
    └─────────────┴──────────────┘
    
    [Formulaire Admin]
    Email: ____________________
    Pass:  ____________________
    [Se connecter]
    
    OU
    
    [Bouton: Entrer comme Utilisateur]
```

### Dashboard

```
┌─────────────────────────────────────────────┐
│  BassinAI Dashboard         [Déconnexion]   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Niveau 65%   │  │ Débit 120L/m │        │
│  │ [████░░░░░░] │  │ ████░░░░░░   │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Animation réservoir                  │  │
│  │  ┌──────────┐                        │  │
│  │  │          │                        │  │
│  │  │ ████░░░░ │ 65%                    │  │
│  │  │          │                        │  │
│  │  └──────────┘                        │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │ Alertes      │  │ Recommandations  │   │
│  │              │  │                  │   │
│  │ ✅ Normal    │  │ ✅ Système OK    │   │
│  │              │  │                  │   │
│  └──────────────┘  └──────────────────┘   │
│                                             │
│  [Graphique: Evolution niveau (24h)]       │
│  (ADMIN SEULEMENT)                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 💾 Données et alertes

### Données (mises à jour toutes les 5 secondes)

```javascript
const data = {
  level: 65,              // 0-100%
  inflow: 120,            // L/min entrant
  outflow: 95,            // L/min sortant
  timestamp: "10:05:30"
}
```

### Alertes automatiques

```javascript
// Vérifier niveau
if (level < 20) {
  alert = {
    icon: "🔴",
    message: "CRITIQUE: Niveau très bas!",
    color: "red"
  }
}

// Vérifier débit
if (outflow > inflow) {
  alert = {
    icon: "🔴",
    message: "ANOMALIE: Débit sortie > entrée!",
    color: "red"
  }
}

// Normal
if (level >= 40 && level <= 80) {
  alert = {
    icon: "✅",
    message: "Système fonctionnel",
    color: "green"
  }
}
```

---

## 📊 Comment fonctionnent les graphiques?

### Avant (statique)
```
Niveau: 65%
[Affichage simplement "65%"]
```

### Après (dynamique en temps réel)
```
Temps    Niveau
10:00    60%     ⠁
10:05    63%     ⠃
10:10    65%     ⠇
10:15    64%     ⠆
10:20    67%  ╱──╲    ← Graphique qui bouge!
```

**Le code:**
```javascript
// Ajouter chaque nouvelle mesure
setChartData(prev => [
  ...prev.slice(-19),      // Garder 20 derniers points
  { time: "10:20", level: 67 }  // Ajouter le nouveau
]);

// Afficher graphique
<LineChart data={chartData}>
  <Line dataKey="level" />
</LineChart>
```

---

## 🔐 Sécurité et restriction d'accès

### Historique (Admin seulement)

```javascript
// Dans Dashboard:

// 1. Vérifier si admin
const userRole = localStorage.getItem('userRole');

// 2. Si admin → Afficher
if (userRole === 'admin') {
  return (
    <div>
      <h3>Historique complet</h3>
      <Chart data={allHistoric} />
    </div>
  );
}

// 3. Si user → Refuser
if (userRole === 'user') {
  return (
    <div style="color: red">
      🔒 Accès refusé - Historique réservé à l'admin
    </div>
  );
}
```

### localStorage (stockage local)

```javascript
// Après connexion, on sauvegarde:
localStorage.setItem('userRole', 'admin');

// Lors du rechargement, on récupère:
const role = localStorage.getItem('userRole');

// À la déconnexion, on efface:
localStorage.removeItem('userRole');
```

---

## 🚀 Étapes d'exécution

### 1️⃣ Démarrage
```bash
cd frontend
npm install      # Installer dépendances
npm run dev      # Lancer l'app
```

### 2️⃣ Ouvrir navigateur
```
http://localhost:3001
```

### 3️⃣ Tester Admin
- Cliquer "Admin"
- Email: admin@example.com
- Password: 1234
- Voir dashboard complet
- Voir historique
- Cliquer déconnexion

### 4️⃣ Tester Utilisateur
- Cliquer "Utilisateur"
- Cliquer "Entrer"
- Voir dashboard limité
- Pas d'historique
- Cliquer déconnexion

---

## 🎓 Concepts clés

### State (État)
```javascript
const [level, setLevel] = useState(65);
// level = 65  (valeur actuelle)
// setLevel(70)  (change la valeur → rechargement auto)
```

### useEffect (Exécuter au chargement)
```javascript
useEffect(() => {
  // Ce code s'exécute UNE FOIS au démarrage
  initializeDashboard();
}, []);
```

### Routing (Navigation)
```javascript
// Pages:
/ → LoginPage
/dashboard → Dashboard

// Navigation:
<Link to="/dashboard">Aller au dashboard</Link>
```

### LocalStorage (Mémoire du navigateur)
```javascript
// Sauvegarder
localStorage.setItem('userRole', 'admin');

// Récupérer
const role = localStorage.getItem('userRole');

// Supprimer
localStorage.removeItem('userRole');
```

---

## ❓ Questions fréquentes

### Q: Pourquoi 2 onglets?
R: Pour montrer comment gérer différents rôles dans une app. Admin a plus de droits que Utilisateur.

### Q: Pourquoi localStorage?
R: Pour "se souvenir" de l'utilisateur même après rechargement de page.

### Q: Pourquoi les données changent?
R: C'est simulé avec `Math.random()` pour montrer le fonctionnement en temps réel.

### Q: Comment ajouter un vrai bassin?
R: Connecter un capteur IoT qui envoie les données à Supabase.

---

**🎉 Vous avez maintenant compris comment marche le projet!**
