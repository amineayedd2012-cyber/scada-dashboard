import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase';

// Initialiser Supabase
const supabase = createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseKey);

// ===== SERVICE D'AUTHENTIFICATION =====
export const authService = {
  // Connexion Admin
  loginAdmin: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { success: true, user: data.user, role: 'admin' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Connexion simple Utilisateur (pas de mot de passe)
  loginUser: async () => {
    return { success: true, role: 'user', username: 'Visiteur' };
  },

  // Déconnexion
  logout: async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Récupérer utilisateur actuel
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

// ===== SERVICE NIVEAU D'EAU =====
export const waterLevelService = {
  // Récupérer le niveau actuel
  getCurrentLevel: async () => {
    try {
      const { data, error } = await supabase
        .from('water_level')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Récupérer historique
  getHistory: async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('water_level')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // S'abonner aux mises à jour en temps réel
  subscribeToChanges: (callback) => {
    return supabase
      .from('water_level')
      .on('*', payload => {
        callback(payload.new);
      })
      .subscribe();
  },

  // Ajouter nouvelle mesure (ADMIN)
  addMeasurement: async (level) => {
    try {
      const { data, error } = await supabase
        .from('water_level')
        .insert([{ level }]);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ===== SERVICE DÉBIT =====
export const flowRateService = {
  // Récupérer débit actuel
  getCurrentFlow: async () => {
    try {
      const { data, error } = await supabase
        .from('flow_rate')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Récupérer historique débit
  getHistory: async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('flow_rate')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Ajouter nouvelle mesure débit
  addMeasurement: async (inflow, outflow) => {
    try {
      const { data, error } = await supabase
        .from('flow_rate')
        .insert([{ inflow, outflow }]);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ===== SERVICE ALERTES =====
export const alertService = {
  // Récupérer toutes les alertes
  getAllAlerts: async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Récupérer alertes non lues
  getUnreadAlerts: async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('read', false)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Créer une alerte
  createAlert: async (message, type, level) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{ message, type, level }]);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Marquer comme lu
  markAsRead: async (alertId) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', alertId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // S'abonner aux nouvelles alertes
  subscribeToAlerts: (callback) => {
    return supabase
      .from('alerts')
      .on('INSERT', payload => {
        callback(payload.new);
      })
      .subscribe();
  }
};

export default supabase;
