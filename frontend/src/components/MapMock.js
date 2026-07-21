import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { COLORS } from "../theme/colors";

export default function MapMock({ rideState }) {
  // Static coordinates (Kigali, Rwanda default or sample coordinates)
  const origin = { latitude: -1.9441, longitude: 30.0619 };
  const destination = { latitude: -1.9536, longitude: 30.0926 };

  const driverCoordinate =
    rideState === "active" || rideState === "driver_active"
      ? destination
      : origin;

  const region = {
    latitude: (origin.latitude + destination.latitude) / 2,
    longitude: (origin.longitude + destination.longitude) / 2,
    latitudeDelta: Math.abs(origin.latitude - destination.latitude) + 0.03,
    longitudeDelta: Math.abs(origin.longitude - destination.longitude) + 0.03,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} mapType="none">
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        <Marker coordinate={origin} title="Your Location" description="Pickup Point" />
        <Marker coordinate={destination} title="Destination" pinColor="green" />
        {rideState !== "idle" && (
          <Marker coordinate={driverCoordinate} title="Sober Driver" pinColor="blue" />
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



