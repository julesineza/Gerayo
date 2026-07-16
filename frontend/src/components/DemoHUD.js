import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function DemoHUD({
  currentRole,
  setRole,
  currentScreen, // 'onboarding', 'auth', 'driver_register', 'app'
  setScreen,
  passengerState,
  setPassengerState,
  driverState,
  setDriverState,
  triggerSOS,
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <TouchableOpacity style={styles.collapsedBadge} onPress={() => setIsOpen(true)}>
        <Ionicons name="construct" size={12} color={COLORS.black} />
        <Text style={styles.collapsedBadgeText}>DEMO CONTROL HUD</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="construct-sharp" size={14} color={COLORS.primary} />
          <Text style={styles.headerText}>GERAYO PROTOTYPE CONTROL</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOpen(false)}>
          <Ionicons name="close" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} nestedScrollEnabled={true}>
        {/* Role Toggle */}
        <Text style={styles.sectionTitle}>Active Persona Role</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.hudBtn, currentRole === 'passenger' && styles.hudBtnActivePassenger]}
            onPress={() => {
              setRole('passenger');
              setScreen('app');
            }}
          >
            <Text style={styles.btnText}>Passenger App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hudBtn, currentRole === 'driver' && styles.hudBtnActiveDriver]}
            onPress={() => {
              setRole('driver');
              setScreen('app');
            }}
          >
            <Text style={styles.btnText}>Driver App</Text>
          </TouchableOpacity>
        </View>

        {/* Global Screen Toggle */}
        <Text style={styles.sectionTitle}>Flow States</Text>
        <View style={styles.btnGrid}>
          <TouchableOpacity
            style={[styles.hudBtn, currentScreen === 'onboarding' && styles.hudBtnSelected]}
            onPress={() => setScreen('onboarding')}
          >
            <Text style={styles.btnTextSmall}>Onboarding Slider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hudBtn, currentScreen === 'auth' && styles.hudBtnSelected]}
            onPress={() => setScreen('auth')}
          >
            <Text style={styles.btnTextSmall}>Login / Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hudBtn, currentScreen === 'driver_register' && styles.hudBtnSelected]}
            onPress={() => setScreen('driver_register')}
          >
            <Text style={styles.btnTextSmall}>Driver Verification Flow</Text>
          </TouchableOpacity>
        </View>

        {/* Passenger Screen States */}
        {currentRole === 'passenger' && currentScreen === 'app' && (
          <>
            <Text style={styles.sectionTitle}>Passenger Screen states</Text>
            <View style={styles.btnGrid}>
              <TouchableOpacity
                style={[styles.hudBtnState, passengerState === 'home' && styles.hudBtnSelected]}
                onPress={() => setPassengerState('home')}
              >
                <Text style={styles.btnTextSmall}>1. Home Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, passengerState === 'booking' && styles.hudBtnSelected]}
                onPress={() => setPassengerState('booking')}
              >
                <Text style={styles.btnTextSmall}>2. Price Booking Sheet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, passengerState === 'matching' && styles.hudBtnSelected]}
                onPress={() => setPassengerState('matching')}
              >
                <Text style={styles.btnTextSmall}>3. Radar Dispatching</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, passengerState === 'active' && styles.hudBtnSelected]}
                onPress={() => setPassengerState('active')}
              >
                <Text style={styles.btnTextSmall}>4. Active Ride Map</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, passengerState === 'receipt' && styles.hudBtnSelected]}
                onPress={() => setPassengerState('receipt')}
              >
                <Text style={styles.btnTextSmall}>5. Trip Receipt & Rate</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Driver Screen States */}
        {currentRole === 'driver' && currentScreen === 'app' && (
          <>
            <Text style={styles.sectionTitle}>Driver Screen states</Text>
            <View style={styles.btnGrid}>
              <TouchableOpacity
                style={[styles.hudBtnState, driverState === 'idle' && styles.hudBtnSelected]}
                onPress={() => setDriverState('idle')}
              >
                <Text style={styles.btnTextSmall}>1. Online Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, driverState === 'incoming' && styles.hudBtnSelected]}
                onPress={() => setDriverState('incoming')}
              >
                <Text style={styles.btnTextSmall}>2. Incoming request card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, driverState === 'navigating_pickup' && styles.hudBtnSelected]}
                onPress={() => setDriverState('navigating_pickup')}
              >
                <Text style={styles.btnTextSmall}>3. Heading to client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtnState, driverState === 'navigating_destination' && styles.hudBtnSelected]}
                onPress={() => setDriverState('navigating_destination')}
              >
                <Text style={styles.btnTextSmall}>4. Driving Client Home</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Event Simulations */}
        <Text style={styles.sectionTitle}>Global Simulators</Text>
        <TouchableOpacity style={styles.sosTriggerBtn} onPress={triggerSOS}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
          <Text style={styles.sosTriggerBtnText}>FORCE TRIGGER EMERGENCY SOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedBadge: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 999,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  collapsedBadgeText: {
    color: COLORS.black,
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  container: {
    position: 'absolute',
    top: 90,
    left: 15,
    right: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 16,
    maxHeight: 250,
    zIndex: 999,
    shadowColor: COLORS.black,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
  },
  body: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 6,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hudBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
  },
  hudBtnActivePassenger: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,184,0,0.1)',
  },
  hudBtnActiveDriver: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0,210,184,0.1)',
  },
  hudBtnSelected: {
    borderColor: COLORS.white,
    backgroundColor: COLORS.border,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  btnTextSmall: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  btnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  hudBtnState: {
    flexBasis: '31%',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: '1%',
    marginBottom: 6,
  },
  sosTriggerBtn: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 14,
  },
  sosTriggerBtnText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
