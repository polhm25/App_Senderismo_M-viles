// Componente de estrellas para valorar una ruta
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PropiedadesEstrellas {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
}

export default function RatingStars({
    rating,
    onRatingChange,
    size = 32,
    readonly = false
}: PropiedadesEstrellas) {
    // Lista de 5 estrellas
    const estrellas = [1, 2, 3, 4, 5];

    // Cuando el usuario presiona una estrella
    const cuandoSePresionaEstrella = (numeroEstrella: number) => {
        // Solo funciona si no es de solo lectura y hay función para cambiar
        if (!readonly && onRatingChange) {
            onRatingChange(numeroEstrella);
        }
    };

    return (
        <View style={estilos.contenedor}>
            {estrellas.map((estrella) => {
                // Si es de solo lectura, usar View, sino TouchableOpacity
                const Componente = readonly ? View : TouchableOpacity;

                return (
                    <Componente
                        key={estrella}
                        onPress={() => cuandoSePresionaEstrella(estrella)}
                        disabled={readonly}
                    >
                        <MaterialCommunityIcons
                            name={estrella <= rating ? 'star' : 'star-outline'}
                            size={size}
                            color="#FFC107"
                        />
                    </Componente>
                );
            })}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flexDirection: 'row',
        gap: 4,
    },
});
