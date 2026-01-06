// src/screens/StatsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Estadisticas } from '../types';
import { obtenerEstadisticas } from '../database/db';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DifficultyBadge from '../components/DificultadBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

export default function StatsScreen({ navigation }: Props) {
    const [stats, setStats] = useState<Estadisticas | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            const estadisticas = await obtenerEstadisticas();
            setStats(estadisticas);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
        );
    }

    if (!stats || stats.totalRutas === 0) {
        return (
            <View style={styles.centerContainer}>
                <MaterialCommunityIcons name="chart-box-outline" size={80} color="#CED4DA" />
                <Text style={styles.emptyTitle}>Sin estadísticas</Text>
                <Text style={styles.emptyMessage}>
                    Añade rutas para ver tus estadísticas
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tus Estadísticas</Text>
                <Text style={styles.headerSubtitle}>
                    Basadas en {stats.totalRutas} {stats.totalRutas === 1 ? 'ruta' : 'rutas'}
                </Text>
            </View>

            {/* Cards principales */}
            <View style={styles.mainStatsGrid}>
                <StatCard
                    icon="map-marker-distance"
                    value={stats.totalKm.toFixed(1)}
                    unit="km"
                    label="Distancia Total"
                    color="#2D6A4F"
                />
                <StatCard
                    icon="clock-outline"
                    value={stats.totalHoras.toFixed(1)}
                    unit="h"
                    label="Tiempo Total"
                    color="#52B788"
                />
                <StatCard
                    icon="hiking"
                    value={stats.totalRutas.toString()}
                    unit="rutas"
                    label="Completadas"
                    color="#D4A574"
                />
                <StatCard
                    icon="star"
                    value={stats.valoracionMedia.toFixed(1)}
                    unit="/ 5"
                    label="Valoración Media"
                    color="#FFC107"
                />
            </View>

            {/* Ruta más larga */}
            {stats.rutaMasLarga && (
                <View style={styles.highlightSection}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                        <Text style={styles.sectionTitle}>Ruta Más Larga</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.rutaHighlight}
                        onPress={() =>
                            navigation.navigate('Detail', { rutaId: stats.rutaMasLarga!.id! })
                        }
                    >
                        <View style={styles.rutaHighlightContent}>
                            <Text style={styles.rutaHighlightName}>{stats.rutaMasLarga.nombre}</Text>
                            <Text style={styles.rutaHighlightInfo}>
                                {stats.rutaMasLarga.zona} • {stats.rutaMasLarga.distancia_km} km
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#6C757D" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Ruta más difícil */}
            {stats.rutaMasDificil && (
                <View style={styles.highlightSection}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="fire" size={24} color="#F44336" />
                        <Text style={styles.sectionTitle}>Ruta Más Difícil</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.rutaHighlight}
                        onPress={() =>
                            navigation.navigate('Detail', { rutaId: stats.rutaMasDificil!.id! })
                        }
                    >
                        <View style={styles.rutaHighlightContent}>
                            <Text style={styles.rutaHighlightName}>{stats.rutaMasDificil.nombre}</Text>
                            <View style={styles.rutaHighlightBadge}>
                                <DifficultyBadge dificultad={stats.rutaMasDificil.dificultad} size="small" />
                                <Text style={styles.rutaHighlightInfo}>
                                    {stats.rutaMasDificil.zona}
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#6C757D" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Promedios */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Promedios</Text>
                <View style={styles.averagesGrid}>
                    <View style={styles.averageItem}>
                        <Text style={styles.averageValue}>
                            {(stats.totalKm / stats.totalRutas).toFixed(1)} km
                        </Text>
                        <Text style={styles.averageLabel}>Por ruta</Text>
                    </View>
                    <View style={styles.averageItem}>
                        <Text style={styles.averageValue}>
                            {(stats.totalHoras / stats.totalRutas).toFixed(1)} h
                        </Text>
                        <Text style={styles.averageLabel}>Duración media</Text>
                    </View>
                </View>
            </View>

            {/* Espaciado inferior */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

// ============================================
// COMPONENTE: StatCard
// ============================================
interface StatCardProps {
    icon: string;
    value: string;
    unit: string;
    label: string;
    color: string;
}

function StatCard({ icon, value, unit, label, color }: StatCardProps) {
    return (
        <View style={styles.statCard}>
            <MaterialCommunityIcons name={icon as any} size={32} color={color} />
            <View style={styles.statCardContent}>
                <View style={styles.statCardValue}>
                    <Text style={styles.statCardNumber}>{value}</Text>
                    <Text style={styles.statCardUnit}>{unit}</Text>
                </View>
                <Text style={styles.statCardLabel}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#495057',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6C757D',
    },
    mainStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        gap: 12,
    },
    statCardContent: {
        gap: 4,
    },
    statCardValue: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    statCardNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212529',
    },
    statCardUnit: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    statCardLabel: {
        fontSize: 12,
        color: '#6C757D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    highlightSection: {
        backgroundColor: '#FFFFFF',
        margin: 12,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    rutaHighlight: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    rutaHighlightContent: {
        flex: 1,
        gap: 6,
    },
    rutaHighlightName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    rutaHighlightInfo: {
        fontSize: 14,
        color: '#6C757D',
    },
    rutaHighlightBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    section: {
        backgroundColor: '#FFFFFF',
        margin: 12,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    averagesGrid: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 16,
    },
    averageItem: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    averageValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D6A4F',
        marginBottom: 4,
    },
    averageLabel: {
        fontSize: 12,
        color: '#6C757D',
        textAlign: 'center',
    },
    bottomSpacer: {
        height: 40,
    },
});