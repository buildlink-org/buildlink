import { useState, useCallback } from 'react';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  name: string;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

interface UseLocationReturn {
  location: LocationState;
  requestLocation: () => Promise<void>;
  setManualLocation: (name: string) => void;
  clearLocation: () => void;
  setCustomCoords: (lat: number, lng: number, name: string) => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    name: '',
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        permissionDenied: false,
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try reverse geocoding for a readable name
        let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          if (data?.display_name) {
            locationName = data.display_name.split(', ').slice(0, 3).join(', ');
          }
        } catch {
          // Fallback to lat/lng
        }

        setLocation({
          lat: latitude,
          lng: longitude,
          name: locationName,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (error) => {
        const isDenied = error.code === error.PERMISSION_DENIED;
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: isDenied ? 'Location access denied. You can manually enter a location.' : error.message,
          permissionDenied: isDenied,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const setManualLocation = useCallback((name: string) => {
    setLocation(prev => ({
      ...prev,
      name,
      error: null,
      permissionDenied: false,
    }));
  }, []);

  const clearLocation = useCallback(() => {
    setLocation({
      lat: null,
      lng: null,
      name: '',
      loading: false,
      error: null,
      permissionDenied: false,
    });
  }, []);

  const setCustomCoords = useCallback((lat: number, lng: number, name: string) => {
    setLocation({
      lat,
      lng,
      name,
      loading: false,
      error: null,
      permissionDenied: false,
    });
  }, []);

  return {
    location,
    requestLocation,
    setManualLocation,
    clearLocation,
    setCustomCoords,
  };
}