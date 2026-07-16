import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapMock from '../components/MapMock';

export default function DriverDashboard({ openWallet, triggerSOS, driverState, setDriverState }) {
  const [isOnline, setIsOnline] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const [earnings, setEarnings] = useState(145.50);
  const [tripsCompleted, setTripsCompleted] = useState(6);
  const [hoursOnline, setHoursOnline] = useState(4.2);

  // Ticking countdown timer when a request is incoming
  useEffect(() => {
    let timer = null;
    if (driverState === 'incoming') {
      setCountdown(15);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setDriverState('idle'); // Auto dismiss
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [driverState]);

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    if (isOnline) {
      setDriverState('idle');
    }
  };

  const handleAcceptRequest = () => {
    try {
      Vibration.vibrate(100);
    } catch(e){}
    setDriverState('navigating_pickup');
  };

  const handleDeclineRequest = () => {
    setDriverState('idle');
  };

  // Progression of the driver workflow
  const handleWorkflowNext = () => {
    if (driverState === 'navigating_pickup') {
      setDriverState('navigating_destination');
    } else if (driverState === 'navigating_destination') {
      // Complete trip: update earnings
      setEarnings((prev) => prev + 20.00);
      setTripsCompleted((prev) => prev + 1);
      setDriverState('idle');
    }
  };

  return (
    <View style={styles.container}>
      {/* Map component representing navigation */}
      <View style={styles.mapContainer}>
        <MapMock rideState={driverState === 'navigating_destination' ? 'driver_active' : 'idle'} />
      </View>

      {/* Floating SOS button for driver security */}
      {driverState !== 'idle' && (
        <TouchableOpacity style={styles.floatingSOS} onPress={triggerSOS}>
          <Ionicons name="shield-checkmark" size={28} color={COLORS.white} />
          <Text style={styles.floatingSOSText}>SOS</Text>
        </TouchableOpacity>
      )}

      {/* Top HUD Stats (Hidden during active job navigation to focus on road) */}
      {driverState === 'idle' && (
        <View style={styles.topNavBar}>
          <View style={styles.navProfile}>
            <View style={[styles.profileAvatar, { backgroundColor: COLORS.secondary }]}>
              <MaterialCommunityIcons name="steering" size={16} color={COLORS.black} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Maurice (Sober Driver)</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={10} color={COLORS.primary} />
                <Text style={styles.ratingText}>4.9 Rating</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.walletShortcut} onPress={openWallet}>
            <Ionicons name="wallet" size={18} color={COLORS.secondary} />
            <Text style={styles.walletShortcutText}>${earnings.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Sheet Controller */}
      <View style={styles.bottomSheet}>
        {driverState === 'idle' ? (
          <View style={styles.sheetContent}>
            {/* Online Toggle Card */}
            <View style={[styles.onlineCard, isOnline ? styles.onlineCardGreen : styles.onlineCardGray]}>
              <View>
                <Text style={styles.onlineStatusTitle}>
                  {isOnline ? 'ONLINE & ACTIVE' : 'OFFLINE'}
                </Text>
                <Text style={styles.onlineStatusDesc}>
                  {isOnline ? 'Awaiting sober driver requests...' : 'Go online to receive jobs'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={toggleOnline}
                style={[styles.toggleSwitch, isOnline ? styles.switchOn : styles.switchOff]}
              >
                <View style={[styles.switchThumb, isOnline ? styles.thumbOn : styles.thumbOff]} />
              </TouchableOpacity>
            </View>

            {/* Earnings Log */}
            <Text style={styles.sectionTitle}>Shift Summary (Today)</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>EARNED TODAY</Text>
                <Text style={styles.statValue}>${earnings.toFixed(2)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>COMPLETED</Text>
                <Text style={styles.statValue}>{tripsCompleted} Rides</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ONLINE TIME</Text>
                <Text style={styles.statValue}>{hoursOnline} hrs</Text>
              </View>
            </View>

            {/* Simulation trigger to mock incoming request */}
            {isOnline && (
              <TouchableOpacity style={styles.simulateRequestBtn} onPress={() => setDriverState('incoming')}>
                <Ionicons name="flash-sharp" size={18} color={COLORS.black} style={{ marginRight: 6 }} />
                <Text style={styles.simulateRequestText}>SIMULATE INCOMING REQUEST</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : driverState === 'incoming' ? (
          /* Incoming Urgent Request Card Overlay */
          <View style={[styles.sheetContent, styles.incomingWrapper]}>
            <View style={styles.incomingHeader}>
              <View style={styles.urgencyBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.urgencyText}>HIGH URGENCY REQUEST</Text>
              </View>
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownSecs}>{countdown}s</Text>
              </View>
            </View>

            <Text style={styles.payoutAmount}>+ $20.00 Est. Payout</Text>
            <Text style={styles.jobDistance}>1.8 miles away • Client needs drive home</Text>

            {/* Address Summary */}
            <View style={styles.routeCard}>
              <View style={styles.routePoint}>
                <Ionicons name="location-sharp" size={16} color={COLORS.secondary} />
                <Text style={styles.routeText} numberOfLines={1}>Pickup: Cadillac Club, Kiyovu</Text>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routePoint}>
                <Ionicons name="flag-checkered" size={16} color={COLORS.primary} />
                <Text style={styles.routeText} numberOfLines={1}>Dropoff: Nyarutarama (Client's Home)</Text>
              </View>
            </View>

            <View style={styles.clientDetail}>
              <Text style={styles.clientLabel}>CLIENT VEHICLE TO BE DRIVEN:</Text>
              <Text style={styles.clientVehicle}>Toyota Land Cruiser Prado (KBX 123A)</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDeclineRequest}>
                <Text style={styles.declineBtnText}>DECLINE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptRequest}>
                <Text style={styles.acceptBtnText}>ACCEPT JOB</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Active Ride Navigation Workflow */
          <View style={styles.sheetContent}>
            <View style={styles.jobHeader}>
              <View style={styles.jobBadge}>
                <Ionicons name="navigate" size={12} color={COLORS.black} />
                <Text style={styles.jobBadgeText}>
                  {driverState === 'navigating_pickup' ? 'HEADING TO CLIENT' : 'DRIVING CLIENT HOME'}
                </Text>
              </View>
              <Text style={styles.jobDistanceRemaining}>
                {driverState === 'navigating_pickup' ? 'ETA: 6 min (1.8 mi)' : 'ETA: 12 min (4.5 mi)'}
              </Text>
            </View>

            {/* Client Profile Info */}
            <View style={styles.clientCard}>
              <View style={styles.clientAvatar}>
                <Ionicons name="person" size={20} color={COLORS.white} />
              </View>
              <View style={styles.clientDetails}>
                <Text style={styles.clientName}>John Doe</Text>
                <Text style={styles.clientSub}>Owner of Toyota Prado • 4.8⭐ Client</Text>
              </View>
              <View style={styles.clientActionRow}>
                <TouchableOpacity style={styles.clientSubAction}>
                  <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.clientSubAction}>
                  <Ionicons name="call" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Linear Process Button */}
            <TouchableOpacity style={styles.workflowBtn} onPress={handleWorkflowNext}>
              <Text style={styles.workflowBtnText}>
                {driverState === 'navigating_pickup' ? 'ARRIVED AT PICKUP LOCATION' : 'ARRIVED SAFELY (COMPLETE JOB)'}
              </Text>
              <Ionicons name="arrow-forward-circle" size={22} color={COLORS.black} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.abortBtn} onPress={() => setDriverState('idle')}>
              <Text style={styles.abortBtnText}>Abort / Cancel Ride</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  welcomeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginLeft: 4,
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
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  onlineCardGreen: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0,210,184,0.05)',
  },
  onlineCardGray: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  onlineStatusTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  onlineStatusDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  toggleSwitch: {
    width: 54,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: COLORS.secondary,
    alignItems: 'flex-end',
  },
  switchOff: {
    backgroundColor: COLORS.border,
    alignItems: 'flex-start',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  thumbOn: {
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  thumbOff: {},
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  simulateRequestBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    height: 48,
    marginTop: 10,
  },
  simulateRequestText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 13,
  },
  incomingWrapper: {
    paddingVertical: 10,
  },
  incomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,184,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  urgencyText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  countdownContainer: {
    backgroundColor: COLORS.danger,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownSecs: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  jobDistance: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  routeCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    color: COLORS.white,
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  routeConnector: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
    marginLeft: 7,
    marginVertical: 4,
  },
  clientDetail: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 25,
  },
  clientLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  clientVehicle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineBtn: {
    flex: 0.35,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  declineBtnText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  acceptBtn: {
    flex: 0.62,
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  acceptBtnText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jobBadgeText: {
    color: COLORS.black,
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
  },
  jobDistanceRemaining: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 20,
    height: 64,
  },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  clientSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  clientActionRow: {
    flexDirection: 'row',
  },
  clientSubAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  workflowBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    height: 52,
    marginBottom: 10,
  },
  workflowBtnText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  abortBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  abortBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
