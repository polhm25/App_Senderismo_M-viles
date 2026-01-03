// src/screens/DetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ruta } from '../types';
import { obtenerRutaPorId, eliminarRuta } from '../database/db';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ navigation, route }: Props) {
    // Estado para guardar la ruta cargada
    const [ruta, setRuta] = useState<Ruta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Extraer el rutaId de los parámetros de navegación
    const { rutaId } = route.params;

    // Cargar la ruta al abrir la pantalla
    useEffect(() => {
        cargarRuta();
    }, [rutaId]);

    // Función para cargar la ruta desde SQLite
    const cargarRuta = async () => {
        try {
            setLoading(true);
            setError(null);

            const rutaDB = await obtenerRutaPorId(rutaId);

            if (rutaDB) {
                setRuta(rutaDB);
            } else {
                setError('No se encontró la ruta');
            }

            setLoading(false);
        } catch (err) {
            console.error('Error al cargar ruta:', err);
            setError('Error al cargar la ruta');
            setLoading(false);
        }
    };

    // Función para eliminar la ruta
    const handleEliminar = () => {
        Alert.alert(
            'Eliminar Ruta',
            `¿Estás seguro de que quieres eliminar "${ruta?.nombre}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await eliminarRuta(rutaId);

                            // Mostrar confirmación
                            Alert.alert('Éxito', 'Ruta eliminada correctamente');

                            // Volver a Home
                            navigation.navigate('Home');
                        } catch (err) {
                            console.error('Error al eliminar:', err);
                            Alert.alert('Error', 'No se pudo eliminar la ruta');
                        }
                    },
                },
            ]
        );
    };

    // Función para ir a editar
    const handleEditar = () => {
        navigation.navigate('AddEdit', { rutaId });
    };

    // Pantalla de carga
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={styles.loadingText}>Cargando ruta...</Text>
            </View>
        );
    }

    // Pantalla de error
    if (error || !ruta) {
        return (
            <View style={styles.centerContainer}>
                <MaterialCommunityIcons name="alert-circle" size={64} color="#D32F2F" />
                <Text style={styles.errorText}>{error || 'Ruta no encontrada'}</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Renderizar la ruta
    return (
        <ScrollView style={styles.container}>
            {/* Foto principal (si existe) */}
            {ruta.foto_principal && (
                <Image
                    source={{ uri: ruta.foto_principal }}
                    style={styles.foto}
                    resizeMode="cover"
                />
            )}

            {/* Encabezado con nombre y zona */}
            <View style={styles.header}>
                <Text style={styles.nombre}>{ruta.nombre}</Text>
                <View style={styles.zonaContainer}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#6C757D" />
                    <Text style={styles.zona}>{ruta.zona}</Text>
                </View>
            </View>

            {/* Badge de dificultad */}
            <View style={styles.section}>
                <View style={[styles.dificultadBadge, getDificultadColor(ruta.dificultad)]}>
                    <Text style={styles.dificultadText}>{ruta.dificultad}</Text>
                </View>
            </View>

            {/* Información principal en grid */}
            <View style={styles.infoGrid}>
                <InfoCard
                    icon="calendar"
                    label="Fecha"
                    value={formatearFecha(ruta.fecha_realizacion)}
                />
                <InfoCard
                    icon="map-marker-distance"
                    label="Distancia"
                    value={`${ruta.distancia_km} km`}
                />
                <InfoCard
                    icon="clock-outline"
                    label="Duración"
                    value={`${ruta.duracion_horas} h`}
                />
                {ruta.desnivel_positivo && (
                    <InfoCard
                        icon="elevation-rise"
                        label="Desnivel"
                        value={`${ruta.desnivel_positivo} m`}
                    />
                )}
            </View>

            {/* Valoración (si existe) */}
            {ruta.valoracion && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Valoración</Text>
                    <View style={styles.valoracionContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <MaterialCommunityIcons
                                key={star}
                                name={star <= ruta.valoracion! ? 'star' : 'star-outline'}
                                size={32}
                                color="#FFC107"
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* Notas (si existen) */}
            {ruta.notas && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notas</Text>
                    <Text style={styles.notas}>{ruta.notas}</Text>
                </View>
            )}

            {/* Coordenadas GPS (si existen) */}
            {ruta.punto_inicio_lat && ruta.punto_inicio_lon && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Punto de Inicio</Text>
                    <Text style={styles.coordenadas}>
                        Lat: {ruta.punto_inicio_lat.toFixed(6)}
                    </Text>
                    <Text style={styles.coordenadas}>
                        Lon: {ruta.punto_inicio_lon.toFixed(6)}
                    </Text>
                </View>
            )}

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={handleEditar}
                >
                    <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleEliminar}
                >
                    <MaterialCommunityIcons name="delete" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>

            {/* Espaciado inferior */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

// ============================================
// COMPONENTE AUXILIAR: InfoCard
// ============================================
interface InfoCardProps {
    icon: string;
    label: string;
    value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
    return (
        <View style={styles.infoCard}>
            <MaterialCommunityIcons
                name={icon as any}
                size={28}
                color="#2D6A4F"
            />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Formatear fecha de "2024-12-20" a "20 Dic 2024"
function formatearFecha(fechaISO: string): string {
    const meses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const fecha = new Date(fechaISO + 'T00:00:00'); // Evitar problemas de zona horaria
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} ${mes} ${año}`;
}

// Obtener color según dificultad
function getDificultadColor(dificultad: string) {
    switch (dificultad) {
        case 'Fácil':
            return { backgroundColor: '#4CAF50' };
        case 'Moderada':
            return { backgroundColor: '#FFC107' };
        case 'Difícil':
            return { backgroundColor: '#FF9800' };
        case 'Muy Difícil':
            return { backgroundColor: '#F44336' };
        default:
            return { backgroundColor: '#757575' };
    }
}

// ============================================
// ESTILOS
// ============================================
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
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
    },
    backButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#2D6A4F',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    foto: {
        width: '100%',
        height: 250,
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    nombre: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 8,
    },
    zonaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    zona: {
        fontSize: 16,
        color: '#6C757D',
    },
    section: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    dificultadBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    dificultadText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 10,
    },
    infoCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 8,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 4,
    },
    valoracionContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    notas: {
        fontSize: 16,
        color: '#495057',
        lineHeight: 24,
    },
    coordenadas: {
        fontSize: 14,
        color: '#6C757D',
        fontFamily: 'monospace',
        marginVertical: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 40,
    },
});