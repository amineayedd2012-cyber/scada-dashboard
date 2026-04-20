import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Droplets, Activity, AlertTriangle, LogOut, TrendingUp, Clock, FlaskConical } from 'lucide-react';
import { toast } from 'react-toastify';
import { emailService } from '../services/emailService';
import io from 'socket.io-client';
 
export default function Dashboard() {
  const [userRole, setUserRole]           = useState('user');
  const [userName, setUserName]           = useState('');
  const [level, setLevel]                 = useState(65);
  const [inflow, setInflow]               = useState(120);
  const [outflow, setOutflow]             = useState(95);
  const [alerts, setAlerts]               = useState([]);
  const [chartData, setChartData]         = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [connected, setConnected]         = useState(false); // FIX: état connexion visible
  const [lastUpdate, setLastUpdate]       = useState(null);  // FIX: timestamp dernière donnée
 
  const lastEmailSentAtRef = useRef(0);
 
  // FIX: handleRealTimeData déclarée avec useCallback pour éviter les stale closures
  const handleRealTimeData = useCallback(async (data) => {
    const { level: newLevel, inflow: newInflow, outflow: newOutflow } = data;
 
    // FIX: Vérification que les valeurs sont bien des nombres
    if (typeof newLevel !== 'number' || typeof newInflow !== 'number' || typeof newOutflow !== 'number') {
      console.error('❌ Données invalides reçues:', data);
      return;
    }
 
    setLevel(newLevel);
    setInflow(newInflow);
    setOutflow(newOutflow);
    setLastUpdate(new Date().toLocaleTimeString()); // FIX: Horodatage de la dernière mise à jour
 
    setChartData(prev => [
      ...prev.slice(-19),
      {
        time:    new Date().toLocaleTimeString(),
        level:   parseFloat(newLevel.toFixed(1)),
        inflow:  parseFloat(newInflow.toFixed(1)),
        outflow: parseFloat(newOutflow.toFixed(1))
      }
    ]);
 
    // Alertes + emails
    const newAlerts  = [];
    const userEmail  = localStorage.getItem('userEmail') || 'amineayedd2012@gmail.com';
    const now        = Date.now();
    const COOLDOWN   = 60000;
    const canSendEmail = now - lastEmailSentAtRef.current > COOLDOWN;
 
    const trySendEmail = async (message, type) => {
      if (type === 'critical')      toast.error(message,   { toastId: message });
      else if (type === 'warning')  toast.warning(message, { toastId: message });
      else                          toast.info(message,    { toastId: message });
 
      if (!canSendEmail) return;
 
      try {
        await emailService.sendAlert(userEmail, { message, type, level: newLevel });
        lastEmailSentAtRef.current = Date.now();
        toast.success('📧 Alerte email envoyée');
      } catch (err) {
        console.warn('Email non envoyé:', err.message);
        // FIX: Ne pas afficher d'erreur toast pour chaque échec email (spam)
      }
    };
 
    if (newLevel < 20) {
      newAlerts.push({ type: 'critical', message: '🔴 CRITIQUE: Niveau très bas! < 20%', level: newLevel, time: new Date().toLocaleTimeString() });
      trySendEmail(`Niveau d'eau critique: ${newLevel.toFixed(1)}% - Risque arrêt production!`, 'critical');
    } else if (newLevel > 90) {
      newAlerts.push({ type: 'critical', message: '🔴 CRITIQUE: Risque débordement! > 90%', level: newLevel, time: new Date().toLocaleTimeString() });
      trySendEmail(`Niveau d'eau critique: ${newLevel.toFixed(1)}% - Risque débordement!`, 'critical');
    } else if (newLevel < 40) {
      newAlerts.push({ type: 'warning', message: "🟠 ATTENTION: Niveau d'eau bas < 40%", level: newLevel, time: new Date().toLocaleTimeString() });
      trySendEmail(`Niveau d'eau bas: ${newLevel.toFixed(1)}% - À surveiller`, 'warning');
    }
 
    if (newOutflow > newInflow) {
      newAlerts.push({ type: 'critical', message: '🔴 ANOMALIE: Débit sortie > entrée!', time: new Date().toLocaleTimeString() });
      trySendEmail(`Anomalie débit: Sortie (${newOutflow.toFixed(1)}) > Entrée (${newInflow.toFixed(1)})`, 'critical');
    }
 
    setAlerts(newAlerts.slice(0, 5));
 
    const recs = [];
    if (newLevel < 30)                        recs.push("🔴 Activer pompe d'apport");
    if (newLevel > 80)                        recs.push('💧 Augmenter évacuation');
    if (newOutflow > newInflow)               recs.push('📛 Réduire consommation');
    if (newLevel >= 40 && newLevel <= 80)     recs.push('✅ Système normal');
    setRecommendations(recs);
  }, []); // FIX: dépendances vides car on n'utilise que des setters et des refs stables
 
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user';
    const name = localStorage.getItem('userName') || 'Utilisateur';
    setUserRole(role);
    setUserName(name);
 
    const socket = io('http://localhost:3001', {
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,   // FIX: délai avant reconnexion
    });
 
    socket.on('connect', () => {
      console.log('✅ Connecté au serveur WebSocket (ID:', socket.id, ')');
      setConnected(true);
      toast.success('Connecté au serveur de données en temps réel');
    });
 
    socket.on('connect_error', (err) => {
      console.error('❌ Erreur de connexion WebSocket:', err.message);
      setConnected(false);
      // FIX: Toast seulement si vraiment déconnecté (évite spam au démarrage)
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
 
    // FIX: Nom de l'événement "basin_data" — doit correspondre exactement à io.emit('basin_data') dans server.js
    socket.on('basin_data', (data) => {
      console.log('📡 Données reçues via WebSocket:', data);
      handleRealTimeData(data);
    });
 
    return () => {
      socket.disconnect();
    };
  }, [handleRealTimeData]);
 
  // =====================
  // FIX: Bouton de test — simule des données sans MQTT
  // =====================
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
 
  const getBasinStatus = () => {
    if (level < 20 || level > 90) return { status: 'CRITIQUE',  color: 'text-red-500',    bg: 'bg-red-500/10' };
    if (level < 40 || level > 70) return { status: 'ATTENTION', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return                               { status: 'NORMAL',    color: 'text-green-500',  bg: 'bg-green-500/10' };
  };
 
  const bassinStatus = getBasinStatus();
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4">
 
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="w-8 h-8 text-blue-400" />
            BassinAI Dashboard
          </h1>
          <p className="text-gray-400">
            Bienvenue {userName} ({userRole === 'admin' ? '👨‍💼 Admin' : '👤 Visiteur'})
          </p>
 
          {/* FIX: Indicateur de connexion visible */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-xs text-gray-400">
              {connected ? '● Temps réel actif' : '● Déconnecté'}
              {lastUpdate && connected && ` — Dernière donnée: ${lastUpdate}`}
            </span>
          </div>
        </div>
 
        <div className="flex gap-2">
          {/* FIX: Bouton test simulation */}
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
                level < 40 ? 'bg-red-500' : level < 70 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(level, 100)}%` }} // FIX: clamp à 100%
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
 
        {/* Réservoir animé */}
        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50 flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Réservoir</h3>
          <div className="relative w-24 h-40 border-2 border-gray-400 rounded-lg overflow-hidden bg-gradient-to-t from-blue-900/50 to-slate-700">
            <div
              className={`absolute bottom-0 w-full transition-all duration-1000 ${
                level < 40 ? 'bg-red-500' : level < 70 ? 'bg-orange-500' : 'bg-blue-500'
              } opacity-70`}
              style={{ height: `${Math.min(level, 100)}%` }} // FIX: clamp à 100%
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{level.toFixed(0)}%</span>
            </div>
          </div>
        </div>
 
        {/* Graphique niveau */}
        <div className="rounded-xl p-6 border border-slate-700 bg-slate-800/50 col-span-2">
          <h3 className="text-lg font-bold mb-4">Évolution du niveau (dernières mesures)</h3>
          {chartData.length === 0 ? (
            // FIX: Message quand aucune donnée temps réel reçue
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
 
        {/* Alertes */}
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
 
        {/* Recommandations */}
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
 
      {/* Historique ADMIN uniquement */}
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
 
      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700">
          <p className="text-gray-400 text-sm">Consommation nette</p>
          {/* FIX: formule corrigée — c'est outflow - inflow si sortie > entrée */}
          <p className={`text-2xl font-bold ${outflow > inflow ? 'text-red-400' : 'text-green-400'}`}>
            {(outflow - inflow).toFixed(1)} L/min
          </p>
        </div>
        <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700">
          <p className="text-gray-400 text-sm">Delta flux</p>
          <p className="text-2xl font-bold">{Math.abs(inflow - outflow).toFixed(1)} L</p>
        </div>
        <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700">
          <p className="text-gray-400 text-sm">État système</p>
          <p className={`text-2xl font-bold ${bassinStatus.color}`}>{bassinStatus.status}</p>
        </div>
        <div className="rounded-lg p-4 bg-slate-800/50 border border-slate-700">
          <p className="text-gray-400 text-sm">Mise à jour</p>
          <p className="text-2xl font-bold">{lastUpdate || '—'}</p>
        </div>
      </div>
    </div>
  );
}