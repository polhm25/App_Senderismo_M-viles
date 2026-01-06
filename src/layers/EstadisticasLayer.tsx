// Pantalla que muestra estadísticas de todas las rutas
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

type PropiedadesPagina = NativeStackScreenProps<RootStackParamList, 'Stats'>;

// Componente para mostrar una tarjeta de estadística
function TarjetaEstadistica({ icono, valor, unidad, etiqueta, color }: {
    icono: string;
    valor: string;
    unidad: string;
    etiqueta: string;
    color: string;
}) {
    return (
        <View style={estilos.tarjeta}>
            <MaterialCommunityIcons name={icono as any} size={32} color={color} />
            <View style={estilos.contenidoTarjeta}>
                <View style={estilos.valorTarjeta}>
                    <Text style={estilos.numeroTarjeta}>{valor}</Text>
                    <Text style={estilos.unidadTarjeta}>{unidad}</Text>
                </View>
                <Text style={estilos.etiquetaTarjeta}>{etiqueta}</Text>
            </View>
        </View>
    );
}

export default function PantallaEstadisticas({ navigation }: PropiedadesPagina) {
    // Variables de estado
    const [datosEstadisticas, setDatosEstadisticas] = useState<Estadisticas | null>(null);
    const [estaCargando, setEstaCargando] = useState(true);

    // Cargar estadísticas cuando se abre la pantalla
    useEffect(() => {
        traerEstadisticasDeLaBase();
    }, []);

    // Traer estadísticas de la base de datos
    const traerEstadisticasDeLaBase = async () => {
        try {
            const estadisticas = await obtenerEstadisticas();
            setDatosEstadisticas(estadisticas);
            setEstaCargando(false);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            setEstaCargando(false);
        }
    };

    // Si está cargando, mostrar pantalla de carga
    if (estaCargando) {
        return (
            <View style={estilos.contenedorCentrado}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={estilos.textoCargando}>Cargando estadísticas...</Text>
            </View>
        );
    }

    // Si no hay estadísticas, mostrar mensaje vacío
    if (!datosEstadisticas || datosEstadisticas.totalRutas === 0) {
        return (
            <View style={estilos.contenedorCentrado}>
                <MaterialCommunityIcons name="chart-box-outline" size={80} color="#CED4DA" />
                <Text style={estilos.tituloVacio}>Sin estadísticas</Text>
                <Text style={estilos.mensajeVacio}>
                    Añade rutas para ver tus estadísticas
                </Text>
            </View>
        );
    }

    // Calcular promedios
    const promedioKilometrosPorRuta = datosEstadisticas.totalKm / datosEstadisticas.totalRutas;
    const promedioHorasPorRuta = datosEstadisticas.totalHoras / datosEstadisticas.totalRutas;

    // Pantalla con estadísticas
    return (
        <ScrollView style={estilos.contenedor}>
            {/* Encabezado */}
            <View style={estilos.cabecera}>
                <Text style={estilos.tituloCabecera}>Tus Estadísticas</Text>
                <Text style={estilos.subtituloCabecera}>
                    Basadas en {datosEstadisticas.totalRutas} {datosEstadisticas.totalRutas === 1 ? 'ruta' : 'rutas'}
                </Text>
            </View>

            {/* Tarjetas principales de estadísticas */}
            <View style={estilos.cuadriculaTarjetas}>
                <TarjetaEstadistica
                    icono="map-marker-distance"
                    valor={datosEstadisticas.totalKm.toFixed(1)}
                    unidad="km"
                    etiqueta="Distancia Total"
                    color="#2D6A4F"
                />
                <TarjetaEstadistica
                    icono="clock-outline"
                    valor={datosEstadisticas.totalHoras.toFixed(1)}
                    unidad="h"
                    etiqueta="Tiempo Total"
                    color="#52B788"
                />
                <TarjetaEstadistica
                    icono="hiking"
                    valor={datosEstadisticas.totalRutas.toString()}
                    unidad="rutas"
                    etiqueta="Completadas"
                    color="#D4A574"
                />
                <TarjetaEstadistica
                    icono="star"
                    valor={datosEstadisticas.valoracionMedia.toFixed(1)}
                    unidad="/ 5"
                    etiqueta="Valoración Media"
                    color="#FFC107"
                />
            </View>

            {/* Ruta más larga */}
            {datosEstadisticas.rutaMasLarga && (
                <View style={estilos.seccionDestacada}>
                    <View style={estilos.cabeceraSeccion}>
                        <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                        <Text style={estilos.tituloSeccion}>Ruta Más Larga</Text>
                    </View>
                    <TouchableOpacity
                        style={estilos.rutaDestacada}
                        onPress={() =>
                            navigation.navigate('Detail', { rutaId: datosEstadisticas.rutaMasLarga!.id! })
                        }
                    >
                        <View style={estilos.contenidoRutaDestacada}>
                            <Text style={estilos.nombreRutaDestacada}>
                                {datosEstadisticas.rutaMasLarga.nombre}
                            </Text>
                            <Text style={estilos.infoRutaDestacada}>
                                {datosEstadisticas.rutaMasLarga.zona} • {datosEstadisticas.rutaMasLarga.distancia_km} km
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#6C757D" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Ruta más difícil */}
            {datosEstadisticas.rutaMasDificil && (
                <View style={estilos.seccionDestacada}>
                    <View style={estilos.cabeceraSeccion}>
                        <MaterialCommunityIcons name="fire" size={24} color="#F44336" />
                        <Text style={estilos.tituloSeccion}>Ruta Más Difícil</Text>
                    </View>
                    <TouchableOpacity
                        style={estilos.rutaDestacada}
                        onPress={() =>
                            navigation.navigate('Detail', { rutaId: datosEstadisticas.rutaMasDificil!.id! })
                        }
                    >
                        <View style={estilos.contenidoRutaDestacada}>
                            <Text style={estilos.nombreRutaDestacada}>
                                {datosEstadisticas.rutaMasDificil.nombre}
                            </Text>
                            <View style={estilos.badgeRutaDestacada}>
                                <DifficultyBadge dificultad={datosEstadisticas.rutaMasDificil.dificultad} size="small" />
                                <Text style={estilos.infoRutaDestacada}>
                                    {datosEstadisticas.rutaMasDificil.zona}
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#6C757D" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Promedios */}
            <View style={estilos.seccion}>
                <Text style={estilos.tituloSeccion}>Promedios</Text>
                <View style={estilos.cuadriculaPromedios}>
                    <View style={estilos.itemPromedio}>
                        <Text style={estilos.valorPromedio}>
                            {promedioKilometrosPorRuta.toFixed(1)} km
                        </Text>
                        <Text style={estilos.etiquetaPromedio}>Por ruta</Text>
                    </View>
                    <View style={estilos.itemPromedio}>
                        <Text style={estilos.valorPromedio}>
                            {promedioHorasPorRuta.toFixed(1)} h
                        </Text>
                        <Text style={estilos.etiquetaPromedio}>Duración media</Text>
                    </View>
                </View>
            </View>

            {/* Espacio al final */}
            <View style={estilos.espacioFinal} />
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    contenedorCentrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    textoCargando: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
    },
    tituloVacio: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#495057',
        marginTop: 16,
        marginBottom: 8,
    },
    mensajeVacio: {
        fontSize: 16,
        color: '#6C757D',
        textAlign: 'center',
    },
    cabecera: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    tituloCabecera: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 4,
    },
    subtituloCabecera: {
        fontSize: 14,
        color: '#6C757D',
    },
    cuadriculaTarjetas: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    tarjeta: {
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
    contenidoTarjeta: {
        gap: 4,
    },
    valorTarjeta: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    numeroTarjeta: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212529',
    },
    unidadTarjeta: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    etiquetaTarjeta: {
        fontSize: 12,
        color: '#6C757D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    seccionDestacada: {
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
    cabeceraSeccion: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    tituloSeccion: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    rutaDestacada: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    contenidoRutaDestacada: {
        flex: 1,
        gap: 6,
    },
    nombreRutaDestacada: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    infoRutaDestacada: {
        fontSize: 14,
        color: '#6C757D',
    },
    badgeRutaDestacada: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    seccion: {
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
    cuadriculaPromedios: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 16,
    },
    itemPromedio: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    valorPromedio: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D6A4F',
        marginBottom: 4,
    },
    etiquetaPromedio: {
        fontSize: 12,
        color: '#6C757D',
        textAlign: 'center',
    },
    espacioFinal: {
        height: 40,
    },
});
