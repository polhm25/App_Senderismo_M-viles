// src/screens/AddEditScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEdit'>;

export default function AddEditScreen({ navigation, route }: Props) {
    // Si recibimos rutaId, estamos EDITANDO; si no, estamos CREANDO
    const rutaId = route.params?.rutaId;
    const isEditing = rutaId !== undefined;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isEditing ? `Editar Ruta ${rutaId}` : 'Crear Nueva Ruta'}
            </Text>
            <Text style={styles.subtitle}>
                Formulario aparecerá aquí
            </Text>

            <Button
                title="Guardar (simulado)"
                onPress={() => {
                    // Después de guardar, volvemos a Home
                    // navigation.goBack() también funciona
                    navigation.navigate('Home');
                }}
            />

            <Button
                title="Cancelar"
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