// src/components/DifficultyBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dificultad } from '../types';

interface DifficultyBadgeProps {
    dificultad: Dificultad;
    size?: 'small' | 'medium' | 'large';
}

export default function DifficultyBadge({ dificultad, size = 'medium' }: DifficultyBadgeProps) {
    const sizeStyles = getSizeStyles(size);
    const colorStyle = getDificultadColor(dificultad);

    return (
        <View style={[styles.badge, colorStyle, sizeStyles.container]}>
            <Text style={[styles.text, sizeStyles.text]}>{dificultad}</Text>
        </View>
    );
}

function getDificultadColor(dificultad: Dificultad) {
    switch (dificultad) {
        case 'Fácil':
            return { backgroundColor: '#4CAF50' };
        case 'Moderada':
            return { backgroundColor: '#FFC107' };
        case 'Difícil':
            return { backgroundColor: '#FF9800' };
        case 'Muy Difícil':
            return { backgroundColor: '#F44336' };
    }
}

function getSizeStyles(size: 'small' | 'medium' | 'large') {
    switch (size) {
        case 'small':
            return {
                container: { paddingHorizontal: 10, paddingVertical: 4 },
                text: { fontSize: 11 },
            };
        case 'medium':
            return {
                container: { paddingHorizontal: 16, paddingVertical: 8 },
                text: { fontSize: 14 },
            };
        case 'large':
            return {
                container: { paddingHorizontal: 20, paddingVertical: 10 },
                text: { fontSize: 16 },
            };
    }
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});