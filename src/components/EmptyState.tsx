// src/components/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon as any} size={80} color="#CED4DA" />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#495057',
        marginTop: 16,
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 24,
    },
});