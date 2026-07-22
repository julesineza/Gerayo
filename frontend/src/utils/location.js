import * as Location from 'expo-location';

const KIGALI_DEFAULT = {
  latitude: -1.9441,
  longitude: 30.0619,
  name: 'Current Location',
};

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return KIGALI_DEFAULT;
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      name: 'Current Location',
    };
  } catch {
    return KIGALI_DEFAULT;
  }
}

export async function watchLocation(callback) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  return Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }
  );
}
