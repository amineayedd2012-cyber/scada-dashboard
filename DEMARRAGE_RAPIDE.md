# 🎯 DÉMARRAGE RAPIDE (3 étapes)

## ⚡ Lancez l'appli en 2 minutes

### Étape 1: Installation
```bash
cd c:\Users\DELL\Desktop\superbassisn\frontend
npm install
```

### Étape 2: Lancer
```bash
npm run dev
```

### Étape 3: Ouvrir navigateur
```
http://localhost:3001
```

---

## 🧪 TESTEZ IMMÉDIATEMENT

### Test 1: Admin (Accès complet)
1. Cliquer onglet **"Admin"**
2. Email: `admin@example.com`
3. Password: `1234`
4. ✅ Voir dashboard complet
5. ✅ Descendre → voir **"Historique détaillé"**
6. ✅ Cliquer **"Déconnexion"** → retour accueil

### Test 2: Utilisateur (Accès limité)
1. Cliquer onglet **"Utilisateur"**
2. Cliquer **"Entrer en tant qu'Utilisateur"**
3. ✅ Voir dashboard (sans historique)
4. ✅ Descendre → voir ⛔ **"Accès refusé"**
5. ✅ Cliquer **"Déconnexion"** → retour accueil

---

## 📖 DOCUMENTATION

| Fichier | Contenu |
|---------|---------|
| README.md | 📖 Doc complète (130+ lignes) |
| INSTALLATION.md | 🚀 Guide installation détaillé |
| GUIDE_DEBUTANT.md | 👨‍💻 Explications pour débutants |
| PROMPT_FINAL.md | 📋 Résumé du projet |
| CHECKLIST.md | ✅ Structure finale |
| DEMARRAGE_RAPIDE.md | ⚡ Ce fichier |

---

## 🏗️ STRUCTURE

```
superbassisn/
├── frontend/              ← Appli web (port 3001)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     (2 onglets)
│   │   │   └── Dashboard.jsx     (Main)
│   │   ├── services/
│   │   │   └── supabase.js       (API)
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/               ← Supabase (optionnel)
│   ├── supabase/
│   │   ├── schema.sql    (Tables)
│   │   └── seed.sql      (Données)
│   └── ...
│
└── README.md             ← Docs
```

---

## ⭐ FONCTIONNALITÉS

✅ 2 profils (Admin + User)  
✅ Dashboard temps réel  
✅ Alertes intelligentes  
✅ Historique Admin seulement  
✅ Déconnexion → accueil  
✅ Design moderne  
✅ Données simulées  
✅ Prêt Supabase  

---

## 🐛 PROBLÈMES?

**"Erreur: npm not found"**
→ Installer Node.js: https://nodejs.org

**"Port 3001 déjà utilisé"**
→ Modifier vite.config.js: `port: 3002`

**"Supabase URL invalide"**
→ Modifier: `frontend/src/config/supabase.js`

---

**🎉 C'est prêt! Bon développement!**
