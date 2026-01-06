// src/helpers/camera.ts
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Solicitar permisos de cámara
 */
export const solicitarPermisoCamara = async (): Promise<boolean> => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permiso denegado',
                'Necesitamos acceso a la cámara para tomar fotos de tus rutas',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error al solicitar permiso de cámara:', error);
        return false;
    }
};

/**
 * Solicitar permisos de galería
 */
export const solicitarPermisoGaleria = async (): Promise<boolean> => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permiso denegado',
                'Necesitamos acceso a tus fotos para seleccionar imágenes',
                [{ text: 'OK' }]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error al solicitar permiso de galería:', error);
        return false;
    }
};

/**
 * Tomar foto con la cámara
 */
export const tomarFoto = async (): Promise<string | null> => {
    try {
        // Solicitar permiso
        const tienePermiso = await solicitarPermisoCamara();
        if (!tienePermiso) return null;

        // Abrir cámara
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9], // Aspecto horizontal para fotos de paisajes
            quality: 0.7, // Reducir calidad para no ocupar mucho espacio
        });

        // Si el usuario canceló
        if (result.canceled) {
            return null;
        }

        // Devolver URI de la foto
        return result.assets[0].uri;
    } catch (error) {
        console.error('Error al tomar foto:', error);
        Alert.alert('Error', 'No se pudo tomar la foto');
        return null;
    }
};

/**
 * Seleccionar foto de la galería
 */
export const seleccionarDeGaleria = async (): Promise<string | null> => {
    try {
        // Solicitar permiso
        const tienePermiso = await solicitarPermisoGaleria();
        if (!tienePermiso) return null;

        // Abrir galería
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        // Si el usuario canceló
        if (result.canceled) {
            return null;
        }

        // Devolver URI de la foto
        return result.assets[0].uri;
    } catch (error) {
        console.error('Error al seleccionar foto:', error);
        Alert.alert('Error', 'No se pudo seleccionar la foto');
        return null;
    }
};

/**
 * Mostrar opciones: Cámara o Galería
 */
export const mostrarOpcionesFoto = (): Promise<'camera' | 'gallery' | null> => {
    return new Promise((resolve) => {
        Alert.alert(
            'Añadir Foto',
            'Elige una opción',
            [
                {
                    text: 'Tomar Foto',
                    onPress: () => resolve('camera'),
                },
                {
                    text: 'Elegir de Galería',
                    onPress: () => resolve('gallery'),
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => resolve(null),
                },
            ]
        );
    });
};