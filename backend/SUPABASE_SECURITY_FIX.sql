-- MIGRATION DE SÉCURITÉ POUR LA TABLE NOTIFICATIONS
-- À l'heure actuelle, la table est accessible publiquement de façon non sécurisée.
-- Exécutez ceci dans SQL Editor de votre projet Supabase:

-- 1. Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques permissives (si elles existent)
DROP POLICY IF EXISTS "Allow anon insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anon read notifications" ON notifications;

-- 3. Politique 1 : Les applications clientes (anon key) peuvent LIRE les notifications
CREATE POLICY "Les clients peuvent lire" ON notifications 
FOR SELECT 
USING (true); 
-- (Si vous ajoutez un auth_id utilisateur, changez 'true' par 'auth.uid() = user_id')

-- 4. Politique 2 : Seul le service_role (le Backend) peut INSERER
-- Retirer le droit d'insertion au rôle 'anon' (visiteur non authentifié du web)
-- "C'est notre backend sécurisé qui crée les notifications, jamais le client web"
CREATE POLICY "Seul le backend (service_role) peut insérer" ON notifications 
FOR INSERT 
WITH CHECK (current_user = 'service_role');

-- 5. Politique 3 : Modification (lecture/read=true) par les clients (anon)
CREATE POLICY "Les clients peuvent marquer comme lu" ON notifications 
FOR UPDATE 
USING (true)
WITH CHECK (true);
