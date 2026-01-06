// Pantalla que muestra los detalles completos de una ruta
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
import DifficultyBadge from '../components/DificultadBadge';
import RatingStars from '../components/RatingStars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ruta } from '../types';
import { obtenerRutaPorId, eliminarRuta } from '../database/db';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PropiedadesPagina = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function PantallaDetalle({ navigation, route }: PropiedadesPagina) {
    // Variables de estado
    const [datosDeRuta, setDatosDeRuta] = useState<Ruta | null>(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState<string | null>(null);

    // Sacar el ID de la ruta que queremos ver
    const idDeRuta = route.params.rutaId;

    // Cargar la ruta cuando se abre la pantalla
    useEffect(() => {
        traerRutaDeLaBase();
    }, [idDeRuta]);

    // Traer los datos de la ruta desde la base de datos
    const traerRutaDeLaBase = async () => {
        try {
            setEstaCargando(true);
            setMensajeError(null);

            const rutaEncontrada = await obtenerRutaPorId(idDeRuta);

            if (rutaEncontrada) {
                setDatosDeRuta(rutaEncontrada);
            } else {
                setMensajeError('No se encontró la ruta');
            }

            setEstaCargando(false);
        } catch (err) {
            console.error('Error al cargar ruta:', err);
            setMensajeError('Error al cargar la ruta');
            setEstaCargando(false);
        }
    };

    // Cuando el usuario presiona el botón de eliminar
    const cuandoSePresionaEliminar = () => {
        // Mostrar mensaje de confirmación
        Alert.alert(
            'Eliminar Ruta',
            `¿Estás seguro de que quieres eliminar "${datosDeRuta?.nombre}"?`,
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
                            // Eliminar de la base de datos
                            await eliminarRuta(idDeRuta);

                            // Mostrar mensaje de éxito
                            Alert.alert('Éxito', 'Ruta eliminada correctamente');

                            // Volver a la pantalla principal
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

    // Cuando el usuario presiona el botón de editar
    const cuandoSePresionaEditar = () => {
        navigation.navigate('AddEdit', { rutaId: idDeRuta });
    };

    // Convertir fecha de "2024-12-20" a "20 Dic 2024"
    const convertirFechaATexto = (fechaISO: string): string => {
        const nombresMeses = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const objetoFecha = new Date(fechaISO + 'T00:00:00');
        const numeroDia = objetoFecha.getDate();
        const nombreMes = nombresMeses[objetoFecha.getMonth()];
        const numeroAno = objetoFecha.getFullYear();

        return `${numeroDia} ${nombreMes} ${numeroAno}`;
    };

    // Si está cargando, mostrar pantalla de carga
    if (estaCargando) {
        return (
            <View style={estilos.contenedorCentrado}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={estilos.textoCargando}>Cargando ruta...</Text>
            </View>
        );
    }

    // Si hay error o no hay ruta, mostrar pantalla de error
    if (mensajeError || !datosDeRuta) {
        return (
            <View style={estilos.contenedorCentrado}>
                <MaterialCommunityIcons name="alert-circle" size={64} color="#D32F2F" />
                <Text style={estilos.textoError}>{mensajeError || 'Ruta no encontrada'}</Text>
                <TouchableOpacity
                    style={estilos.botonVolver}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={estilos.textoBotonVolver}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Pantalla con los detalles de la ruta
    return (
        <ScrollView style={estilos.contenedor}>
            {/* Foto de la ruta si existe */}
            {datosDeRuta.foto_principal ? (
                <Image
                    source={{ uri: datosDeRuta.foto_principal }}
                    style={estilos.foto}
                    resizeMode="cover"
                />
            ) : (
                <View style={estilos.contenedorSinFoto}>
                    <MaterialCommunityIcons name="image-off" size={48} color="#CED4DA" />
                    <Text style={estilos.textoSinFoto}>Sin foto</Text>
                </View>
            )}

            {/* Nombre y zona de la ruta */}
            <View style={estilos.cabecera}>
                <Text style={estilos.nombre}>{datosDeRuta.nombre}</Text>
                <View style={estilos.contenedorZona}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#6C757D" />
                    <Text style={estilos.textoZona}>{datosDeRuta.zona}</Text>
                </View>
            </View>

            {/* Etiqueta de dificultad */}
            <View style={estilos.seccion}>
                <DifficultyBadge dificultad={datosDeRuta.dificultad} />
            </View>

            {/* Información principal en cuadros */}
            <View style={estilos.cuadriculaInfo}>
                {/* Cuadro de Fecha */}
                <View style={estilos.cuadroInfo}>
                    <MaterialCommunityIcons name="calendar" size={28} color="#2D6A4F" />
                    <Text style={estilos.etiquetaCuadro}>FECHA</Text>
                    <Text style={estilos.valorCuadro}>
                        {convertirFechaATexto(datosDeRuta.fecha_realizacion)}
                    </Text>
                </View>

                {/* Cuadro de Distancia */}
                <View style={estilos.cuadroInfo}>
                    <MaterialCommunityIcons name="map-marker-distance" size={28} color="#2D6A4F" />
                    <Text style={estilos.etiquetaCuadro}>DISTANCIA</Text>
                    <Text style={estilos.valorCuadro}>{datosDeRuta.distancia_km} km</Text>
                </View>

                {/* Cuadro de Duración */}
                <View style={estilos.cuadroInfo}>
                    <MaterialCommunityIcons name="clock-outline" size={28} color="#2D6A4F" />
                    <Text style={estilos.etiquetaCuadro}>DURACIÓN</Text>
                    <Text style={estilos.valorCuadro}>{datosDeRuta.duracion_horas} h</Text>
                </View>

                {/* Cuadro de Desnivel (solo si existe) */}
                {datosDeRuta.desnivel_positivo && (
                    <View style={estilos.cuadroInfo}>
                        <MaterialCommunityIcons name="elevation-rise" size={28} color="#2D6A4F" />
                        <Text style={estilos.etiquetaCuadro}>DESNIVEL</Text>
                        <Text style={estilos.valorCuadro}>{datosDeRuta.desnivel_positivo} m</Text>
                    </View>
                )}
            </View>

            {/* Estrellas de valoración (solo si existe) */}
            {datosDeRuta.valoracion && (
                <View style={estilos.seccion}>
                    <RatingStars rating={datosDeRuta.valoracion} readonly size={36} />
                </View>
            )}

            {/* Notas (solo si existen) */}
            {datosDeRuta.notas && (
                <View style={estilos.seccion}>
                    <Text style={estilos.tituloSeccion}>Notas</Text>
                    <Text style={estilos.textoNotas}>{datosDeRuta.notas}</Text>
                </View>
            )}

            {/* Coordenadas GPS (solo si existen) */}
            {datosDeRuta.punto_inicio_lat && datosDeRuta.punto_inicio_lon && (
                <View style={estilos.seccion}>
                    <Text style={estilos.tituloSeccion}>Punto de Inicio</Text>
                    <Text style={estilos.textoCoordenadas}>
                        Lat: {datosDeRuta.punto_inicio_lat.toFixed(6)}
                    </Text>
                    <Text style={estilos.textoCoordenadas}>
                        Lon: {datosDeRuta.punto_inicio_lon.toFixed(6)}
                    </Text>
                </View>
            )}

            {/* Botones de acción */}
            <View style={estilos.contenedorBotones}>
                <TouchableOpacity
                    style={[estilos.boton, estilos.botonEditar]}
                    onPress={cuandoSePresionaEditar}
                >
                    <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
                    <Text style={estilos.textoBoton}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[estilos.boton, estilos.botonEliminar]}
                    onPress={cuandoSePresionaEliminar}
                >
                    <MaterialCommunityIcons name="delete" size={20} color="#FFFFFF" />
                    <Text style={estilos.textoBoton}>Eliminar</Text>
                </TouchableOpacity>
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
    textoError: {
        marginTop: 16,
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
    },
    botonVolver: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#2D6A4F',
        borderRadius: 8,
    },
    textoBotonVolver: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    foto: {
        width: '100%',
        height: 250,
    },
    cabecera: {
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
    contenedorZona: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    textoZona: {
        fontSize: 16,
        color: '#6C757D',
    },
    seccion: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    tituloSeccion: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    cuadriculaInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 10,
    },
    cuadroInfo: {
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
    etiquetaCuadro: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 8,
        textTransform: 'uppercase',
    },
    valorCuadro: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 4,
    },
    textoNotas: {
        fontSize: 16,
        color: '#495057',
        lineHeight: 24,
    },
    textoCoordenadas: {
        fontSize: 14,
        color: '#6C757D',
        fontFamily: 'monospace',
        marginVertical: 2,
    },
    contenedorBotones: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    boton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    botonEditar: {
        backgroundColor: '#2196F3',
    },
    botonEliminar: {
        backgroundColor: '#F44336',
    },
    textoBoton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    espacioFinal: {
        height: 40,
    },
    contenedorSinFoto: {
        width: '100%',
        height: 250,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoSinFoto: {
        marginTop: 8,
        fontSize: 16,
        color: '#6C757D',
    },
});
