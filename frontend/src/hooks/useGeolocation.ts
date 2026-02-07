import { useState, useCallback } from 'react';
import type { UserLocation, GeolocationError } from '../types/hotel';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  country?: string;
}

export const useGeolocation = () => {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [permission, setPermission] = useState<PermissionState | null>(null);
    const [country, setCountry] = useState<string | null>(null);

    const checkPermission = useCallback(async (): Promise<PermissionState | null> => {
        if (!navigator.permissions) {
            console.log('Permissions API non supportée');
            return null;
        }

        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            setPermission(status.state);
            status.onchange = () => setPermission(status.state);
            return status.state;
        } catch (err) {
            console.warn('Erreur lors de la vérification des permissions de géolocalisation:', err);
            return null;
        }
    }, []);

    const getCountryFromCoordinates = useCallback(async (latitude: number, longitude: number): Promise<string | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=5`
            );
            
            if (!response.ok) {
                console.warn('Impossible de récupérer le pays');
                return null;
            }
            
            const data = await response.json();
            return data.address?.country || null;
        } catch (err) {
            console.warn('Erreur lors de la récupération du pays:', err);
            return null;
        }
    }, []);

    const getCurrentPosition = useCallback(
        async (options?: PositionOptions): Promise<GeolocationData> => {
            return new Promise(async (resolve, reject) => {
                if (!navigator.geolocation) {
                    const geoError: GeolocationError = {
                        code: 0,
                        message: 'La géolocalisation n\'est pas supportée par ce navigateur.'
                    };
                    setError(geoError.message);
                    return reject(geoError);
                }
                
                setIsLoading(true);
                setError(null);

                const defaultOptions: PositionOptions = {
                    enableHighAccuracy: true, 
                    timeout: 20000,
                    maximumAge: 300000,
                }; 

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const userLocation: UserLocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        
                        // Récupérer le pays à partir des coordonnées
                        const userCountry = await getCountryFromCoordinates(
                            position.coords.latitude, 
                            position.coords.longitude
                        );
                        
                        setLocation(userLocation);
                        setCountry(userCountry);
                        setIsLoading(false);
                        
                        resolve({
                            ...userLocation,
                            country: userCountry || undefined
                        });
                    },
                    (error) => {
                        let errorMessage = 'Erreur de géolocalisation';

                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = "Permission de géolocalisation refusée";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = "Position indisponible";
                                break;
                            case error.TIMEOUT:
                                errorMessage = "Délai de géolocalisation dépassé";
                                break;
                        }

                        const geoError: GeolocationError = {
                            code: error.code,
                            message: errorMessage,
                        };

                        setError(errorMessage);
                        setIsLoading(false);
                        reject(geoError);
                    },
                    {  ...defaultOptions, ...options }
                );
            });
        },
        [getCountryFromCoordinates]
    );

    const watchPosition = useCallback(
        (callback: (location: GeolocationData) => void, options?: PositionOptions) => {
            if (!navigator.geolocation) {
                setError('Géolocalisation non supportée');
                return () => {};
            }

            const defaultOptions: PositionOptions = {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 30000,
            };

            const watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const userCountry = await getCountryFromCoordinates(
                        position.coords.latitude, 
                        position.coords.longitude
                    );
                    
                    const locationData: GeolocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        country: userCountry || undefined
                    };
                    
                    callback(locationData);
                },
                (error) => {
                    setError(`Erreur de suivi: ${error.message}`);
                },
                { ...defaultOptions, ...options }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        },
        [getCountryFromCoordinates]
    );
    
    const resetLocation = useCallback(() => {
        setLocation(null);
        setError(null);
        setCountry(null);
        setIsLoading(false);
    }, []);

    return {
        location,
        error, 
        isLoading,
        permission,
        country,  // Ajout du pays
        getCurrentPosition,
        watchPosition,
        checkPermission,
        resetLocation,
    };
};