import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    icon: 'shield-checkmark',
    title: 'Premium Safety First',
    desc: 'Connecting you with professional, vetted, and verified sober drivers to drive you home in your own vehicle.',
    accent: COLORS.primary,
  },
  {
    icon: 'car-sport',
    title: 'Your Car, Safe Home',
    desc: 'No need to leave your car behind. Our drivers meet you where you are and drive your vehicle safely to your driveway.',
    accent: COLORS.secondary,
  },
  {
    icon: 'eye',
    title: '24/7 Security Shield',
    desc: 'Every trip is monitored in real-time by the Gerayo SafeSec command center, with a one-tap SOS button always active.',
    accent: COLORS.danger,
  },
];

export default function OnboardingScreen({ onAuthComplete }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoginState, setIsLoginState] = useState(true); // Toggle between Login and Sign Up
  const [selectedRole, setSelectedRole] = useState('passenger'); // 'passenger' or 'driver'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleNextSlide = () => {
    if (slideIndex < ONBOARDING_SLIDES.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setShowLogin(true);
    }
  };

  const handleSkip = () => {
    setShowLogin(true);
  };

  const handleAuthSubmit = () => {
    // Perform basic mock validation
    if (!email || !password || (!isLoginState && !fullName)) {
      alert('Please fill in all fields.');
      return;
    }
    // Simulate successful authentication
    onAuthComplete(selectedRole, { email, fullName: fullName || 'Premium User' });
  };

  if (!showLogin) {
    const currentSlide = ONBOARDING_SLIDES[slideIndex];
    return (
      <View style={styles.container}>
        {/* Top Header / Skip */}
        <View style={styles.onboardHeader}>
          <Text style={styles.logoText}>GERAYO</Text>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content slide */}
        <View style={styles.slideContent}>
          <View style={[styles.iconOuterCircle, { borderColor: currentSlide.accent }]}>
            <View style={[styles.iconInnerCircle, { backgroundColor: currentSlide.accent + '20' }]}>
              <Ionicons name={currentSlide.icon} size={64} color={currentSlide.accent} />
            </View>
          </View>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <Text style={styles.slideDesc}>{currentSlide.desc}</Text>
        </View>

        {/* Bottom Pagination & Button */}
        <View style={styles.onboardFooter}>
          <View style={styles.paginationDots}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  slideIndex === i ? styles.activeDot : null,
                  slideIndex === i && { backgroundColor: currentSlide.accent },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: currentSlide.accent }]}
            onPress={handleNextSlide}
          >
            <Text style={styles.nextBtnText}>
              {slideIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.black} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Login / Signup screen
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.logoTextBig}>GERAYO</Text>
        <Text style={styles.taglineText}>Sober Drivers • Elite Safety • Your Car</Text>

        {/* Tab Switcher for Login vs Sign Up */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLoginState && styles.activeTab]}
            onPress={() => setIsLoginState(true)}
          >
            <Text style={[styles.tabText, isLoginState && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLoginState && styles.activeTab]}
            onPress={() => setIsLoginState(false)}
          >
            <Text style={[styles.tabText, !isLoginState && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Role Selector Card */}
        <Text style={styles.inputLabel}>I want to use Gerayo as a:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'passenger' && styles.roleCardActivePassenger,
            ]}
            onPress={() => setSelectedRole('passenger')}
          >
            <Ionicons
              name="car-sport"
              size={24}
              color={selectedRole === 'passenger' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.roleCardText, selectedRole === 'passenger' && styles.roleCardTextActive]}>
              Passenger
            </Text>
            <Text style={styles.roleCardDesc}>I need a driver for my car</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'driver' && styles.roleCardActiveDriver,
            ]}
            onPress={() => setSelectedRole('driver')}
          >
            <MaterialCommunityIcons
              name="steering"
              size={24}
              color={selectedRole === 'driver' ? COLORS.secondary : COLORS.textSecondary}
            />
            <Text style={[styles.roleCardText, selectedRole === 'driver' && styles.roleCardTextActive]}>
              Sober Driver
            </Text>
            <Text style={styles.roleCardDesc}>I want to drive customers home</Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          {!isLoginState && (
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor={COLORS.textSecondary}
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={true}
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {isLoginState && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Submit Action */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: selectedRole === 'passenger' ? COLORS.primary : COLORS.secondary },
            ]}
            onPress={handleAuthSubmit}
          >
            <Text style={styles.submitBtnText}>
              {isLoginState ? 'Access Account' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Social Sign-in alternatives */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={20} color={COLORS.white} />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <FontAwesome name="google" size={18} color={COLORS.white} />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  onboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    width: '100%',
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  skipBtn: {
    padding: 6,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  iconOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderStyle: 'dashed',
  },
  iconInnerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  onboardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    width: '100%',
  },
  paginationDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginRight: 6,
  },
  activeDot: {
    width: 20,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    height: 48,
  },
  nextBtnText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoTextBig: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 6,
    marginTop: 10,
  },
  taglineText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.border,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.white,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 25,
  },
  roleCard: {
    flex: 0.48,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  roleCardActivePassenger: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,184,0,0.04)',
  },
  roleCardActiveDriver: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0,210,184,0.04)',
  },
  roleCardText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
  },
  roleCardTextActive: {
    color: COLORS.white,
  },
  roleCardDesc: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    paddingHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialBtn: {
    flex: 0.47,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
  },
  socialBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 10,
  },
});
