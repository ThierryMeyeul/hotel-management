import { useState, useCallback } from "react";
import { hotelService } from "../services/hotel.service";
import type { Hotel, NearbySearchParams } from "../types/hotel";

export const useHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const loadHotelsByCountry = useCallback(async (country: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await hotelService.getHotelsByCountry(country);
      
      setHotels(response);
      setMetadata({
        type: "by_country",
        country: country,
        count: response.length
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Erreur lors du chargement des hôtels pour ${country}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNearbyHotels = useCallback(
    async (params: NearbySearchParams) => {
      setLoading(true);
      setError(null);

      try {
        const response = await hotelService.getNearbyHotels(params);

        setHotels(response.results);
        setMetadata({
          type: "nearby",
          userLocation: response.user_location,
          radius: response.search_radius_km,
          count: response.count
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur lors de la recherche d'hôtels proches");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    hotels,
    loading,
    error,
    metadata,
    loadNearbyHotels,
    loadHotelsByCountry
  };
};
