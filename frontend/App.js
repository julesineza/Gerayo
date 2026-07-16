import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/theme/colors';

// Import Custom Components
import DemoHUD from './src/components/DemoHUD';
import WalletModal from './src/components/WalletModal';
import SOSOverlay from './src/components/SOSOverlay';

// Import Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import PassengerHomeScreen from './src/screens/PassengerHomeScreen';
import DriverDashboard from './src/screens/DriverDashboard';
import DriverRegistration from './src/screens/DriverRegistration';

export default function App() {
  // Navigation Screens: 'onboarding', 'auth', 'driver_register', 'app'
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  
  // App Modes: 'passenger' or 'driver'
  const [activeRole, setActiveRole] = useState('passenger');

  // Sub-navigation flow states for the Passenger flow
  const [passengerState, setPassengerState] = useState('home'); // 'home', 'booking', 'matching', 'active', 'receipt'

  // Sub-navigation flow states for the Driver flow
  const [driverState, setDriverState] = useState('idle'); // 'idle', 'incoming', 'navigating_pickup', 'navigating_destination'

  // Global Overlay/Modal states
  const [walletVisible, setWalletVisible] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);

  // Authentication submission callback
  const handleAuthComplete = (role, userDetails) => {
    setActiveRole(role);
    setCurrentScreen('app');
  };

  // Skip or back helper to onboarding
  const handleResetToOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.background} />

      {/* 1. Onboarding Flow */}
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onAuthComplete={handleAuthComplete} />
      )}

      {/* 2. Authentication Screen Directly (triggered via HUD or skips) */}
      {currentScreen === 'auth' && (
        <View style={{ flex: 1 }}>
          {/* We reuse OnboardingScreen in login state */}
          <OnboardingScreen onAuthComplete={handleAuthComplete} />
        </View>
      )}

      {/* 3. Driver Register Flow */}
      {currentScreen === 'driver_register' && (
        <DriverRegistration
          onComplete={handleResetToOnboarding}
          onCancel={handleResetToOnboarding}
        />
      )}

      {/* 4. Active Main App (Passenger or Driver Dashboard) */}
      {currentScreen === 'app' && (
        <View style={{ flex: 1 }}>
          {activeRole === 'passenger' ? (
            <PassengerHomeScreen
              openWallet={() => setWalletVisible(true)}
              triggerSOS={() => setSosVisible(true)}
              activeState={passengerState}
              setActiveState={setPassengerState}
            />
          ) : (
            <DriverDashboard
              openWallet={() => setWalletVisible(true)}
              triggerSOS={() => setSosVisible(true)}
              driverState={driverState}
              setDriverState={setDriverState}
            />
          )}
        </View>
      )}

      {/* GLOBAL OVERLAYS & CONTROLLERS */}
      
      {/* Wallet Modal */}
      <WalletModal visible={walletVisible} onClose={() => setWalletVisible(false)} />

      {/* SOS Emergency Overlay */}
      <SOSOverlay visible={sosVisible} onClose={() => setSosVisible(false)} />

      {/* Collapsible Interactive Demo Control HUD */}
      <DemoHUD
        currentRole={activeRole}
        setRole={setActiveRole}
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        passengerState={passengerState}
        setPassengerState={setPassengerState}
        driverState={driverState}
        setDriverState={setDriverState}
        triggerSOS={() => setSosVisible(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
