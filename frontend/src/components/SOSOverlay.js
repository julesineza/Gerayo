import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Vibration, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function SOSOverlay({ visible, onClose }) {
  const [countdown, setCountdown] = useState(3);
  const [sosActivated, setSosActivated] = useState(false);

  useEffect(() => {
    let interval = null;
    if (visible && !sosActivated) {
      setCountdown(3);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, sosActivated]);

  const triggerSOS = () => {
    setSosActivated(true);
    // Vibrate to alert user
    try {
      Vibration.vibrate([100, 200, 100, 200], true);
    } catch (e) {
      console.log('Vibration not supported or enabled');
    }
  };

  const handleCancel = () => {
    try {
      Vibration.cancel();
    } catch (e) {}
    setSosActivated(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        {!sosActivated ? (
          <View style={styles.countdownBox}>
            <View style={styles.alertIconBg}>
              <Ionicons name="warning" size={48} color={COLORS.white} />
            </View>
            <Text style={styles.countdownTitle}>TRIGGERING EMERGENCY SOS</Text>
            <Text style={styles.countdownDesc}>
              Connecting to Gerayo Security Command & sending your live location to emergency contacts.
            </Text>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{countdown}</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>CANCEL (Tap to Stop)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeSOSBox}>
            <View style={styles.pulseRadarContainer}>
              <View style={[styles.pulseCircle, styles.pulseCircle1]} />
              <View style={[styles.pulseCircle, styles.pulseCircle2]} />
              <View style={styles.sosShieldIcon}>
                <Ionicons name="shield-checkmark" size={60} color={COLORS.white} />
              </View>
            </View>

            <Text style={styles.activeTitle}>SOS DISPATCHED</Text>
            <Text style={styles.activeStatusText}>LIVE SECURITY AUDIO STREAMING</Text>

            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>GPS: 1.9441° S, 30.0619° E (Kigali)</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="people" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>Alert Sent to 3 Emergency Contacts</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="call" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>Security Patrol Officer Dispatched</Text>
              </View>
            </View>

            <View style={styles.secTeamBadge}>
              <Ionicons name="radio" size={18} color={COLORS.success} />
              <Text style={styles.secTeamText}>Command Center Online • 0:14s</Text>
            </View>

            <TouchableOpacity style={styles.deescalateBtn} onPress={handleCancel}>
              <Text style={styles.deescalateText}>I am Safe (Resolve SOS)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 69, 58, 0.96)', // Emergency Red overlay
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  countdownBox: {
    alignItems: 'center',
  },
  alertIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  countdownTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  countdownDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 40,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  timerText: {
    fontSize: 54,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cancelBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  activeSOSBox: {
    alignItems: 'center',
    width: '100%',
  },
  pulseRadarContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  sosShieldIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pulseCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pulseCircle1: {
    width: 130,
    height: 130,
  },
  pulseCircle2: {
    width: 170,
    height: 170,
  },
  activeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 5,
  },
  activeStatusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    letterSpacing: 1,
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    color: COLORS.white,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  secTeamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  secTeamText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  deescalateBtn: {
    borderWidth: 2,
    borderColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  deescalateText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
