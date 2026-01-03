// src/screens/DetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ navigation, route }: Props) {
    // Extraer el parámetro que nos pasaron
    const { rutaId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalle de Ruta</Text>
            <Text style={styles.subtitle}>Mostrando ruta con ID: {rutaId}</Text>

            {/* Botones para probar navegación */}
            <Button
                title="Editar esta Ruta"
                onPress={() => navigation.navigate('AddEdit', { rutaId })}
            />

            <Button
                title="Volver a Home"
                onPress={() => navigation.goBack()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F8F9FA',
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6C757D',
        marginBottom: 20,
    },
});