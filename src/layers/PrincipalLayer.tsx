// Pantalla principal que muestra la lista de rutas
import React, { useEffect, useState } from 'react';
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

type PropiedadesPagina = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function PantallaPrincipal({ navigation }: PropiedadesPagina) {
    // Variables de estado
    const [todasLasRutas, setTodasLasRutas] = useState<Ruta[]>([]);
    const [rutasQueSeMuestran, setRutasQueSeMuestran] = useState<Ruta[]>([]);
    const [textoDeBusqueda, setTextoDeBusqueda] = useState('');
    const [estaCargando, setEstaCargando] = useState(true);
    const [estaRecargando, setEstaRecargando] = useState(false);

    // Cargar rutas cuando se abre la pantalla
    useEffect(() => {
        traerRutasDeLaBase();
    }, []);

    // Recargar rutas cuando volvemos a esta pantalla
    useEffect(() => {
        const quitar = navigation.addListener('focus', () => {
            traerRutasDeLaBase();
        });
        return quitar;
    }, [navigation]);

    // Buscar en la lista cuando el usuario escribe
    useEffect(() => {
        // Si no hay texto de búsqueda, mostrar todas
        if (textoDeBusqueda.trim() === '') {
            setRutasQueSeMuestran(todasLasRutas);
            return;
        }

        // Buscar en nombre y zona
        const textoBusquedaEnMinusculas = textoDeBusqueda.toLowerCase();
        const rutasEncontradas = [];

        for (let i = 0; i < todasLasRutas.length; i++) {
            const ruta = todasLasRutas[i];
            const nombreEnMinusculas = ruta.nombre.toLowerCase();
            const zonaEnMinusculas = ruta.zona.toLowerCase();

            if (nombreEnMinusculas.includes(textoBusquedaEnMinusculas) ||
                zonaEnMinusculas.includes(textoBusquedaEnMinusculas)) {
                rutasEncontradas.push(ruta);
            }
        }

        setRutasQueSeMuestran(rutasEncontradas);
    }, [textoDeBusqueda, todasLasRutas]);

    // Traer todas las rutas de la base de datos
    const traerRutasDeLaBase = async () => {
        try {
            const rutasDeLaBase = await obtenerTodasLasRutas();
            setTodasLasRutas(rutasDeLaBase);
            setEstaCargando(false);
            setEstaRecargando(false);
        } catch (error) {
            console.error('Error al cargar rutas:', error);
            setEstaCargando(false);
            setEstaRecargando(false);
        }
    };

    // Cuando el usuario arrastra hacia abajo para recargar
    const cuandoSeRecarga = () => {
        setEstaRecargando(true);
        traerRutasDeLaBase();
    };

    // Ir a la pantalla de crear una nueva ruta
    const irACrearRuta = () => {
        navigation.navigate('AddEdit', {});
    };

    // Ir a ver el detalle de una ruta
    const irAVerDetalle = (idDeLaRuta: number) => {
        navigation.navigate('Detail', { rutaId: idDeLaRuta });
    };

    // Limpiar el texto de búsqueda
    const borrarBusqueda = () => {
        setTextoDeBusqueda('');
    };

    // Si está cargando, mostrar pantalla de carga
    if (estaCargando) {
        return (
            <View style={estilos.contenedorCentrado}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={estilos.textoCargando}>Cargando rutas...</Text>
            </View>
        );
    }

    // Pantalla principal
    return (
        <View style={estilos.contenedor}>
            <FlatList
                data={rutasQueSeMuestran}
                renderItem={({ item }) => (
                    <RutaCard ruta={item} onPress={() => irAVerDetalle(item.id!)} />
                )}
                keyExtractor={(item) => item.id!.toString()}
                ListHeaderComponent={
                    <View style={estilos.contenedorCabecera}>
                        {/* Caja de búsqueda */}
                        <View style={estilos.contenedorBuscador}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#6C757D" />
                            <TextInput
                                style={estilos.campoBuscador}
                                placeholder="Buscar por nombre o zona..."
                                value={textoDeBusqueda}
                                onChangeText={setTextoDeBusqueda}
                                placeholderTextColor="#ADB5BD"
                            />
                            {textoDeBusqueda.length > 0 && (
                                <TouchableOpacity onPress={borrarBusqueda}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#6C757D" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Contador de rutas */}
                        <Text style={estilos.contador}>
                            {rutasQueSeMuestran.length} {rutasQueSeMuestran.length === 1 ? 'ruta' : 'rutas'}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    !estaCargando ? (
                        textoDeBusqueda.trim() && rutasQueSeMuestran.length === 0 ? (
                            <EmptyState
                                icon="map-search"
                                title="Sin resultados"
                                message={`No se encontraron rutas con "${textoDeBusqueda}"`}
                            />
                        ) : (
                            <EmptyState
                                icon="hiking"
                                title="Sin rutas registradas"
                                message="Pulsa el botón + para añadir tu primera ruta"
                            />
                        )
                    ) : null
                }
                contentContainerStyle={
                    rutasQueSeMuestran.length === 0 ? estilos.listaVacia : estilos.lista
                }
                refreshControl={
                    <RefreshControl
                        refreshing={estaRecargando}
                        onRefresh={cuandoSeRecarga}
                        colors={['#2D6A4F']}
                        tintColor="#2D6A4F"
                    />
                }
            />

            {/* Botón flotante para crear ruta */}
            <TouchableOpacity style={estilos.botonFlotante} onPress={irACrearRuta} activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Botones de abajo */}
            <View style={estilos.barraInferior}>
                <TouchableOpacity
                    style={estilos.botonInferior}
                    onPress={() => navigation.navigate('Stats')}
                >
                    <MaterialCommunityIcons name="chart-bar" size={24} color="#2D6A4F" />
                    <Text style={estilos.textoBotonInferior}>Estadísticas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={estilos.botonInferior}
                    onPress={() => navigation.navigate('Map')}
                >
                    <MaterialCommunityIcons name="map" size={24} color="#2D6A4F" />
                    <Text style={estilos.textoBotonInferior}>Mapa</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    },
    textoCargando: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
    },
    contenedorCabecera: {
        padding: 16,
        backgroundColor: '#F8F9FA',
    },
    contenedorBuscador: {
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
    campoBuscador: {
        flex: 1,
        fontSize: 16,
        color: '#212529',
    },
    contador: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    lista: {
        paddingBottom: 100,
    },
    listaVacia: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    botonFlotante: {
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
    barraInferior: {
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
    botonInferior: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    textoBotonInferior: {
        fontSize: 14,
        color: '#2D6A4F',
        fontWeight: '600',
    },
});
