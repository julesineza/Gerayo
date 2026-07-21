import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapMock from '../components/MapMock';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function PassengerHomeScreen({ openWallet, triggerSOS, activeState, setActiveState }) {
  const { user } = useAuth();
  
  // State for search query and booking variables
  const [destination, setDestination] = useState('');
  const [selectedDestText, setSelectedDestText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MTN Mobile Money');
  const [driverRating, setDriverRating] = useState(0);
  const [ratingCompleted, setRatingCompleted] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Load active trip on mount
  useEffect(() => {
    loadActiveTrip();
  }, []);

  const loadActiveTrip = async () => {
    try {
      const trip = await apiService.getActiveTrip();
      if (trip) {
        setActiveTrip(trip);
        // Set appropriate state based on trip status
        if (trip.status === 'REQUESTED') {
          setActiveState('matching');
        } else if (trip.status === 'ACCEPTED' || trip.status === 'STARTED') {
          setActiveState('active');
        } else if (trip.status === 'COMPLETED') {
          setActiveState('receipt');
        }
      }
    } catch (error) {
      console.error('Error loading active trip:', error);
    }
  };

  const selectRecent = (dest) => {
    setDestination(dest);
    setSelectedDestText(dest);
    setActiveState('booking');
  };

  const handleConfirmRide = async () => {
    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    setIsLoading(true);
    setActiveState('matching');

    try {
      // This would use real location data from GPS
      const tripData = {
        pickupName: 'Current Location',
        pickupLat: -1.9562, // Example Kigali coordinates
        pickupLng: 30.0592,
        destinationName: selectedDestText || destination,
        destinationLat: -1.9444, // Example destination
        destinationLng: 30.0615,
      };

      const response = await apiService.createTrip(tripData);
      setActiveTrip(response);
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
      setActiveState('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeTrip) return;

    setIsLoading(true);
    try {
      await apiService.completeTrip(activeTrip.id);
      setActiveState('receipt');
    } catch (error) {
      console.error('Error completing trip:', error);
      alert('Failed to complete trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishRating = async () => {
    if (!activeTrip || driverRating === 0) return;

    setIsLoading(true);
    try {
      await apiService.submitRating({
        tripId: activeTrip.id,
        score: driverRating,
      });
      
      setRatingCompleted(true);
      setTimeout(() => {
        setActiveState('home');
        setDestination('');
        setSelectedDestText('');
        setDriverRating(0);
        setRatingCompleted(false);
        setActiveTrip(null);
      }, 1500);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Map Component */}
      <View style={styles.mapContainer}>
        <MapMock rideState={activeState} />
      </View>

      {/* Top Floating Nav Bar (Hidden in matching/active SOS modes for clean navigation) */}
      {activeState !== 'matching' && activeState !== 'receipt' && (
        <View style={styles.topNavBar}>
          <View style={styles.navProfile}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Hello, {user?.fullName?.split(' ')[0] || 'User'}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>SafeSec Shield Active</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.walletShortcut} onPress={openWallet}>
            <Ionicons name="wallet" size={20} color={COLORS.primary} />
            <Text style={styles.walletShortcutText}>{walletBalance > 0 ? `$${walletBalance.toFixed(2)}` : '$0.00'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dynamic Floating SOS Shield */}
      {activeState !== 'receipt' && (
        <TouchableOpacity style={styles.floatingSOS} onPress={triggerSOS}>
          <Ionicons name="shield-checkmark" size={28} color={COLORS.white} />
          <Text style={styles.floatingSOSText}>SOS</Text>
        </TouchableOpacity>
      )}

      {/* Interactive Bottom Control Panel */}
      <View style={styles.bottomSheet}>
        {activeState === 'home' && (
          <View style={styles.sheetContent}>
            {/* Tagline */}
            <Text style={styles.sheetTitle}>Get Home in Your Own Car</Text>
            <Text style={styles.sheetSubtitle}>Verified professional driver dispatched to your spot</Text>

            {/* Tap 1: Large primary action */}
            <TouchableOpacity style={styles.primaryRequestBtn} onPress={() => selectRecent('Home (Nyarutarama)')}>
              <View style={styles.innerRequestBtn}>
                <MaterialCommunityIcons name="steering" size={28} color={COLORS.black} />
                <Text style={styles.primaryRequestText}>GET ME HOME SAFE</Text>
              </View>
              <Ionicons name="chevron-forward-circle" size={26} color={COLORS.black} />
            </TouchableOpacity>

            {/* Destination Search Box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Where to? (Enter destination)"
                placeholderTextColor={COLORS.textSecondary}
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  setSelectedDestText(text || 'Custom Location');
                  if (text.length > 0) setActiveState('booking');
                }}
                style={styles.searchInput}
              />
            </View>

            {/* Recents List - would be loaded from backend */}
            <Text style={styles.recentsTitle}>Recent Destinations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentsScroll}>
              <TouchableOpacity style={styles.recentItem} onPress={() => selectRecent('Home')}>
                <Ionicons name="home-outline" size={16} color={COLORS.primary} style={styles.recentIcon} />
                <Text style={styles.recentText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recentItem} onPress={() => selectRecent('Work')}>
                <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} style={styles.recentIcon} />
                <Text style={styles.recentText}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recentItem} onPress={() => selectRecent('Airport')}>
                <Ionicons name="airplane-outline" size={16} color={COLORS.primary} style={styles.recentIcon} />
                <Text style={styles.recentText}>Airport</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {activeState === 'booking' && (
          <View style={styles.sheetContent}>
            {/* Title / Back */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setActiveState('home')} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.sheetTitleCenter}>Confirm Sober Driver</Text>
              <View style={{ width: 30 }} />
            </View>

            {/* Location Summary card */}
            <View style={styles.routeSummaryCard}>
              <View style={styles.routePointRow}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.secondary }]} />
                <Text style={styles.routePointText} numberOfLines={1}>Current: Your Location</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePointRow}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.routePointText} numberOfLines={1}>To: {selectedDestText || destination}</Text>
              </View>
            </View>

            {/* Fare Breakdown & Details */}
            <View style={styles.detailsRow}>
              <View style={styles.detailCard}>
                <Ionicons name="time" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>DRIVER ETA</Text>
                <Text style={styles.detailValue}>Calculating...</Text>
              </View>
              <View style={styles.detailCard}>
                <Ionicons name="cash" size={18} color={COLORS.primary} />
                <Text style={styles.detailLabel}>FIXED FARE</Text>
                <Text style={styles.detailValue}>TBD</Text>
              </View>
            </View>

            {/* Payment Picker */}
            <TouchableOpacity style={styles.paymentPicker} onPress={openWallet}>
              <View style={styles.paymentLeft}>
                <Ionicons name="card" size={18} color={COLORS.primary} />
                <Text style={styles.paymentText}>{paymentMethod}</Text>
              </View>
              <Text style={styles.changePaymentText}>Change</Text>
            </TouchableOpacity>

            {/* Tap 3: Dispatch Driver */}
            <TouchableOpacity style={styles.confirmRideBtn} onPress={handleConfirmRide}>
              <Text style={styles.confirmRideText}>CONFIRM SOBER DRIVER</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeState === 'matching' && (
          <View style={[styles.sheetContent, { alignItems: 'center', paddingVertical: 30 }]}>
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 20 }} />
            <Text style={styles.matchingTitle}>DISPATCHING SOBER DRIVER</Text>
            <Text style={styles.matchingDesc}>
              Finding available drivers near your location. Please wait...
            </Text>
            <View style={styles.securitySeal}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
              <Text style={styles.securitySealText}>Secure Matching Guarantee</Text>
            </View>
            <TouchableOpacity 
              style={styles.cancelMatchingBtn} 
              onPress={() => {
                if (activeTrip) {
                  apiService.cancelTrip(activeTrip.id, 'User cancelled');
                }
                setActiveState('home');
                setActiveTrip(null);
              }}
            >
              <Text style={styles.cancelMatchingText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeState === 'active' && (
          <View style={styles.sheetContent}>
            {/* Active Header */}
            <View style={styles.activeHeader}>
              <View style={styles.safetyBeacon}>
                <View style={styles.pulseBeacon} />
                <Text style={styles.safetyBeaconText}>LIVE SECURITY FEED</Text>
              </View>
              <Text style={styles.etaText}>Arriving in 3m</Text>
            </View>

            {/* Driver Profile Card */}
            <View style={styles.driverProfileCard}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={24} color={COLORS.white} />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>
                  {activeTrip?.driver?.fullName || 'Driver Assigned'}
                </Text>
                <View style={styles.driverRatingRow}>
                  <Ionicons name="star" size={12} color={COLORS.primary} />
                  <Text style={styles.driverRatingText}>
                    {activeTrip?.driver?.rating ? `${activeTrip.driver.rating.toFixed(1)} Rating` : 'New Driver'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callDriverBtn}>
                <Ionicons name="call" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Vehicle Info */}
            <View style={styles.vehicleInfoCard}>
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleTitle}>YOUR VEHICLE TO BE DRIVEN</Text>
                <Text style={styles.vehicleDetailsText}>
                  {activeTrip?.vehicleInfo || 'Your vehicle'}
                </Text>
              </View>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>
                  {activeTrip?.plateNumber || 'TBD'}
                </Text>
              </View>
            </View>

            {/* Simulation trigger to complete ride */}
            <TouchableOpacity style={styles.simulateCompleteBtn} onPress={handleCompleteRide}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.black} style={{ marginRight: 6 }} />
              <Text style={styles.simulateCompleteText}>SIMULATE ARRIVED SAFE</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeState === 'receipt' && (
          <View style={[styles.sheetContent, { alignItems: 'center' }]}>
            <View style={styles.successRibbon}>
              <Ionicons name="checkmark-done-circle" size={54} color={COLORS.success} />
              <Text style={styles.successTitle}>WELCOME HOME SAFE!</Text>
              <Text style={styles.successSubtitle}>
                Ride completed on {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/* Receipt Summary */}
            <View style={styles.receiptSummary}>
              <Text style={styles.receiptHeader}>RECEIPT BREAKDOWN</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Base Safe Dispatched Fee</Text>
                <Text style={styles.receiptValue}>
                  ${activeTrip?.estimatedFare ? (activeTrip.estimatedFare * 0.6).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Distance Charge</Text>
                <Text style={styles.receiptValue}>
                  ${activeTrip?.estimatedFare ? (activeTrip.estimatedFare * 0.3).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Emergency SOS / SafeSec Levy</Text>
                <Text style={styles.receiptValue}>
                  ${activeTrip?.estimatedFare ? (activeTrip.estimatedFare * 0.1).toFixed(2) : '0.00'}
                </Text>
              </View>
              <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                <Text style={styles.totalLabel}>Total Charge (Auto-Paid)</Text>
                <Text style={styles.totalValue}>
                  ${activeTrip?.estimatedFare ? activeTrip.estimatedFare.toFixed(2) : '0.00'}
                </Text>
              </View>
              <Text style={styles.paymentSourceText}>Charged to {paymentMethod}</Text>
            </View>

            {/* Star Rating Feedback */}
            <Text style={styles.rateTitle}>Rate Your Driver</Text>
            {!ratingCompleted ? (
              <View style={styles.ratingForm}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setDriverRating(star)}>
                      <Ionicons
                        name={star <= driverRating ? 'star' : 'star-outline'}
                        size={28}
                        color={COLORS.primary}
                        style={{ marginHorizontal: 6 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.submitRatingBtn, driverRating === 0 && { opacity: 0.5 }]}
                  disabled={driverRating === 0}
                  onPress={handleFinishRating}
                >
                  <Text style={styles.submitRatingText}>Submit Rating</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.thankYouBox}>
                <Ionicons name="heart" size={24} color={COLORS.danger} />
                <Text style={styles.thankYouText}>Thank you for helping keep Kigali streets safe!</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    minHeight: 280,
  },
  topNavBar: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  navProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  profileAvatarText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 12,
  },
  welcomeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '700',
  },
  walletShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
  },
  walletShortcutText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  floatingSOS: {
    position: 'absolute',
    right: 15,
    bottom: 345, // sits above bottom sheet
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 90,
  },
  floatingSOSText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 16,
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 110,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 6,
    backgroundColor: COLORS.background,
    borderRadius: 15,
  },
  sheetTitleCenter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  primaryRequestBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    height: 62,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  innerRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryRequestText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.black,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  recentsTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recentsScroll: {
    flexDirection: 'row',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    height: 38,
  },
  recentIcon: {
    marginRight: 6,
  },
  recentText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  routeSummaryCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routePointText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 15,
    backgroundColor: COLORS.border,
    marginLeft: 3,
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    flex: 0.48,
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: 4,
  },
  paymentPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    height: 48,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  changePaymentText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmRideBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    height: 52,
  },
  confirmRideText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  matchingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 8,
  },
  matchingDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48,209,88,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 25,
  },
  securitySealText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  cancelMatchingBtn: {
    paddingVertical: 10,
  },
  cancelMatchingText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    fontSize: 13,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  safetyBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,69,58,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulseBeacon: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    marginRight: 6,
  },
  safetyBeaconText: {
    color: COLORS.danger,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  etaText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  driverProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    height: 68,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  driverRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  driverRatingText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: 4,
  },
  callDriverBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    height: 64,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  vehicleDetailsText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  plateBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  plateText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  simulateCompleteBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    height: 48,
  },
  simulateCompleteText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 13,
  },
  successRibbon: {
    alignItems: 'center',
    marginVertical: 15,
  },
  successTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.5,
    marginTop: 10,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  receiptSummary: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
  },
  receiptHeader: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  receiptLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  receiptValue: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  receiptTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  totalValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentSourceText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  rateTitle: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingForm: {
    alignItems: 'center',
    width: '100%',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  submitRatingBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    height: 42,
  },
  submitRatingText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 13,
  },
  thankYouBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,69,58,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  thankYouText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
});
