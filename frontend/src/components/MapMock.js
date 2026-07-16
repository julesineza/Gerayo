import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function MapMock({ rideState }) {
  // Animating the vehicle along a route path
  const driveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse effect for the location markers
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Handle driving animation based on rideState
  useEffect(() => {
    if (rideState === 'active' || rideState === 'driver_active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(driveAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: false, // coordinates translation is smoother with native layout measurements
          }),
          Animated.delay(1000),
          Animated.timing(driveAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      driveAnim.setValue(0);
    }
  }, [rideState, driveAnim]);

  // Interpolate coordinates for the vehicle movement
  const vehicleX = driveAnim.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [50, 120, 220, 290], // Road pathway positions
  });

  const vehicleY = driveAnim.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [180, 100, 100, 20],
  });

  // Pulse size interpolation
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <View style={styles.container}>
      {/* Background Grid Lines to make it look like a real navigation interface */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${i * 20}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${i * 20}%` }]} />
        ))}
      </View>

      {/* Styled Grid Roads */}
      <View style={styles.road1} />
      <View style={styles.road2} />

      {/* Origin/Passenger Pin */}
      <View style={[styles.markerContainer, { left: 50, top: 180 }]}>
        <Animated.View
          style={[
            styles.pulseCircle,
            { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />
        <View style={styles.passengerDot}>
          <Ionicons name="person" size={14} color={COLORS.white} />
        </View>
        <View style={styles.labelBubble}>
          <Text style={styles.labelText}>Your Location</Text>
        </View>
      </View>

      {/* Destination Pin */}
      <View style={[styles.markerContainer, { left: 290, top: 20 }]}>
        <View style={styles.destinationDot}>
          <MaterialCommunityIcons name="flag-checkered" size={16} color={COLORS.black} />
        </View>
        <View style={styles.labelBubble}>
          <Text style={styles.labelText}>Destination</Text>
        </View>
      </View>

      {/* Dotted Route Line connecting Origin and Destination */}
      <View style={styles.routeContainer}>
        {/* Draw a simulated route */}
        <SvgLineMock />
      </View>

      {/* Approaching Driver Vehicle Icon */}
      {(rideState === 'active' || rideState === 'driver_active' || rideState === 'matching') && (
        <Animated.View
          style={[
            styles.vehicleContainer,
            {
              left: rideState === 'matching' ? 80 : vehicleX,
              top: rideState === 'matching' ? 140 : vehicleY,
            },
          ]}
        >
          <View style={styles.vehicleOuter}>
            <MaterialCommunityIcons name="car-sports" size={20} color={COLORS.black} />
          </View>
          <View style={styles.driverTag}>
            <Text style={styles.driverTagText}>Sober Driver</Text>
          </View>
        </Animated.View>
      )}

      {/* GPS Compass HUD HUD HUD */}
      <View style={styles.hudOverlay}>
        <Ionicons name="compass-outline" size={24} color={COLORS.primary} />
        <Text style={styles.hudText}>GPS Connected • High Accuracy</Text>
      </View>
    </View>
  );
}

// Simple CSS representation of lines for our simulated road/routes without needing heavy SVG library
function SvgLineMock() {
  return (
    <View style={styles.svgContainer}>
      {/* Route Segment 1: from Passenger (50, 180) to Junction (120, 100) */}
      <View style={[styles.roadLineSegment, {
        width: 100,
        top: 140,
        left: 55,
        transform: [{ rotate: '-48deg' }],
      }]} />
      {/* Route Segment 2: from Junction (120, 100) to Junction 2 (220, 100) */}
      <View style={[styles.roadLineSegment, {
        width: 100,
        top: 100,
        left: 120,
        transform: [{ rotate: '0deg' }],
      }]} />
      {/* Route Segment 3: from Junction 2 (220, 100) to Destination (290, 20) */}
      <View style={[styles.roadLineSegment, {
        width: 100,
        top: 60,
        left: 215,
        transform: [{ rotate: '-48deg' }],
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.border,
  },
  road1: {
    position: 'absolute',
    left: 45,
    top: -10,
    width: 30,
    bottom: -10,
    backgroundColor: 'rgba(26, 47, 76, 0.3)',
    transform: [{ rotate: '-35deg' }],
  },
  road2: {
    position: 'absolute',
    left: -10,
    top: 100,
    right: -10,
    height: 30,
    backgroundColor: 'rgba(26, 47, 76, 0.3)',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pulseCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  passengerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 2,
  },
  destinationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 2,
  },
  labelBubble: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    zIndex: 3,
  },
  labelText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  vehicleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 50,
    zIndex: 10,
  },
  vehicleOuter: {
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  driverTag: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  driverTagText: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  hudOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 14, 23, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hudText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '600',
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  roadLineSegment: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 2,
    opacity: 0.8,
  },
});
