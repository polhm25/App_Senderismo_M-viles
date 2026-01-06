// src/helpers/location.ts
import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Coordenadas GPS
 */
export interface Coordenadas {
    latitud: number;
    longitud: number;
}

/**
 * Solicitar permisos de ubicación
 */
export const solicitarPermisoUbicacion = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permiso denegado',
                'Necesitamos acceso a tu ubicación para guardar el punto de inicio de la ruta',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error al solicitar permiso de ubicación:', error);
        return false;
    }
};

/**
 * Obtener ubicación actual
 */
export const obtenerUbicacionActual = async (): Promise<Coordenadas | null> => {
    try {
        // Solicitar permiso
        const tienePermiso = await solicitarPermisoUbicacion();
        if (!tienePermiso) return null;

        // Obtener ubicación (puede tardar unos segundos)
        Alert.alert(
            'Obteniendo ubicación...',
            'Por favor espera unos segundos',
            [{ text: 'OK' }]
        );

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High, // Alta precisión
        });

        return {
            latitud: location.coords.latitude,
            longitud: location.coords.longitude,
        };
    } catch (error) {
        console.error('Error al obtener ubicación:', error);
        Alert.alert(
            'Error',
            'No se pudo obtener tu ubicación. Asegúrate de tener el GPS activado.'
        );
        return null;
    }
};

/**
 * Formatear coordenadas para mostrar
 */
export const formatearCoordenadas = (lat: number, lon: number): string => {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
};

/**
 * Verificar si el GPS está activado
 */
export const verificarGPSActivado = async (): Promise<boolean> => {
    try {
        const enabled = await Location.hasServicesEnabledAsync();

        if (!enabled) {
            Alert.alert(
                'GPS Desactivado',
                'Por favor activa el GPS en la configuración de tu dispositivo',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error al verificar GPS:', error);
        return false;
    }
};