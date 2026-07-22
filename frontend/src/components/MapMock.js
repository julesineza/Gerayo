import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { COLORS } from '../theme/colors';

const KIGALI = { latitude: -1.9441, longitude: 30.0619 };

export default function MapMock({
  pickup,
  destination,
  driverLocation,
  phase = 'idle',
}) {
  const mapRef = useRef(null);

  const pickupCoord = pickup
    ? { latitude: pickup.latitude, longitude: pickup.longitude }
    : KIGALI;

  const destCoord = destination
    ? { latitude: destination.latitude, longitude: destination.longitude }
    : null;

  const driverCoord = driverLocation
    ? { latitude: driverLocation.latitude, longitude: driverLocation.longitude }
    : phase === 'enroute' && destCoord
      ? destCoord
      : phase === 'pickup' && pickupCoord
        ? pickupCoord
        : null;

  const showRoute = destCoord && phase !== 'idle';
  const showDriver = driverCoord && (phase === 'pickup' || phase === 'enroute' || phase === 'matching');

  useEffect(() => {
    if (!mapRef.current) return;

    const coords = [pickupCoord];
    if (destCoord) coords.push(destCoord);
    if (driverCoord) coords.push(driverCoord);

    if (coords.length > 1) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 60, bottom: 320, left: 60 },
        animated: true,
      });
    }
  }, [pickupCoord.latitude, pickupCoord.longitude, destCoord?.latitude, destCoord?.longitude, driverCoord?.latitude, driverCoord?.longitude]);

  const region = {
    latitude: destCoord
      ? (pickupCoord.latitude + destCoord.latitude) / 2
      : pickupCoord.latitude,
    longitude: destCoord
      ? (pickupCoord.longitude + destCoord.longitude) / 2
      : pickupCoord.longitude,
    latitudeDelta: destCoord
      ? Math.max(Math.abs(pickupCoord.latitude - destCoord.latitude) * 1.8, 0.04)
      : 0.05,
    longitudeDelta: destCoord
      ? Math.max(Math.abs(pickupCoord.longitude - destCoord.longitude) * 1.8, 0.04)
      : 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} mapType="none">
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        <Marker coordinate={pickupCoord} title="Pickup" description={pickup?.name || 'Your location'} pinColor={COLORS.secondary} />

        {destCoord && (
          <Marker coordinate={destCoord} title="Destination" description={destination?.name} pinColor={COLORS.primary} />
        )}

        {showDriver && driverCoord && (
          <Marker coordinate={driverCoord} title="Driver" description="Sober driver" pinColor="#007AFF" />
        )}

        {showRoute && destCoord && (
          <>
            <Polyline
              coordinates={[pickupCoord, destCoord]}
              strokeColor={phase === 'matching' ? COLORS.textSecondary : COLORS.secondary}
              strokeWidth={phase === 'matching' ? 2 : 3}
              lineDashPattern={phase === 'matching' ? [8, 6] : undefined}
            />
            {driverCoord && phase === 'enroute' && (
              <Polyline
                coordinates={[pickupCoord, driverCoord, destCoord]}
                strokeColor={COLORS.primary}
                strokeWidth={4}
              />
            )}
          </>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
});
