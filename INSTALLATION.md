# 🚀 GUIDE D'INSTALLATION COMPLET

## ⚡ Installation rapide (5 minutes)

### 1. Frontend uniquement (mode DÉMO)

```bash
cd frontend
npm install
npm run dev
```

→ Ouvre http://localhost:3001  
→ Les données sont **simulées** (pas besoin Supabase)

---

## 🔧 Installation complète avec Supabase

### Étape 1: Créer compte Supabase

1. Aller sur https://supabase.com
2. Cliquer "Start your project"
3. S'enregistrer (Gmail, GitHub, etc.)
4. Créer nouveau projet (choisir région proche)
5. Attendre création (~2 minutes)

### Étape 2: Copier les clés

1. Aller dans "Settings" → "API"
2. Copier:
   - **Project URL** (supabaseUrl)
   - **anon key** (supabaseKey)

### Étape 3: Créer la base de données

1. Aller dans l'éditeur SQL (icône `<>`)
2. Copier le contenu de `backend/supabase/schema.sql`
3. Coller dans l'éditeur SQL
4. Cliquer "Run"
5. Attendre la confirmation ✅

### Étape 4: Ajouter données initiales

1. Copier le contenu de `backend/supabase/seed.sql`
2. Coller dans l'éditeur SQL
3. Cliquer "Run"

### Étape 5: Configurer le frontend

Modifier `frontend/src/config/supabase.js`:

```javascript
export const supabaseConfig = {
  supabaseUrl: "https://abc123xyz.supabase.co",      // Votre URL
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI..."       // Votre clé
};

export const DEMO_MODE = false; // Passer à FALSE
```

### Étape 6: Installer et lancer

```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:3001

---

## 🔐 Configuration authentification Admin

### Option 1: Supabase Auth (Recommandé)

1. Aller dans "Authentication" → "Users"
2. Cliquer "+ New user"
3. Email: `admin@example.com`
4. Password: `1234`
5. Cliquer "Create user"

### Option 2: Mode simulation (déjà configuré)

```javascript
// Dans LoginPage.jsx
if (email === 'admin@example.com' && password === '1234') {
  // Connexion OK
}
```

---

## 🎮 Tester l'application

### Test 1: Mode Admin

1. Cliquer onglet **"Admin"**
2. Email: `admin@example.com`
3. Password: `1234`
4. Cliquer "Se connecter"
5. Voir le dashboard complet
6. Descendre → voir **"Historique détaillé (Admin)"**
7. Cliquer "Déconnexion" → retour page d'accueil ✅

### Test 2: Mode Utilisateur

1. Cliquer onglet **"Utilisateur"**
2. Cliquer "Entrer en tant qu'Utilisateur"
3. Voir le dashboard (version réduite)
4. Descendre → voir ⛔ **"Accès historique refusé"**
5. Cliquer "Déconnexion" → retour page d'accueil ✅

---

## 🐛 Dépannage

### Erreur: "Failed to fetch data"

```javascript
// Vérifier supabase.js:
console.log(supabaseConfig);
// Doit afficher URL et clé (pas undefined)
```

### Dashboard vide

```javascript
// Vérifier localStorage:
localStorage.getItem('userRole')
// Doit afficher 'admin' ou 'user'
```

### Charts ne s'affichent pas

```bash
# Installer recharts:
npm install recharts
```

---

## 📦 Dépendances principales

### Frontend
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-router-dom": "6.18.0",
  "recharts": "2.10.3",
  "@supabase/supabase-js": "2.38.4",
  "tailwindcss": "3.3.6",
  "lucide-react": "0.292.0"
}
```

---

## 🔗 Ports par défaut

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3001 | http://localhost:3001 |
| Backend | 3000 | http://localhost:3000 |
| Supabase | Cloud | https://supabase.co |

---

## ✅ Checklist d'installation

- [ ] Créé compte Supabase
- [ ] Copié clés Supabase
- [ ] Exécuté schema.sql
- [ ] Exécuté seed.sql
- [ ] Configuré supabase.js
- [ ] `npm install` frontend
- [ ] `npm run dev` frontend
- [ ] Testé login Admin
- [ ] Testé login Utilisateur
- [ ] Testé déconnexion
- [ ] Vérifié restriction historique

---

**🎉 Installation terminée!**
