// src/components/RutaCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ruta } from '../types';

interface RutaCardProps {
    ruta: Ruta;
    onPress: () => void;
}

export default function RutaCard({ ruta, onPress }: RutaCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Imagen o placeholder */}
            <View style={styles.imageContainer}>
                {ruta.foto_principal ? (
                    <Image
                        source={{ uri: ruta.foto_principal }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons name="image-outline" size={40} color="#CED4DA" />
                    </View>
                )}

                {/* Badge de dificultad flotante */}
                <View style={[styles.dificultadBadge, getDificultadColor(ruta.dificultad)]}>
                    <Text style={styles.dificultadText}>{ruta.dificultad}</Text>
                </View>
            </View>

            {/* Contenido */}
            <View style={styles.content}>
                {/* Título */}
                <Text style={styles.nombre} numberOfLines={1}>
                    {ruta.nombre}
                </Text>

                {/* Zona con icono */}
                <View style={styles.zonaContainer}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#6C757D" />
                    <Text style={styles.zona} numberOfLines={1}>
                        {ruta.zona}
                    </Text>
                </View>

                {/* Información en grid */}
                <View style={styles.infoGrid}>
                    {/* Distancia */}
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="map-marker-distance" size={18} color="#2D6A4F" />
                        <Text style={styles.infoText}>{ruta.distancia_km} km</Text>
                    </View>

                    {/* Duración */}
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#2D6A4F" />
                        <Text style={styles.infoText}>{ruta.duracion_horas} h</Text>
                    </View>

                    {/* Valoración */}
                    {ruta.valoracion && (
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="star" size={18} color="#FFC107" />
                            <Text style={styles.infoText}>{ruta.valoracion}/5</Text>
                        </View>
                    )}
                </View>

                {/* Fecha */}
                <View style={styles.fechaContainer}>
                    <MaterialCommunityIcons name="calendar" size={14} color="#ADB5BD" />
                    <Text style={styles.fechaText}>{formatearFecha(ruta.fecha_realizacion)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// Formatear fecha
function formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Color según dificultad
function getDificultadColor(dificultad: string) {
    switch (dificultad) {
        case 'Fácil':
            return { backgroundColor: '#4CAF50' };
        case 'Moderada':
            return { backgroundColor: '#FFC107' };
        case 'Difícil':
            return { backgroundColor: '#FF9800' };
        case 'Muy Difícil':
            return { backgroundColor: '#F44336' };
        default:
            return { backgroundColor: '#757575' };
    }
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    imageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dificultadBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    dificultadText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    content: {
        padding: 16,
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 6,
    },
    zonaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 4,
    },
    zona: {
        fontSize: 14,
        color: '#6C757D',
        flex: 1,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    fechaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    fechaText: {
        fontSize: 12,
        color: '#ADB5BD',
    },
});