# 🆘 AIDE - COMMENT UTILISER CE PROJET

**Vous ne savez pas par où commencer?** Lisez ceci! 👇

---

## 🎯 Commencez ici

### Pour les PRESSÉS ⚡ (5 minutes)
1. Ouvrir terminal PowerShell
2. Copier-coller:
```powershell
cd C:\Users\DELL\Desktop\superbassisn\frontend
npm install
npm run dev
```
3. Ouvrir http://localhost:3001
4. Cliquer "Admin" → admin@example.com / 1234

**C'est prêt!** 🎉

---

### Pour les DÉBUTANTS 👨‍💻 (20 minutes)
1. Lire: `README.md`
2. Lire: `GUIDE_DEBUTANT.md`
3. Lancer: `npm install && npm run dev`
4. Tester les 2 profils
5. Vérifier la restriction d'accès

---

### Pour les DÉVELOPPEURS 💻 (30 minutes)
1. Lire: `PROMPT_FINAL.md`
2. Explorer: dossier `frontend/src/`
3. Comprendre: services/alertGenerator.js
4. Configurer: config/supabase.js (optionnel)
5. Déployer: build `npm run build`

---

## 📚 Quelle documentation lire?

### "Je veux juste voir ça marcher"
→ **DEMARRAGE_RAPIDE.md**

### "Je suis débutant et je veux comprendre"
→ **GUIDE_DEBUTANT.md** puis **README.md**

### "Je suis développeur et j'ai besoin des détails"
→ **PROMPT_FINAL.md** puis explorquez le code

### "Je veux tout savoir"
→ **README.md** (complet)

### "Ça ne marche pas!"
→ **README.md** (section Troubleshooting)

---

## 🚀 Étapes exactes pour lancer

### 1️⃣ Ouvrir PowerShell (Windows)

```powershell
# Appuyez sur Win + R
powershell
# Ou: Clic droit → Open PowerShell
```

### 2️⃣ Aller dans le dossier frontend

```powershell
cd C:\Users\DELL\Desktop\superbassisn\frontend
```

### 3️⃣ Installer les dépendances

```powershell
npm install
```

**Attend 2-3 minutes...**

### 4️⃣ Lancer l'application

```powershell
npm run dev
```

**Attendre: "Local: http://localhost:3001"**

### 5️⃣ Ouvrir le navigateur

```
http://localhost:3001
```

**L'app démarre automatiquement!** 🎉

---

## 🧪 Que tester d'abord?

### Test 1: Admin (Accès complet)

```
1. Cliquer onglet "Admin"
   ↓
2. Email: admin@example.com
   ↓
3. Password: 1234
   ↓
4. Cliquer "Se connecter"
   ↓
5. ✅ Voir le dashboard complet
   ↓
6. Scroller vers le bas
   ↓
7. ✅ Voir "Historique détaillé (Admin)"
   ↓
8. Cliquer "Déconnexion"
   ↓
9. ✅ Retour page d'accueil
```

### Test 2: Utilisateur (Accès limité)

```
1. Cliquer onglet "Utilisateur"
   ↓
2. Cliquer "Entrer en tant qu'Utilisateur"
   ↓
3. ✅ Voir le dashboard (réduit)
   ↓
4. Scroller vers le bas
   ↓
5. ✅ Voir ⛔ "Accès historique refusé"
   ↓
6. Cliquer "Déconnexion"
   ↓
7. ✅ Retour page d'accueil
```

---

## ❓ Questions fréquentes

### Q: "Erreur: 'npm' is not recognized"
**R:** Node.js n'est pas installé
- Télécharger: https://nodejs.org
- Installer (version LTS)
- Redémarrer PowerShell
- Relancer

### Q: "Port 3001 is already in use"
**R:** Un autre programme utilise le port
- Modifier: `frontend/vite.config.js`
- Changer: `port: 3001` → `port: 3002`
- Relancer

### Q: "Les données ne changent pas"
**R:** C'est normal en mode démo
- Les données sont simulées
- Elles changent toutes les 5 secondes
- Attendre et vérifier

### Q: "Je peux voir l'historique en tant qu'User"
**R:** Impossible!
- Le code le vérifie
- `if (userRole === 'user')` → affiche "Accès refusé"
- Vérifier localStorage: F12 → Application → localStorage

### Q: "Comment déployer?"
**R:** Trois options:
1. **Vercel**: `npm install -g vercel && vercel`
2. **Netlify**: `npm run build` puis drag/drop
3. **GitHub Pages**: `npm run build`

---

## 🔍 Où trouver ce qu'on cherche?

### "Je veux voir le dashboard"
→ Fichier: `frontend/src/pages/Dashboard.jsx`

### "Comment marche la connexion?"
→ Fichier: `frontend/src/pages/LoginPage.jsx`

### "Comment les alertes sont générées?"
→ Fichier: `frontend/src/services/alertGenerator.js`

### "Comment connecter Supabase?"
→ Fichier: `frontend/src/config/supabase.js`

### "Où sont les styles?"
→ Fichier: `frontend/src/index.css`

### "Comment marche le routing?"
→ Fichier: `frontend/src/App.jsx`

---

## 🎓 Comprendre le code

### Structure simple:

```
LoginPage.jsx
  ↓
  (Admin ou User clique)
  ↓
Dashboard.jsx
  ↓
  Affiche données
  + Alertes
  + Graphiques
  + Restriction historique
  ↓
  (Cliquer "Déconnexion")
  ↓
Retour LoginPage.jsx
```

### Flux de données:

```
State (useState)
  ↓
Mises à jour (setInterval)
  ↓
Graphiques (Recharts)
  ↓
Alertes (AlertGenerator)
  ↓
Affichage
```

### Sécurité:

```
localStorage.setItem('userRole', 'admin'/'user')
  ↓
Dans Dashboard.jsx:
  if (userRole === 'admin') → Montrer tout
  else → Montrer "Accès refusé"
  ↓
À la déconnexion:
  localStorage.clear()
```

---

## 🛠️ Modifications simples

### Changer les couleurs
→ Modifier: `frontend/src/index.css`

### Changer le mot de passe admin
→ Modifier: `frontend/src/pages/LoginPage.jsx`
→ Chercher: `'1234'`

### Changer les seuils d'alerte
→ Modifier: `frontend/src/services/alertGenerator.js`
→ Chercher: `if (level < 20)`

### Ajouter un bouton
→ Modifier: `frontend/src/pages/Dashboard.jsx`
→ Copier un `<button>` existant

---

## 📊 Supabase (optionnel)

### Vous n'en avez PAS besoin pour tester!
- Mode DÉMO: les données sont simulées
- Fonctionne sans internet
- Parfait pour apprendre

### Si vous voulez Supabase:
1. Créer compte: https://supabase.com
2. Nouveau projet
3. Copier URL + clé
4. Modifier: `frontend/src/config/supabase.js`
5. Exécuter: `backend/supabase/schema.sql`
6. Exécuter: `backend/supabase/seed.sql`

---

## 🎯 Prochaines étapes

### Après avoir testé:
1. ✅ Explorez le code
2. ✅ Modifiez les couleurs
3. ✅ Changez le mot de passe
4. ✅ Ajoutez une nouvelle page
5. ✅ Configurez Supabase
6. ✅ Déployez en ligne

### Pour apprendre:
1. React: https://react.dev
2. Tailwind: https://tailwindcss.com
3. Supabase: https://supabase.com
4. Vite: https://vitejs.dev

---

## ✅ Checklist

- [ ] Node.js installé
- [ ] Terminal ouvert
- [ ] `npm install` exécuté
- [ ] `npm run dev` lancé
- [ ] Port 3001 ouvert
- [ ] Testé Admin
- [ ] Testé User
- [ ] Testé Logout
- [ ] Vérifié restriction historique
- [ ] Exploré le code

---

**💡 Besoin d'aide?**

1. Lire la doc (README.md)
2. Vérifier console (F12)
3. Google: "React error..."
4. Stack Overflow

---

**Bonne chance! 🚀**
