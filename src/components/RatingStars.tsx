// src/components/RatingStars.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RatingStarsProps {
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
}: RatingStarsProps) {
    const stars = [1, 2, 3, 4, 5];

    const handlePress = (star: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(star);
        }
    };

    return (
        <View style={styles.container}>
            {stars.map((star) => {
                const Component = readonly ? View : TouchableOpacity;

                return (
                    <Component
                        key={star}
                        onPress={() => handlePress(star)}
                        disabled={readonly}
                    >
                        <MaterialCommunityIcons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={size}
                            color="#FFC107"
                        />
                    </Component>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 4,
    },
});