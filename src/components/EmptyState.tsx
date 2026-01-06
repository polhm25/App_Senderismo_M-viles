// Componente que muestra un mensaje cuando no hay datos
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PropiedadesEstadoVacio {
    icon: string;
    title: string;
    message: string;
}

export default function EmptyState({ icon, title, message }: PropiedadesEstadoVacio) {
    return (
        <View style={estilos.contenedor}>
            <MaterialCommunityIcons name={icon as any} size={80} color="#CED4DA" />
            <Text style={estilos.titulo}>{title}</Text>
            <Text style={estilos.mensaje}>{message}</Text>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#495057',
        marginTop: 16,
        marginBottom: 8,
    },
    mensaje: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 24,
    },
});
