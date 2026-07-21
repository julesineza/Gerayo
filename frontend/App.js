import React from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/theme/colors';

// Import Custom Components
import WalletModal from './src/components/WalletModal';
import SOSOverlay from './src/components/SOSOverlay';

// Import Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import PassengerHomeScreen from './src/screens/PassengerHomeScreen';
import DriverDashboard from './src/screens/DriverDashboard';
import DriverRegistration from './src/screens/DriverRegistration';

// Import Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // App Modes: 'passenger' or 'driver' - determined from user role
  const activeRole = user?.role?.toLowerCase() || 'passenger';

  // Sub-navigation flow states for the Passenger flow
  const [passengerState, setPassengerState] = React.useState('home'); // 'home', 'booking', 'matching', 'active', 'receipt'

  // Sub-navigation flow states for the Driver flow
  const [driverState, setDriverState] = React.useState('idle'); // 'idle', 'incoming', 'navigating_pickup', 'navigating_destination'

  // Global Overlay/Modal states
  const [walletVisible, setWalletVisible] = React.useState(false);
  const [sosVisible, setSosVisible] = React.useState(false);

  // Authentication submission callback
  const handleAuthComplete = (role, userDetails) => {
    // Auth is handled by AuthContext, this just ensures proper flow
  };

  // Skip or back helper to onboarding
  const handleResetToOnboarding = () => {
    // This would trigger logout in AuthContext
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Show onboarding if not authenticated
  if (!isAuthenticated) {
    return (
      <OnboardingScreen onAuthComplete={handleAuthComplete} />
    );
  }

  // Show driver registration if driver but not approved
  if (activeRole === 'driver' && !user.driverProfile?.isApproved) {
    return (
      <DriverRegistration
        onComplete={handleResetToOnboarding}
        onCancel={handleResetToOnboarding}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.background} />

      {/* Active Main App (Passenger or Driver Dashboard) */}
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

      {/* GLOBAL OVERLAYS & CONTROLLERS */}
      
      {/* Wallet Modal */}
      <WalletModal visible={walletVisible} onClose={() => setWalletVisible(false)} />

      {/* SOS Emergency Overlay */}
      <SOSOverlay visible={sosVisible} onClose={() => setSosVisible(false)} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
