import { useState, useCallback } from 'react';
import type { UserLocation, GeolocationError } from '../types/hotel';


export const useGeolocation = () => {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setisLoading] = useState<boolean>(false);
    const [permission, setPermission] = useState<PermissionState | null>(null);

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

    const getCurrentPosition = useCallback(
        (options?: PositionOptions): Promise<UserLocation> => {
            return new Promise(async (resolve, reject) => {
                if (!navigator.geolocation) {
                    const geoError: GeolocationError = {
                        code: 0,
                        message: 'La géolocalisation n\'est pas supportée par ce navigateur.'
                    };
                    setError(geoError.message);
                    return reject(geoError);
                }
                setisLoading(true)
                setError(null)

                const defaultOptions: PositionOptions = {
                    enableHighAccuracy: true, 
                    timeout: 20000,
                    maximumAge: 300000,
                }; 

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userLocation: UserLocation = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        setLocation(userLocation)
                        setisLoading(false)
                        resolve(userLocation)
                    },
                    (error) => {
                        let errorMessage = 'Erreur de géolocalisation';

                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = "Permission de géolocalisation refusée";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = "Position indisponible"
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
                        setisLoading(false)
                        reject(geoError);
                    },
                    {  ...defaultOptions, ...options }
                );
            });
        },
        []
    );

    const watchPosition = useCallback(
        (callback: (location: UserLocation) => void, options?: PositionOptions) => {
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
                (position) => {
                    const userLocation: UserLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    callback(userLocation);
                },
                (error) => {
                    setError(`Erreur de suivi: ${error.message}`);
                },
                { ...defaultOptions, ...options }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        },
        []
    );
    const resetLocation = useCallback(() => {
        setLocation(null);
        setError(null);
        setisLoading(false);
    }, []);

    return {
        location,
        error, 
        isLoading,
        permission, 
        getCurrentPosition,
        watchPosition,
        checkPermission,
        resetLocation,
    };
};