import { alertService } from './supabase';

// ===== GÉNÉRATEUR D'ALERTES INTELLIGENTES =====
export class AlertGenerator {
  // Vérifier niveau d'eau et générer alertes
  static async checkWaterLevel(level) {
    const alerts = [];

    // ❌ CRITIQUE: Niveau < 20%
    if (level < 20) {
      alerts.push({
        message: `⚠️ CRITIQUE: Niveau d'eau ${level}% - Risque d'arrêt production!`,
        type: 'critical',
        level
      });
    }
    // ⚠️ WARNING: Niveau 20-50%
    else if (level < 50) {
      alerts.push({
        message: `⚡ Niveau d'eau bas (${level}%) - Vérifier apport en eau`,
        type: 'warning',
        level
      });
    }
    // ⚠️ DÉBORDEMENT: Niveau > 90%
    else if (level > 90) {
      alerts.push({
        message: `🚨 DÉBORDEMENT: Niveau ${level}% - Activer évacuation!`,
        type: 'critical',
        level
      });
    }
    // ✅ NORMAL
    else {
      alerts.push({
        message: `✅ Niveau d'eau normal (${level}%)`,
        type: 'info',
        level
      });
    }

    // Créer les alertes dans la base
    for (const alert of alerts) {
      await alertService.createAlert(alert.message, alert.type, alert.level);
    }

    return alerts;
  }

  // Vérifier le débit
  static async checkFlowRate(inflow, outflow) {
    const alerts = [];

    // Anomalie: débit sortie > débit entrée
    if (outflow > inflow) {
      alerts.push({
        message: `🚨 ANOMALIE: Débit sortie (${outflow}L/min) > Entrée (${inflow}L/min)`,
        type: 'critical',
        level: 0
      });
    }
    // Débit proche
    else if (Math.abs(inflow - outflow) < 10) {
      alerts.push({
        message: `⚡ Débits équilibrés - Situation stable`,
        type: 'info',
        level: 50
      });
    }
    // Débit entrant faible
    else if (inflow < 50) {
      alerts.push({
        message: `⚠️ Débit entrant très faible (${inflow}L/min)`,
        type: 'warning',
        level: 30
      });
    }

    // Créer les alertes
    for (const alert of alerts) {
      await alertService.createAlert(alert.message, alert.type, alert.level);
    }

    return alerts;
  }

  // Obtenir l'état du bassin
  static getBasinStatus(level) {
    if (level < 20 || level > 90) return { status: 'CRITICAL', color: 'red', icon: '🔴' };
    if (level < 50 || level > 70) return { status: 'WARNING', color: 'orange', icon: '🟠' };
    return { status: 'NORMAL', color: 'green', icon: '🟢' };
  }

  // Calculer temps avant vide/plein
  static calculateTimeEstimate(level, flowIn, flowOut) {
    const netFlow = flowIn - flowOut; // L/min

    if (netFlow === 0) return { empty: '∞', full: '∞' };

    const timeToEmpty = netFlow > 0 ? 
      ((100 - level) * 100) / (netFlow * 60) : 
      (level * 100) / (Math.abs(netFlow) * 60);

    const timeToFull = netFlow > 0 ? 
      (level * 100) / (netFlow * 60) : 
      ((100 - level) * 100) / (Math.abs(netFlow) * 60);

    return {
      empty: timeToEmpty > 0 ? `${Math.round(timeToEmpty)}h` : '∞',
      full: timeToFull > 0 ? `${Math.round(timeToFull)}h` : '∞'
    };
  }

  // Recommandations intelligentes
  static getRecommendations(level, inflow, outflow) {
    const recommendations = [];

    if (level < 30 && inflow <= outflow) {
      recommendations.push('🔴 Activer pompe d\'apport d\'eau immédiatement');
    }

    if (level > 80) {
      recommendations.push('💧 Augmenter débit de sortie ou ouvrir évacuation');
    }

    if (inflow < 50) {
      recommendations.push('⚙️ Vérifier pompe d\'entrée - Débit faible');
    }

    if (outflow > inflow && level > 50) {
      recommendations.push('📛 Réduire consommation ou fermer circuit de sortie');
    }

    if (level >= 30 && level <= 80 && Math.abs(inflow - outflow) < 20) {
      recommendations.push('✅ Système fonctionnant optimalement');
    }

    return recommendations;
  }
}

export default AlertGenerator;
