// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ruta } from '../types';
import { obtenerTodasLasRutas } from '../database/db';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [rutas, setRutas] = useState<Ruta[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar rutas al abrir la pantalla
    useEffect(() => {
        cargarRutas();
    }, []);

    const cargarRutas = async () => {
        try {
            const rutasDB = await obtenerTodasLasRutas();
            setRutas(rutasDB);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar rutas:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando rutas...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Mis Rutas ({rutas.length})</Text>

            {rutas.map((ruta) => (
                <View key={ruta.id} style={styles.rutaItem}>
                    <Text style={styles.rutaNombre}>{ruta.nombre}</Text>
                    <Text style={styles.rutaInfo}>
                        {ruta.zona} • {ruta.distancia_km} km • {ruta.dificultad}
                    </Text>
                    <Button
                        title="Ver Detalle"
                        onPress={() => navigation.navigate('Detail', { rutaId: ruta.id! })}
                    />
                </View>
            ))}

            <View style={styles.buttonContainer}>
                <Button
                    title="+ Nueva Ruta"
                    onPress={() => navigation.navigate('AddEdit', {})}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    rutaItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rutaNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    rutaInfo: {
        fontSize: 14,
        color: '#6C757D',
        marginBottom: 8,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
});