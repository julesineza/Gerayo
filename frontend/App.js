import React from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './src/theme/colors';

// Import Custom Components
import SOSOverlay from './src/components/SOSOverlay';

// Import Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import PassengerHomeScreen from './src/screens/PassengerHomeScreen';
import DriverDashboard from './src/screens/DriverDashboard';
import DriverRegistration from './src/screens/DriverRegistration';

// Import Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

function AppContent() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  
  // App Modes: 'passenger' or 'driver'
  const activeRole = user?.role?.toLowerCase() || 'passenger';

  // Sub-navigation flow states for the Passenger flow
  const [passengerState, setPassengerState] = React.useState('home');

  // Sub-navigation flow states for the Driver flow
  const [driverState, setDriverState] = React.useState('idle');

  // Global Overlay/Modal states
  const [sosVisible, setSosVisible] = React.useState(false);

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
      <OnboardingScreen onAuthComplete={() => {}} />
    );
  }

  // Show driver registration if driver has no profile or is awaiting approval
  if (activeRole === 'driver' && (!user.driverProfile || !user.driverProfile.isApproved)) {
    return (
      <DriverRegistration
        onComplete={logout}
        onCancel={logout}
        pendingApproval={Boolean(user.driverProfile && !user.driverProfile.isApproved)}
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
            triggerSOS={() => setSosVisible(true)}
            activeState={passengerState}
            setActiveState={setPassengerState}
          />
        ) : (
          <DriverDashboard
            triggerSOS={() => setSosVisible(true)}
            driverState={driverState}
            setDriverState={setDriverState}
          />
        )}
      </View>

      {/* GLOBAL OVERLAYS & CONTROLLERS */}
      
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
