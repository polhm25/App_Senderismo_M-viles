// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ruta } from '../types';
import { obtenerTodasLasRutas } from '../database/db';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RutaCard from '../components/RutaCard';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [rutas, setRutas] = useState<Ruta[]>([]);
    const [rutasFiltradas, setRutasFiltradas] = useState<Ruta[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cargar rutas al abrir la pantalla
    useEffect(() => {
        cargarRutas();
    }, []);

    // Refocus: recargar cuando vuelves a esta pantalla
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarRutas();
        });
        return unsubscribe;
    }, [navigation]);

    // Filtrar rutas cuando cambia la búsqueda
    useEffect(() => {
        filtrarRutas();
    }, [busqueda, rutas]);

    const cargarRutas = async () => {
        try {
            const rutasDB = await obtenerTodasLasRutas();
            setRutas(rutasDB);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error al cargar rutas:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filtrarRutas = () => {
        if (!busqueda.trim()) {
            setRutasFiltradas(rutas);
            return;
        }

        const busquedaLower = busqueda.toLowerCase();
        const filtradas = rutas.filter(
            (ruta) =>
                ruta.nombre.toLowerCase().includes(busquedaLower) ||
                ruta.zona.toLowerCase().includes(busquedaLower)
        );
        setRutasFiltradas(filtradas);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        cargarRutas();
    }, []);

    const handleCrearRuta = () => {
        navigation.navigate('AddEdit', {});
    };

    const handleVerDetalle = (rutaId: number) => {
        navigation.navigate('Detail', { rutaId });
    };

    const renderRutaCard = ({ item }: { item: Ruta }) => (
        <RutaCard ruta={item} onPress={() => handleVerDetalle(item.id!)} />
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Buscador */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#6C757D" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o zona..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                    placeholderTextColor="#ADB5BD"
                />
                {busqueda.length > 0 && (
                    <TouchableOpacity onPress={() => setBusqueda('')}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#6C757D" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Contador */}
            <Text style={styles.contador}>
                {rutasFiltradas.length} {rutasFiltradas.length === 1 ? 'ruta' : 'rutas'}
            </Text>
        </View>
    );

    const renderEmpty = () => {
        if (loading) return null;

        if (busqueda.trim() && rutasFiltradas.length === 0) {
            return (
                <EmptyState
                    icon="map-search"
                    title="Sin resultados"
                    message={`No se encontraron rutas con "${busqueda}"`}
                />
            );
        }

        return (
            <EmptyState
                icon="hiking"
                title="Sin rutas registradas"
                message="Pulsa el botón + para añadir tu primera ruta"
            />
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={styles.loadingText}>Cargando rutas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={rutasFiltradas}
                renderItem={renderRutaCard}
                keyExtractor={(item) => item.id!.toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={
                    rutasFiltradas.length === 0 ? styles.emptyList : styles.list
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#2D6A4F']}
                        tintColor="#2D6A4F"
                    />
                }
            />

            {/* FAB (Floating Action Button) */}
            <TouchableOpacity style={styles.fab} onPress={handleCrearRuta} activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Botones inferiores */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => navigation.navigate('Stats')}
                >
                    <MaterialCommunityIcons name="chart-bar" size={24} color="#2D6A4F" />
                    <Text style={styles.bottomButtonText}>Estadísticas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() => navigation.navigate('Map')}
                >
                    <MaterialCommunityIcons name="map" size={24} color="#2D6A4F" />
                    <Text style={styles.bottomButtonText}>Mapa</Text>
                </TouchableOpacity>
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
    },
    headerContainer: {
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#212529',
    },
    contador: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    list: {
        paddingBottom: 100,
    },
    emptyList: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2D6A4F',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    bottomButtonText: {
        fontSize: 14,
        color: '#2D6A4F',
        fontWeight: '600',
    },
});