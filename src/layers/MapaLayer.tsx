// Pantalla del mapa (pendiente de implementar)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type PropiedadesPagina = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function PantallaMapa({ navigation }: PropiedadesPagina) {
    return (
        <View style={estilos.contenedor}>
            <Text style={estilos.titulo}>Mapa de Rutas</Text>
            <Text style={estilos.subtitulo}>Mapa con marcadores aparecerá aquí</Text>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 16,
        color: '#6C757D',
    },
});
