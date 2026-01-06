// Pantalla de formulario para crear o editar una ruta
import { tomarFoto, seleccionarDeGaleria, mostrarOpcionesFoto } from '../helpers/camara';
import { obtenerUbicacionActual, formatearCoordenadas, verificarGPSActivado } from '../helpers/localizacion';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import RatingStars from '../components/RatingStars';
import DifficultyBadge from '../components/DificultadBadge';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Dificultad, RutaFormData, formDataToRuta, Ruta, rutaToFormData } from '../types';
import { obtenerRutaPorId, insertarRuta, actualizarRuta } from '../database/db';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type PropiedadesPagina = NativeStackScreenProps<RootStackParamList, 'AddEdit'>;

// Lista de opciones de dificultad
const OPCIONES_DIFICULTAD: Dificultad[] = ['Fácil', 'Moderada', 'Difícil', 'Muy Difícil'];

export default function PantallaFormulario({ navigation, route }: PropiedadesPagina) {
    // Sacar el ID de la ruta (si existe, estamos editando)
    const idDeRuta = route.params?.rutaId;
    const estamosEditando = idDeRuta !== undefined;

    // Datos del formulario
    const [datosFormulario, setDatosFormulario] = useState<RutaFormData>({
        nombre: '',
        zona: '',
        fecha_realizacion: new Date(),
        duracion_horas: '',
        distancia_km: '',
        dificultad: 'Moderada',
        desnivel_positivo: '',
        valoracion: 3,
        notas: '',
        foto_principal: undefined,
        punto_inicio_lat: undefined,
        punto_inicio_lon: undefined,
    });

    // Estado de la pantalla
    const [estaCargando, setEstaCargando] = useState(false);
    const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
    const [erroresDeValidacion, setErroresDeValidacion] = useState<{ [key: string]: string }>({});

    // Si estamos editando, cargar los datos de la ruta
    useEffect(() => {
        if (estamosEditando) {
            traerDatosParaEditar();
        }
    }, [idDeRuta]);

    // Traer datos de la ruta desde la base de datos para editar
    const traerDatosParaEditar = async () => {
        try {
            setEstaCargando(true);
            const rutaEncontrada = await obtenerRutaPorId(idDeRuta!);

            if (rutaEncontrada) {
                setDatosFormulario(rutaToFormData(rutaEncontrada));
            } else {
                Alert.alert('Error', 'No se encontró la ruta');
                navigation.goBack();
            }

            setEstaCargando(false);
        } catch (error) {
            console.error('Error al cargar ruta:', error);
            Alert.alert('Error', 'No se pudo cargar la ruta');
            setEstaCargando(false);
        }
    };

    // Cambiar un campo del formulario
    const cambiarCampo = (nombreCampo: keyof RutaFormData, valor: any) => {
        // Actualizar el valor
        const nuevosDatos = { ...datosFormulario };
        nuevosDatos[nombreCampo] = valor;
        setDatosFormulario(nuevosDatos);

        // Quitar el error de ese campo si existe
        if (erroresDeValidacion[nombreCampo]) {
            const nuevosErrores = { ...erroresDeValidacion };
            delete nuevosErrores[nombreCampo];
            setErroresDeValidacion(nuevosErrores);
        }
    };

    // Verificar que los campos obligatorios estén llenos
    const verificarFormulario = (): boolean => {
        const errores: { [key: string]: string } = {};

        // Verificar nombre
        if (datosFormulario.nombre.trim() === '') {
            errores.nombre = 'El nombre es obligatorio';
        }

        // Verificar zona
        if (datosFormulario.zona.trim() === '') {
            errores.zona = 'La zona es obligatoria';
        }

        // Verificar duración
        if (datosFormulario.duracion_horas === '') {
            errores.duracion_horas = 'Duración debe ser mayor a 0';
        } else {
            const numeroHoras = parseFloat(datosFormulario.duracion_horas);
            if (isNaN(numeroHoras) || numeroHoras <= 0) {
                errores.duracion_horas = 'Debe ser un número válido mayor a 0';
            }
        }

        // Verificar distancia
        if (datosFormulario.distancia_km === '') {
            errores.distancia_km = 'Distancia debe ser mayor a 0';
        } else {
            const numeroKilometros = parseFloat(datosFormulario.distancia_km);
            if (isNaN(numeroKilometros) || numeroKilometros <= 0) {
                errores.distancia_km = 'Debe ser un número válido mayor a 0';
            }
        }

        // Verificar desnivel (opcional, pero si está debe ser válido)
        if (datosFormulario.desnivel_positivo !== '') {
            const numeroMetros = parseInt(datosFormulario.desnivel_positivo);
            if (isNaN(numeroMetros)) {
                errores.desnivel_positivo = 'Debe ser un número entero';
            }
        }

        setErroresDeValidacion(errores);

        // Devolver true si no hay errores
        const hayErrores = Object.keys(errores).length > 0;
        return !hayErrores;
    };

    // Cuando el usuario quiere añadir una foto
    const cuandoSeAnadeFoto = async () => {
        try {
            // Preguntar si quiere cámara o galería
            const opcionElegida = await mostrarOpcionesFoto();

            // Si canceló, salir
            if (!opcionElegida) return;

            // Tomar foto o seleccionar de galería
            let rutaDeFoto: string | null = null;

            if (opcionElegida === 'camera') {
                rutaDeFoto = await tomarFoto();
            } else {
                rutaDeFoto = await seleccionarDeGaleria();
            }

            // Si se eligió una foto, guardarla en el formulario
            if (rutaDeFoto) {
                cambiarCampo('foto_principal', rutaDeFoto);
                Alert.alert('Éxito', 'Foto añadida correctamente');
            }
        } catch (error) {
            console.error('Error al añadir foto:', error);
            Alert.alert('Error', 'No se pudo añadir la foto');
        }
    };

    // Cuando el usuario quiere eliminar la foto
    const cuandoSeEliminaFoto = () => {
        Alert.alert(
            'Eliminar Foto',
            '¿Estás seguro de que quieres eliminar la foto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        cambiarCampo('foto_principal', undefined);
                        Alert.alert('Éxito', 'Foto eliminada');
                    },
                },
            ]
        );
    };

    // Cuando el usuario quiere capturar su ubicación GPS
    const cuandoSeCapturarUbicacion = async () => {
        try {
            // Pedir permisos de ubicación
            const permisosConcedidos = await verificarGPSActivado();
            if (!permisosConcedidos) return;

            // Obtener coordenadas actuales
            const posicion = await obtenerUbicacionActual();

            if (posicion) {
                cambiarCampo('punto_inicio_lat', posicion.latitud);
                cambiarCampo('punto_inicio_lon', posicion.longitud);

                Alert.alert(
                    'Ubicación Capturada',
                    `Coordenadas: ${formatearCoordenadas(posicion.latitud, posicion.longitud)}`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error al capturar ubicación:', error);
            Alert.alert('Error', 'No se pudo obtener la ubicación');
        }
    };

    // Cuando el usuario quiere eliminar la ubicación GPS
    const cuandoSeEliminaUbicacion = () => {
        cambiarCampo('punto_inicio_lat', undefined);
        cambiarCampo('punto_inicio_lon', undefined);
        Alert.alert('Éxito', 'Ubicación eliminada');
    };

    // Cuando el usuario presiona el botón de guardar
    const cuandoSePresionaGuardar = async () => {
        // Verificar que todos los campos estén bien
        const formularioValido = verificarFormulario();

        if (!formularioValido) {
            Alert.alert('Error', 'Por favor, completa todos los campos obligatorios');
            return;
        }

        try {
            setEstaCargando(true);

            // Convertir los datos del formulario a formato de base de datos
            const datosParaGuardar = formDataToRuta(datosFormulario);

            if (estamosEditando) {
                // Actualizar ruta existente
                await actualizarRuta(idDeRuta!, datosParaGuardar);
                Alert.alert('Éxito', 'Ruta actualizada correctamente');
            } else {
                // Crear nueva ruta
                await insertarRuta(datosParaGuardar);
                Alert.alert('Éxito', 'Ruta creada correctamente');
            }

            setEstaCargando(false);
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'No se pudo guardar la ruta');
            setEstaCargando(false);
        }
    };

    // Cuando el usuario elige una fecha
    const cuandoCambiaLaFecha = (evento: any, fechaElegida?: Date) => {
        // En iOS mantener el selector abierto
        setMostrarSelectorFecha(Platform.OS === 'ios');

        if (fechaElegida) {
            cambiarCampo('fecha_realizacion', fechaElegida);
        }
    };

    // Obtener el color según la dificultad
    const obtenerColorDificultad = (dificultad: Dificultad) => {
        if (dificultad === 'Fácil') {
            return { backgroundColor: '#4CAF50' };
        } else if (dificultad === 'Moderada') {
            return { backgroundColor: '#FFC107' };
        } else if (dificultad === 'Difícil') {
            return { backgroundColor: '#FF9800' };
        } else if (dificultad === 'Muy Difícil') {
            return { backgroundColor: '#F44336' };
        }
        return { backgroundColor: '#757575' };
    };

    // Si está cargando datos para editar, mostrar pantalla de carga
    if (estaCargando && estamosEditando) {
        return (
            <View style={estilos.contenedorCentrado}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={estilos.textoCargando}>Cargando ruta...</Text>
            </View>
        );
    }

    // Formulario principal
    return (
        <ScrollView style={estilos.contenedor}>
            {/* Título */}
            <View style={estilos.cabecera}>
                <Text style={estilos.titulo}>
                    {estamosEditando ? 'Editar Ruta' : 'Nueva Ruta'}
                </Text>
            </View>

            {/* CAMPO: Nombre de la ruta */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>
                    Nombre de la ruta <Text style={estilos.obligatorio}>*</Text>
                </Text>
                <TextInput
                    style={[estilos.campo, erroresDeValidacion.nombre && estilos.campoConError]}
                    placeholder="Ej: Vereda de la Estrella"
                    value={datosFormulario.nombre}
                    onChangeText={(texto) => cambiarCampo('nombre', texto)}
                />
                {erroresDeValidacion.nombre && (
                    <Text style={estilos.textoError}>{erroresDeValidacion.nombre}</Text>
                )}
            </View>

            {/* CAMPO: Zona */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>
                    Zona <Text style={estilos.obligatorio}>*</Text>
                </Text>
                <TextInput
                    style={[estilos.campo, erroresDeValidacion.zona && estilos.campoConError]}
                    placeholder="Ej: Sierra Nevada"
                    value={datosFormulario.zona}
                    onChangeText={(texto) => cambiarCampo('zona', texto)}
                />
                {erroresDeValidacion.zona && (
                    <Text style={estilos.textoError}>{erroresDeValidacion.zona}</Text>
                )}
            </View>

            {/* CAMPO: Fecha */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>
                    Fecha de realización <Text style={estilos.obligatorio}>*</Text>
                </Text>
                <TouchableOpacity
                    style={estilos.botonFecha}
                    onPress={() => setMostrarSelectorFecha(true)}
                >
                    <MaterialCommunityIcons name="calendar" size={20} color="#6C757D" />
                    <Text style={estilos.textoBotonFecha}>
                        {datosFormulario.fecha_realizacion.toLocaleDateString('es-ES')}
                    </Text>
                </TouchableOpacity>

                {mostrarSelectorFecha && (
                    <DateTimePicker
                        value={datosFormulario.fecha_realizacion}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={cuandoCambiaLaFecha}
                        maximumDate={new Date()}
                    />
                )}
            </View>

            {/* CAMPO: Duración */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>
                    Duración (horas) <Text style={estilos.obligatorio}>*</Text>
                </Text>
                <TextInput
                    style={[estilos.campo, erroresDeValidacion.duracion_horas && estilos.campoConError]}
                    placeholder="Ej: 3.5"
                    keyboardType="decimal-pad"
                    value={datosFormulario.duracion_horas}
                    onChangeText={(texto) => cambiarCampo('duracion_horas', texto)}
                />
                {erroresDeValidacion.duracion_horas && (
                    <Text style={estilos.textoError}>{erroresDeValidacion.duracion_horas}</Text>
                )}
            </View>

            {/* CAMPO: Distancia */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>
                    Distancia (km) <Text style={estilos.obligatorio}>*</Text>
                </Text>
                <TextInput
                    style={[estilos.campo, erroresDeValidacion.distancia_km && estilos.campoConError]}
                    placeholder="Ej: 12.5"
                    keyboardType="decimal-pad"
                    value={datosFormulario.distancia_km}
                    onChangeText={(texto) => cambiarCampo('distancia_km', texto)}
                />
                {erroresDeValidacion.distancia_km && (
                    <Text style={estilos.textoError}>{erroresDeValidacion.distancia_km}</Text>
                )}
            </View>

            {/* CAMPO: Dificultad */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>
                    Dificultad <Text style={estilos.obligatorio}>*</Text>
                </Text>
                <View style={estilos.contenedorDificultad}>
                    {OPCIONES_DIFICULTAD.map((opcion) => {
                        const estaSeleccionada = datosFormulario.dificultad === opcion;

                        return (
                            <TouchableOpacity
                                key={opcion}
                                style={[
                                    estilos.botonDificultad,
                                    estaSeleccionada && estilos.botonDificultadActivo,
                                    estaSeleccionada && obtenerColorDificultad(opcion),
                                ]}
                                onPress={() => cambiarCampo('dificultad', opcion)}
                            >
                                <Text
                                    style={[
                                        estilos.textoBotonDificultad,
                                        estaSeleccionada && estilos.textoBotonDificultadActivo,
                                    ]}
                                >
                                    {opcion}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* CAMPO: Desnivel (opcional) */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>Desnivel positivo (m)</Text>
                <TextInput
                    style={[estilos.campo, erroresDeValidacion.desnivel_positivo && estilos.campoConError]}
                    placeholder="Ej: 450"
                    keyboardType="number-pad"
                    value={datosFormulario.desnivel_positivo}
                    onChangeText={(texto) => cambiarCampo('desnivel_positivo', texto)}
                />
                {erroresDeValidacion.desnivel_positivo && (
                    <Text style={estilos.textoError}>{erroresDeValidacion.desnivel_positivo}</Text>
                )}
            </View>

            {/* CAMPO: Valoración */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>Valoración</Text>
                <RatingStars
                    rating={datosFormulario.valoracion}
                    onRatingChange={(nuevaValoracion) => cambiarCampo('valoracion', nuevaValoracion)}
                    size={40}
                />
                <Text style={estilos.textoValoracion}>
                    {datosFormulario.valoracion} {datosFormulario.valoracion === 1 ? 'estrella' : 'estrellas'}
                </Text>
            </View>

            {/* CAMPO: Notas (opcional) */}
            <View style={estilos.grupoCampo}>
                <Text style={estilos.etiqueta}>Notas</Text>
                <TextInput
                    style={[estilos.campo, estilos.areaTexto]}
                    placeholder="Comentarios sobre la ruta..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={datosFormulario.notas}
                    onChangeText={(texto) => cambiarCampo('notas', texto)}
                />
            </View>

            {/* SECCIÓN: FOTO */}
            <View style={estilos.contenedorExtras}>
                <Text style={estilos.tituloExtras}>Foto de la Ruta</Text>

                {datosFormulario.foto_principal ? (
                    // Mostrar foto que ya está seleccionada
                    <View style={estilos.contenedorFoto}>
                        <Image
                            source={{ uri: datosFormulario.foto_principal }}
                            style={estilos.vistaPrevia}
                            resizeMode="cover"
                        />
                        <View style={estilos.botonesFoto}>
                            <TouchableOpacity
                                style={estilos.botonAccionFoto}
                                onPress={cuandoSeAnadeFoto}
                            >
                                <MaterialCommunityIcons name="camera-flip" size={20} color="#2196F3" />
                                <Text style={estilos.textoAccionFoto}>Cambiar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={estilos.botonAccionFoto}
                                onPress={cuandoSeEliminaFoto}
                            >
                                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                                <Text style={[estilos.textoAccionFoto, { color: '#F44336' }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Botón para añadir foto
                    <TouchableOpacity
                        style={estilos.botonExtra}
                        onPress={cuandoSeAnadeFoto}
                    >
                        <MaterialCommunityIcons name="camera" size={24} color="#2D6A4F" />
                        <Text style={estilos.textoBotonExtra}>Añadir Foto</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#6C757D" />
                    </TouchableOpacity>
                )}
            </View>

            {/* SECCIÓN: GPS */}
            <View style={estilos.contenedorExtras}>
                <Text style={estilos.tituloExtras}>Punto de Inicio (GPS)</Text>

                {datosFormulario.punto_inicio_lat && datosFormulario.punto_inicio_lon ? (
                    // Mostrar coordenadas que ya están capturadas
                    <View style={estilos.contenedorGPS}>
                        <View style={estilos.infoGPS}>
                            <MaterialCommunityIcons name="map-marker" size={24} color="#2D6A4F" />
                            <View style={estilos.coordenadasGPS}>
                                <Text style={estilos.etiquetaGPS}>Latitud:</Text>
                                <Text style={estilos.valorGPS}>
                                    {datosFormulario.punto_inicio_lat.toFixed(6)}
                                </Text>
                                <Text style={estilos.etiquetaGPS}>Longitud:</Text>
                                <Text style={estilos.valorGPS}>
                                    {datosFormulario.punto_inicio_lon.toFixed(6)}
                                </Text>
                            </View>
                        </View>

                        <View style={estilos.botonesGPS}>
                            <TouchableOpacity
                                style={estilos.botonAccionGPS}
                                onPress={cuandoSeCapturarUbicacion}
                            >
                                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#2196F3" />
                                <Text style={estilos.textoAccionGPS}>Recapturar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={estilos.botonAccionGPS}
                                onPress={cuandoSeEliminaUbicacion}
                            >
                                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                                <Text style={[estilos.textoAccionGPS, { color: '#F44336' }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Botón para capturar ubicación
                    <TouchableOpacity
                        style={estilos.botonExtra}
                        onPress={cuandoSeCapturarUbicacion}
                    >
                        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#2D6A4F" />
                        <Text style={estilos.textoBotonExtra}>Capturar Ubicación Actual</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#6C757D" />
                    </TouchableOpacity>
                )}
            </View>

            {/* BOTONES DE ACCIÓN */}
            <View style={estilos.contenedorBotones}>
                <TouchableOpacity
                    style={[estilos.boton, estilos.botonCancelar]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[estilos.boton, estilos.botonGuardar]}
                    onPress={cuandoSePresionaGuardar}
                    disabled={estaCargando}
                >
                    {estaCargando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={estilos.textoBotonGuardar}>
                            {estamosEditando ? 'Guardar Cambios' : 'Crear Ruta'}
                        </Text>
                    )}
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
    },
    textoCargando: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
    },
    cabecera: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
    },
    grupoCampo: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    etiqueta: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    obligatorio: {
        color: '#F44336',
    },
    campo: {
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#212529',
        backgroundColor: '#FFFFFF',
    },
    campoConError: {
        borderColor: '#F44336',
    },
    textoError: {
        color: '#F44336',
        fontSize: 14,
        marginTop: 4,
    },
    areaTexto: {
        height: 100,
        paddingTop: 12,
    },
    botonFecha: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        padding: 12,
        gap: 12,
    },
    textoBotonFecha: {
        fontSize: 16,
        color: '#212529',
    },
    contenedorDificultad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    botonDificultad: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CED4DA',
        backgroundColor: '#FFFFFF',
    },
    botonDificultadActivo: {
        borderColor: 'transparent',
    },
    textoBotonDificultad: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    textoBotonDificultadActivo: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    textoValoracion: {
        fontSize: 14,
        color: '#6C757D',
    },
    contenedorExtras: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    tituloExtras: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 12,
    },
    botonExtra: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 8,
        marginBottom: 12,
        gap: 12,
    },
    contenedorBotones: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    boton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botonCancelar: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CED4DA',
    },
    textoBotonCancelar: {
        color: '#6C757D',
        fontSize: 16,
        fontWeight: '600',
    },
    botonGuardar: {
        backgroundColor: '#2D6A4F',
    },
    textoBotonGuardar: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    espacioFinal: {
        height: 40,
    },
    textoBotonExtra: {
        flex: 1,
        fontSize: 16,
        color: '#212529',
        fontWeight: '500',
    },
    contenedorFoto: {
        gap: 12,
    },
    vistaPrevia: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#E9ECEF',
    },
    botonesFoto: {
        flexDirection: 'row',
        gap: 12,
    },
    botonAccionFoto: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 8,
        gap: 8,
    },
    textoAccionFoto: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
    },
    contenedorGPS: {
        gap: 12,
    },
    infoGPS: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        gap: 12,
    },
    coordenadasGPS: {
        flex: 1,
    },
    etiquetaGPS: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 4,
    },
    valorGPS: {
        fontSize: 16,
        color: '#212529',
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    botonesGPS: {
        flexDirection: 'row',
        gap: 12,
    },
    botonAccionGPS: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 8,
        gap: 8,
    },
    textoAccionGPS: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
    },
});
