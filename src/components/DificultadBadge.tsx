// Etiqueta que muestra la dificultad de una ruta con colores
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dificultad } from '../types';

interface PropiedadesEtiquetaDificultad {
    dificultad: Dificultad;
    size?: 'small' | 'medium' | 'large';
}

export default function DifficultyBadge({ dificultad, size = 'medium' }: PropiedadesEtiquetaDificultad) {
    // Obtener estilos según el tamaño
    const obtenerEstilosTamano = (tamano: 'small' | 'medium' | 'large') => {
        if (tamano === 'small') {
            return {
                container: { paddingHorizontal: 10, paddingVertical: 4 },
                text: { fontSize: 11 },
            };
        } else if (tamano === 'medium') {
            return {
                container: { paddingHorizontal: 16, paddingVertical: 8 },
                text: { fontSize: 14 },
            };
        } else {
            return {
                container: { paddingHorizontal: 20, paddingVertical: 10 },
                text: { fontSize: 16 },
            };
        }
    };

    // Obtener color según dificultad
    const obtenerColorDificultad = (dif: Dificultad) => {
        if (dif === 'Fácil') {
            return { backgroundColor: '#4CAF50' };
        } else if (dif === 'Moderada') {
            return { backgroundColor: '#FFC107' };
        } else if (dif === 'Difícil') {
            return { backgroundColor: '#FF9800' };
        } else if (dif === 'Muy Difícil') {
            return { backgroundColor: '#F44336' };
        }
        return { backgroundColor: '#757575' };
    };

    const estilosTamano = obtenerEstilosTamano(size);
    const estiloColor = obtenerColorDificultad(dificultad);

    return (
        <View style={[estilos.etiqueta, estiloColor, estilosTamano.container]}>
            <Text style={[estilos.texto, estilosTamano.text]}>{dificultad}</Text>
        </View>
    );
}

const estilos = StyleSheet.create({
    etiqueta: {
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    texto: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
