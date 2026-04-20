import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('user'); // 'admin' ou 'user'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Connexion Admin
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulation: vérifier admin
    if (email === 'amineayedd2012@gmail.com' && password === '0044') {
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Administrateur');
      navigate('/dashboard');
    } else {
      setError('❌ Email ou mot de passe incorrect (essayez: amineayedd2012@gmail.com / 0044)');
    }
    setLoading(false);
  };

  // Connexion simple Utilisateur
  const handleUserLogin = () => {
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userName', 'Visiteur');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center p-4">
      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Conteneur principal */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">BassinAI</h1>
          </div>
          <p className="text-gray-400 text-lg">Système de supervision des bassins d'eau en temps réel</p>
        </div>

        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          {/* Onglet Admin */}
          <div
            onClick={() => setRole('admin')}
            className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${
              role === 'admin'
                ? 'bg-blue-600 shadow-lg shadow-blue-500/50'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              <div>
                <p className="font-bold text-white">Admin</p>
                <p className="text-sm text-gray-300">Accès complet</p>
              </div>
            </div>
          </div>

          {/* Onglet Utilisateur */}
          <div
            onClick={() => setRole('user')}
            className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${
              role === 'user'
                ? 'bg-cyan-600 shadow-lg shadow-cyan-500/50'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              <div>
                <p className="font-bold text-white">Utilisateur</p>
                <p className="text-sm text-gray-300">Lecture seule</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl">
          {role === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se connecter (Admin)'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-cyan-900/50 border border-cyan-500 rounded-lg p-6 text-center">
                <User className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <p className="text-gray-200 mb-4">Vous allez accéder au dashboard en mode visiteur</p>
                <p className="text-sm text-gray-400">⚠️ Accès limité - historique indisponible</p>
              </div>

              <button
                onClick={handleUserLogin}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50"
              >
                Entrer en tant qu'Utilisateur
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © 2025 BassinAI - Système de supervision industrielle
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
