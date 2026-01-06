// Tarjeta que muestra una ruta en la lista
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ruta } from '../types';

interface PropiedadesTarjetaRuta {
    ruta: Ruta;
    onPress: () => void;
}

export default function RutaCard({ ruta, onPress }: PropiedadesTarjetaRuta) {
    // Convertir fecha de "2024-12-20" a "20 dic 2024"
    const convertirFechaATexto = (fechaISO: string): string => {
        const fecha = new Date(fechaISO + 'T00:00:00');
        return fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Obtener color según dificultad
    const obtenerColorDificultad = (dificultad: string) => {
        if (dificultad === 'Fácil') {
            return { backgroundColor: '#4CAF50' };
        } else if (dificultad === 'Moderada') {
            return { backgroundColor: '#FFC107' };
        } else if (dificultad === 'Difícil') {
            return { backgroundColor: '#FF9800' };
        } else if (dificultad === 'Muy Difícil') {
            return { backgroundColor: '#F44336' };
        }
        return { backgroundColor: '#757575' };
    };

    return (
        <TouchableOpacity style={estilos.tarjeta} onPress={onPress} activeOpacity={0.7}>
            {/* Imagen o icono si no hay imagen */}
            <View style={estilos.contenedorImagen}>
                {ruta.foto_principal ? (
                    <Image
                        source={{ uri: ruta.foto_principal }}
                        style={estilos.imagen}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={estilos.imagenVacia}>
                        <MaterialCommunityIcons name="image-outline" size={40} color="#CED4DA" />
                    </View>
                )}

                {/* Etiqueta de dificultad flotante */}
                <View style={[estilos.etiquetaDificultad, obtenerColorDificultad(ruta.dificultad)]}>
                    <Text style={estilos.textoDificultad}>{ruta.dificultad}</Text>
                </View>
            </View>

            {/* Contenido de la tarjeta */}
            <View style={estilos.contenido}>
                {/* Nombre de la ruta */}
                <Text style={estilos.nombre} numberOfLines={1}>
                    {ruta.nombre}
                </Text>

                {/* Zona con icono */}
                <View style={estilos.contenedorZona}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#6C757D" />
                    <Text style={estilos.zona} numberOfLines={1}>
                        {ruta.zona}
                    </Text>
                </View>

                {/* Información en fila */}
                <View style={estilos.filaInfo}>
                    {/* Distancia */}
                    <View style={estilos.itemInfo}>
                        <MaterialCommunityIcons name="map-marker-distance" size={18} color="#2D6A4F" />
                        <Text style={estilos.textoInfo}>{ruta.distancia_km} km</Text>
                    </View>

                    {/* Duración */}
                    <View style={estilos.itemInfo}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#2D6A4F" />
                        <Text style={estilos.textoInfo}>{ruta.duracion_horas} h</Text>
                    </View>

                    {/* Valoración (solo si existe) */}
                    {ruta.valoracion && (
                        <View style={estilos.itemInfo}>
                            <MaterialCommunityIcons name="star" size={18} color="#FFC107" />
                            <Text style={estilos.textoInfo}>{ruta.valoracion}/5</Text>
                        </View>
                    )}
                </View>

                {/* Fecha */}
                <View style={estilos.contenedorFecha}>
                    <MaterialCommunityIcons name="calendar" size={14} color="#ADB5BD" />
                    <Text style={estilos.textoFecha}>{convertirFechaATexto(ruta.fecha_realizacion)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const estilos = StyleSheet.create({
    tarjeta: {
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
    contenedorImagen: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    imagen: {
        width: '100%',
        height: '100%',
    },
    imagenVacia: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    etiquetaDificultad: {
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
    textoDificultad: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    contenido: {
        padding: 16,
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 6,
    },
    contenedorZona: {
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
    filaInfo: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    textoInfo: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    contenedorFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    textoFecha: {
        fontSize: 12,
        color: '#ADB5BD',
    },
});
