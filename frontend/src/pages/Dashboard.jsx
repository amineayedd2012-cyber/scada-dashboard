import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Droplets, Activity, AlertTriangle, LogOut, TrendingUp, Clock, FlaskConical, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { emailService } from '../services/emailService';
import io from 'socket.io-client';

// =============================================
// SEUILS CONFIGURABLES — Modifier ici pour ajuster les plages
// =============================================
// Logique:
//   < 20%             → ROUGE   (CRITIQUE) + email
//   20% – 30%         → ORANGE  (ATTENTION proche du seuil bas) + email
//   30% – 70%         → VERT    (NORMAL) — pas d'email
//   70% – 80%         → ORANGE  (ATTENTION proche du seuil haut) + email
//   > 80%             → ROUGE   (CRITIQUE) + email
// =============================================
const SEUILS = {
  CRITIQUE_BAS  : 20,   // En dessous = ROUGE
  ATTENTION_BAS : 30,   // Entre 20 et 30 = ORANGE
  NORMAL_MIN    : 30,   // Entre 30 et 70 = VERT
  NORMAL_MAX    : 70,
  ATTENTION_HAUT: 80,   // Entre 70 et 80 = ORANGE
  CRITIQUE_HAUT : 80    // Au-dessus de 80 = ROUGE
};

// =============================================
// Fonction unique qui détermine l'état du bassin
// Retourne: { etat: 'normal'|'attention'|'critique', message: string, color, bg }
// =============================================
function evaluerEtatBassin(niveau) {
  if (niveau < SEUILS.CRITIQUE_BAS) {
    return {
      etat: 'critique',
      status: 'CRITIQUE',
      message: `🔴 CRITIQUE: Niveau très bas (${niveau.toFixed(1)}%) - Risque arrêt production!`,
      emailMessage: `Niveau d'eau critique: ${niveau.toFixed(1)}% - Inférieur à ${SEUILS.CRITIQUE_BAS}% - Risque arrêt production!`,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      type: 'critical'
    };
  }
  if (niveau < SEUILS.ATTENTION_BAS) {
    return {
      etat: 'attention',
      status: 'ATTENTION',
      message: `🟠 ATTENTION: Niveau proche du seuil bas (${niveau.toFixed(1)}%)`,
      emailMessage: `Niveau d'eau bas: ${niveau.toFixed(1)}% - Proche du seuil critique (${SEUILS.CRITIQUE_BAS}%) - À surveiller`,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      type: 'warning'
    };
  }
  if (niveau <= SEUILS.NORMAL_MAX) {
    return {
      etat: 'normal',
      status: 'NORMAL',
      message: null,
      emailMessage: null,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      type: 'normal'
    };
  }
  if (niveau <= SEUILS.ATTENTION_HAUT) {
    return {
      etat: 'attention',
      status: 'ATTENTION',
      message: `🟠 ATTENTION: Niveau proche du seuil haut (${niveau.toFixed(1)}%)`,
      emailMessage: `Niveau d'eau élevé: ${niveau.toFixed(1)}% - Proche du seuil critique (${SEUILS.CRITIQUE_HAUT}%) - À surveiller`,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      type: 'warning'
    };
  }
  // > SEUILS.CRITIQUE_HAUT
  return {
    etat: 'critique',
    status: 'CRITIQUE',
    message: `🔴 CRITIQUE: Niveau très élevé (${niveau.toFixed(1)}%) - Risque débordement!`,
    emailMessage: `Niveau d'eau critique: ${niveau.toFixed(1)}% - Supérieur à ${SEUILS.CRITIQUE_HAUT}% - Risque débordement!`,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    type: 'critical'
  };
}

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole]           = useState('user');
  const [userName, setUserName]           = useState('');
  const [level, setLevel]                 = useState(65);
  const [inflow, setInflow]               = useState(120);
  const [outflow, setOutflow]             = useState(95);
  const [alerts, setAlerts]               = useState([]);
  const [chartData, setChartData]         = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [connected, setConnected]         = useState(false);
  const [lastUpdate, setLastUpdate]       = useState(null);

  const lastEmailSentAtRef = useRef(0);

  const handleRealTimeData = useCallback(async (data) => {
    const { level: newLevel, inflow: newInflow, outflow: newOutflow } = data;

    if (typeof newLevel !== 'number' || typeof newInflow !== 'number' || typeof newOutflow !== 'number') {
      console.error('❌ Données invalides reçues:', data);
      return;
    }

    setLevel(newLevel);
    setInflow(newInflow);
    setOutflow(newOutflow);
    setLastUpdate(new Date().toLocaleTimeString());

    setChartData(prev => [
      ...prev.slice(-19),
      {
        time:    new Date().toLocaleTimeString(),
        level:   parseFloat(newLevel.toFixed(1)),
        inflow:  parseFloat(newInflow.toFixed(1)),
        outflow: parseFloat(newOutflow.toFixed(1))
      }
    ]);

    // =====================================================
    // NOUVELLE LOGIQUE D'ALERTES — Basée UNIQUEMENT sur le niveau
    // Plus de comparaison inflow vs outflow
    // =====================================================
    const etat = evaluerEtatBassin(newLevel);
    const newAlerts = [];
    const userEmail = localStorage.getItem('userEmail') || 'chneneahmed460@gmail.com';
    const now = Date.now();
    const COOLDOWN = 60000; // 1 minute entre 2 emails
    const canSendEmail = now - lastEmailSentAtRef.current > COOLDOWN;

    // Affichage du toast + ajout dans la liste des alertes
    // UNIQUEMENT pour orange (attention) et rouge (critique)
    if (etat.etat === 'critique') {
      newAlerts.push({
        type: 'critical',
        message: etat.message,
        level: newLevel,
        time: new Date().toLocaleTimeString()
      });
      toast.error(etat.message, { toastId: etat.message });

      // Envoi email pour CRITIQUE
      if (canSendEmail) {
        try {
          await emailService.sendAlert(userEmail, {
            message: etat.emailMessage,
            type: 'critical',
            level: newLevel
          });
          lastEmailSentAtRef.current = Date.now();
          toast.success('📧 Alerte critique envoyée par email');
        } catch (err) {
          console.warn('Email non envoyé:', err.message);
        }
      }
    } else if (etat.etat === 'attention') {
      newAlerts.push({
        type: 'warning',
        message: etat.message,
        level: newLevel,
        time: new Date().toLocaleTimeString()
      });
      toast.warning(etat.message, { toastId: etat.message });

      // Envoi email pour ATTENTION (orange)
      if (canSendEmail) {
        try {
          await emailService.sendAlert(userEmail, {
            message: etat.emailMessage,
            type: 'warning',
            level: newLevel
          });
          lastEmailSentAtRef.current = Date.now();
          toast.success('📧 Alerte attention envoyée par email');
        } catch (err) {
          console.warn('Email non envoyé:', err.message);
        }
      }
    }
    // Si NORMAL → aucune alerte, aucun email

    setAlerts(newAlerts.slice(0, 5));

    // Recommandations (informatives, n'envoient pas d'email)
    const recs = [];
    if (newLevel < SEUILS.CRITIQUE_BAS)        recs.push("🔴 Activer pompe d'apport en urgence");
    else if (newLevel < SEUILS.ATTENTION_BAS)  recs.push("🟠 Préparer la pompe d'apport");
    else if (newLevel > SEUILS.CRITIQUE_HAUT)  recs.push('🔴 Augmenter évacuation - URGENT');
    else if (newLevel > SEUILS.NORMAL_MAX)     recs.push('🟠 Surveiller l\'évacuation');
    else                                       recs.push('✅ Système normal - aucune action requise');
    setRecommendations(recs);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user';
    const name = localStorage.getItem('userName') || 'Utilisateur';
    setUserRole(role);
    setUserName(name);

    const socket = io('http://localhost:3001', {
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
    });

    socket.on('connect', () => {
      console.log('✅ Connecté au serveur WebSocket (ID:', socket.id, ')');
      setConnected(true);
      toast.success('Connecté au serveur de données en temps réel');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Erreur de connexion WebSocket:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Déconnecté du serveur WebSocket. Raison:', reason);
      setConnected(false);
      toast.error('Déconnecté du serveur de données');
    });

    socket.on('reconnect', (attempt) => {
      console.log(`🔄 Reconnecté après ${attempt} tentative(s)`);
      setConnected(true);
      toast.success('Reconnecté au serveur');
    });

    socket.on('basin_data', (data) => {
      console.log('📡 Données reçues via WebSocket:', data);
      handleRealTimeData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [handleRealTimeData]);

  const sendTestData = async () => {
    const testLevel   = Math.random() * 100;
    const testInflow  = Math.random() * 200;
    const testOutflow = Math.random() * 200;

    try {
      const res = await fetch('http://localhost:3001/api/test/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: testLevel, inflow: testInflow, outflow: testOutflow })
      });
      if (res.ok) {
        toast.info(`🧪 Test envoyé: niveau=${testLevel.toFixed(1)}%`);
      } else {
        toast.error('❌ Echec simulation — vérifiez le backend');
      }
    } catch (err) {
      toast.error('❌ Impossible de joindre le backend: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  // FIX: Utilise la même fonction unique pour rester cohérent partout
  const bassinStatus = evaluerEtatBassin(level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4">

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <Droplets className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl lg:text-3xl font-bold whitespace-nowrap">Bassin Sartex Dashboard</h1>
          </div>

          <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
            <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-xs">Débit entrée</span>
              <span className="text-sm font-bold text-blue-400">{inflow.toFixed(1)} L/min</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-xs">Débit sortie</span>
              <span className="text-sm font-bold text-purple-400">{outflow.toFixed(1)} L/min</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-xs">Système</span>
              <span className={`text-sm font-bold ${bassinStatus.color}`}>{bassinStatus.status}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-1.5">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-sm font-bold text-white">{lastUpdate || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <div className="hidden md:flex gap-2">
              <button
                onClick={sendTestData}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all text-sm"
                title="Envoyer des données de test sans capteur MQTT"
              >
                <FlaskConical className="w-4 h-4" />
                Tester
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden mt-4 bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">Débit entrée</p>
                <p className="text-sm font-bold text-blue-400">{inflow.toFixed(1)} L/min</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">Débit sortie</p>
                <p className="text-sm font-bold text-purple-400">{outflow.toFixed(1)} L/min</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">Système</p>
                <p className={`text-sm font-bold ${bassinStatus.color}`}>{bassinStatus.status}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs">Mise à jour</p>
                <p className="text-sm font-bold text-white">{lastUpdate || '—'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={sendTestData}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all text-sm"
              >
                <FlaskConical className="w-4 h-4" />
                Tester
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all text-sm"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm mt-2">
          Bienvenue {userName} ({userRole === 'admin' ? '👨‍💼 Admin' : '👤 Visiteur'})
          {connected ? ' — ● Temps réel actif' : ' — ● Déconnecté'}
        </p>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Card 1: Niveau d'eau */}
        <div className={`rounded-xl p-6 border border-slate-700 ${bassinStatus.bg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Niveau d'eau</h3>
            <Droplets className={`w-6 h-6 ${bassinStatus.color}`} />
          </div>
          <div className={`text-5xl font-bold ${bassinStatus.color}`}>{level.toFixed(1)}%</div>
          <p className={`mt-2 ${bassinStatus.color}`}>État: {bassinStatus.status}</p>
          <div className="mt-4 bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                bassinStatus.etat === 'critique' ? 'bg-red-500' :
                bassinStatus.etat === 'attention' ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(level, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Débit entrant */}
        <div className="rounded-xl p-6 border border-slate-700 bg-blue-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Débit entrant</h3>
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-5xl font-bold text-blue-400">{inflow.toFixed(1)}</div>
          <p className="text-gray-400 mt-2">L/min</p>
        </div>

        {/* Card 3: Débit sortant */}
        <div className="rounded-xl p-6 border border-slate-700 bg-purple-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Débit sortant</h3>
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-5xl font-bold text-purple-400">{outflow.toFixed(1)}</div>
          <p className="text-gray-400 mt-2">L/min</p>
        </div>
      </div>

      {/* Réservoir + Graphique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50 flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Réservoir</h3>
          <div className="relative w-24 h-40 border-2 border-gray-400 rounded-lg overflow-hidden bg-gradient-to-t from-blue-900/50 to-slate-700">
            <div
              className={`absolute bottom-0 w-full transition-all duration-1000 opacity-70 ${
                bassinStatus.etat === 'critique' ? 'bg-red-500' :
                bassinStatus.etat === 'attention' ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ height: `${Math.min(level, 100)}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{level.toFixed(0)}%</span>
            </div>
          </div>
          {/* Légende des seuils */}
          <div className="mt-4 text-xs text-gray-400 space-y-1 w-full">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded"></span>&lt; {SEUILS.CRITIQUE_BAS}% ou &gt; {SEUILS.CRITIQUE_HAUT}%</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded"></span>{SEUILS.CRITIQUE_BAS}-{SEUILS.ATTENTION_BAS}% ou {SEUILS.NORMAL_MAX}-{SEUILS.ATTENTION_HAUT}%</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span>{SEUILS.NORMAL_MIN}-{SEUILS.NORMAL_MAX}% (normal)</div>
          </div>
        </div>

        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50 col-span-2">
          <h3 className="text-lg font-bold mb-4">Évolution du niveau (dernières mesures)</h3>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p>En attente de données MQTT...</p>
                <p className="text-sm mt-2">Publiez sur le topic <code className="bg-slate-700 px-1 rounded">bassin/data</code></p>
                <p className="text-sm mt-1">ou cliquez sur <strong>Tester</strong> pour simuler</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="level" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLevel)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alertes et Recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-bold">Alertes</h3>
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
            )}
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    alert.type === 'critical'
                      ? 'bg-red-900/50 border border-red-500 text-red-200'
                      : 'bg-orange-900/50 border border-orange-500 text-orange-200'
                  }`}
                >
                  <p>{alert.message}</p>
                  <p className="text-xs mt-1 opacity-75">{alert.time}</p>
                </div>
              ))
            ) : (
              <p className="text-green-400">✅ Pas d'alerte - Système normal</p>
            )}
          </div>
        </div>

        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold">Recommandations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-cyan-900/30 border border-cyan-500/50 rounded-lg text-cyan-200">
                  {rec}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Pas de recommandation</p>
            )}
          </div>
        </div>
      </div>

      {/* Historique ADMIN */}
      {userRole === 'admin' && (
        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50 mb-8">
          <h3 className="text-lg font-bold mb-4">📊 Historique détaillé (Admin uniquement)</h3>
          {chartData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">En attente de données...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" yAxisId="left" domain={[0, 100]} />
                <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left"  type="monotone" dataKey="level"   stroke="#3b82f6" name="Niveau %" />
                <Line yAxisId="right" type="monotone" dataKey="inflow"  stroke="#10b981" name="Entrée L/min" />
                <Line yAxisId="right" type="monotone" dataKey="outflow" stroke="#f59e0b" name="Sortie L/min" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {userRole === 'user' && (
        <div className="rounded-xl p-6 border border-red-500/50 bg-red-900/20 mb-8">
          <p className="text-red-300">🔒 Accès historique refusé - Réservé à l'administrateur</p>
        </div>
      )}
    </div>
  );
}