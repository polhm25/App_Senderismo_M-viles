// src/screens/AddEditScreen.tsx
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

type Props = NativeStackScreenProps<RootStackParamList, 'AddEdit'>;

// Opciones de dificultad
const DIFICULTADES: Dificultad[] = ['Fácil', 'Moderada', 'Difícil', 'Muy Difícil'];

export default function AddEditScreen({ navigation, route }: Props) {
    // Determinar si estamos editando o creando
    const rutaId = route.params?.rutaId;
    const isEditing = rutaId !== undefined;

    // Estado del formulario
    const [formData, setFormData] = useState<RutaFormData>({
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

    // Estado de UI
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Cargar datos si estamos editando
    useEffect(() => {
        if (isEditing) {
            cargarRutaParaEditar();
        }
    }, [rutaId]);

    // Función para cargar la ruta existente
    const cargarRutaParaEditar = async () => {
        try {
            setLoading(true);
            const ruta = await obtenerRutaPorId(rutaId!);

            if (ruta) {
                setFormData(rutaToFormData(ruta));
            } else {
                Alert.alert('Error', 'No se encontró la ruta');
                navigation.goBack();
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al cargar ruta:', error);
            Alert.alert('Error', 'No se pudo cargar la ruta');
            setLoading(false);
        }
    };

    // Actualizar campo del formulario
    const updateField = (field: keyof RutaFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Limpiar error de ese campo
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Validar formulario
    const validarFormulario = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Campos obligatorios
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }
        if (!formData.zona.trim()) {
            newErrors.zona = 'La zona es obligatoria';
        }
        if (!formData.duracion_horas || parseFloat(formData.duracion_horas) <= 0) {
            newErrors.duracion_horas = 'Duración debe ser mayor a 0';
        }
        if (!formData.distancia_km || parseFloat(formData.distancia_km) <= 0) {
            newErrors.distancia_km = 'Distancia debe ser mayor a 0';
        }

        // Validar formato de números
        if (formData.duracion_horas && isNaN(parseFloat(formData.duracion_horas))) {
            newErrors.duracion_horas = 'Debe ser un número válido';
        }
        if (formData.distancia_km && isNaN(parseFloat(formData.distancia_km))) {
            newErrors.distancia_km = 'Debe ser un número válido';
        }
        if (formData.desnivel_positivo && isNaN(parseInt(formData.desnivel_positivo))) {
            newErrors.desnivel_positivo = 'Debe ser un número entero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
 * Manejar añadir/cambiar foto
 */
    const handleAnadirFoto = async () => {
        try {
            // Mostrar opciones
            const opcion = await mostrarOpcionesFoto();

            if (!opcion) return; // Usuario canceló

            let fotoUri: string | null = null;

            if (opcion === 'camera') {
                fotoUri = await tomarFoto();
            } else {
                fotoUri = await seleccionarDeGaleria();
            }

            // Si se seleccionó/tomó foto, actualizar formulario
            if (fotoUri) {
                updateField('foto_principal', fotoUri);
                Alert.alert('Éxito', 'Foto añadida correctamente');
            }
        } catch (error) {
            console.error('Error al añadir foto:', error);
            Alert.alert('Error', 'No se pudo añadir la foto');
        }
    };

    /**
     * Manejar eliminar foto
     */
    const handleEliminarFoto = () => {
        Alert.alert(
            'Eliminar Foto',
            '¿Estás seguro de que quieres eliminar la foto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        updateField('foto_principal', undefined);
                        Alert.alert('Éxito', 'Foto eliminada');
                    },
                },
            ]
        );
    };

    /**
     * Manejar capturar ubicación GPS
     */
    const handleCapturarUbicacion = async () => {
        try {
            // Verificar que el GPS esté activado
            const gpsActivo = await verificarGPSActivado();
            if (!gpsActivo) return;

            // Obtener coordenadas
            const coordenadas = await obtenerUbicacionActual();

            if (coordenadas) {
                updateField('punto_inicio_lat', coordenadas.latitud);
                updateField('punto_inicio_lon', coordenadas.longitud);

                Alert.alert(
                    'Ubicación Capturada',
                    `Coordenadas: ${formatearCoordenadas(coordenadas.latitud, coordenadas.longitud)}`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error al capturar ubicación:', error);
            Alert.alert('Error', 'No se pudo obtener la ubicación');
        }
    };

    /**
     * Manejar eliminar ubicación
     */
    const handleEliminarUbicacion = () => {
        updateField('punto_inicio_lat', undefined);
        updateField('punto_inicio_lon', undefined);
        Alert.alert('Éxito', 'Ubicación eliminada');
    };


    // Guardar (crear o actualizar)
    const handleGuardar = async () => {
        // Validar
        if (!validarFormulario()) {
            Alert.alert('Error', 'Por favor, completa todos los campos obligatorios');
            return;
        }

        try {
            setLoading(true);

            // Convertir FormData a Ruta
            const rutaData = formDataToRuta(formData);

            if (isEditing) {
                // ACTUALIZAR
                await actualizarRuta(rutaId!, rutaData);
                Alert.alert('Éxito', 'Ruta actualizada correctamente');
            } else {
                // CREAR
                const nuevoId = await insertarRuta(rutaData);
                Alert.alert('Éxito', 'Ruta creada correctamente');
            }

            setLoading(false);
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'No se pudo guardar la ruta');
            setLoading(false);
        }
    };

    // Handler para DatePicker
    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // En iOS mantener abierto
        if (selectedDate) {
            updateField('fecha_realizacion', selectedDate);
        }
    };

    // Pantalla de carga
    if (loading && isEditing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={styles.loadingText}>Cargando ruta...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Título */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isEditing ? 'Editar Ruta' : 'Nueva Ruta'}
                </Text>
            </View>

            {/* CAMPO: Nombre */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Nombre de la ruta <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.nombre && styles.inputError]}
                    placeholder="Ej: Vereda de la Estrella"
                    value={formData.nombre}
                    onChangeText={(text) => updateField('nombre', text)}
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            {/* CAMPO: Zona */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Zona <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.zona && styles.inputError]}
                    placeholder="Ej: Sierra Nevada"
                    value={formData.zona}
                    onChangeText={(text) => updateField('zona', text)}
                />
                {errors.zona && <Text style={styles.errorText}>{errors.zona}</Text>}
            </View>

            {/* CAMPO: Fecha */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Fecha de realización <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <MaterialCommunityIcons name="calendar" size={20} color="#6C757D" />
                    <Text style={styles.dateButtonText}>
                        {formData.fecha_realizacion.toLocaleDateString('es-ES')}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={formData.fecha_realizacion}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()} // No permitir fechas futuras
                    />
                )}
            </View>

            {/* CAMPO: Duración */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Duración (horas) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.duracion_horas && styles.inputError]}
                    placeholder="Ej: 3.5"
                    keyboardType="decimal-pad"
                    value={formData.duracion_horas}
                    onChangeText={(text) => updateField('duracion_horas', text)}
                />
                {errors.duracion_horas && (
                    <Text style={styles.errorText}>{errors.duracion_horas}</Text>
                )}
            </View>

            {/* CAMPO: Distancia */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Distancia (km) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.distancia_km && styles.inputError]}
                    placeholder="Ej: 12.5"
                    keyboardType="decimal-pad"
                    value={formData.distancia_km}
                    onChangeText={(text) => updateField('distancia_km', text)}
                />
                {errors.distancia_km && (
                    <Text style={styles.errorText}>{errors.distancia_km}</Text>
                )}
            </View>

            {/* CAMPO: Dificultad */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Dificultad <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.dificultadContainer}>
                    {DIFICULTADES.map((dif) => (
                        <TouchableOpacity
                            key={dif}
                            style={[
                                styles.dificultadButton,
                                formData.dificultad === dif && styles.dificultadButtonActive,
                                formData.dificultad === dif && getDificultadColor(dif),
                            ]}
                            onPress={() => updateField('dificultad', dif)}
                        >
                            <Text
                                style={[
                                    styles.dificultadButtonText,
                                    formData.dificultad === dif && styles.dificultadButtonTextActive,
                                ]}
                            >
                                {dif}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* CAMPO: Desnivel (opcional) */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Desnivel positivo (m)</Text>
                <TextInput
                    style={[styles.input, errors.desnivel_positivo && styles.inputError]}
                    placeholder="Ej: 450"
                    keyboardType="number-pad"
                    value={formData.desnivel_positivo}
                    onChangeText={(text) => updateField('desnivel_positivo', text)}
                />
                {errors.desnivel_positivo && (
                    <Text style={styles.errorText}>{errors.desnivel_positivo}</Text>
                )}
            </View>

            {/* CAMPO: Valoración */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Valoración</Text>
                <RatingStars
                    rating={formData.valoracion}
                    onRatingChange={(rating) => updateField('valoracion', rating)}
                    size={40}
                />
                <Text style={styles.valoracionText}>
                    {formData.valoracion} {formData.valoracion === 1 ? 'estrella' : 'estrellas'}
                </Text>
            </View>

            {/* CAMPO: Notas (opcional) */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Notas</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Comentarios sobre la ruta..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={formData.notas}
                    onChangeText={(text) => updateField('notas', text)}
                />
            </View>

            {/* SECCIÓN: FOTO */}
            <View style={styles.extrasContainer}>
                <Text style={styles.extrasTitle}>Foto de la Ruta</Text>

                {formData.foto_principal ? (
                    // Mostrar foto seleccionada
                    <View style={styles.fotoContainer}>
                        <Image
                            source={{ uri: formData.foto_principal }}
                            style={styles.fotoPreview}
                            resizeMode="cover"
                        />
                        <View style={styles.fotoActions}>
                            <TouchableOpacity
                                style={styles.fotoActionButton}
                                onPress={handleAnadirFoto}
                            >
                                <MaterialCommunityIcons name="camera-flip" size={20} color="#2196F3" />
                                <Text style={styles.fotoActionText}>Cambiar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.fotoActionButton}
                                onPress={handleEliminarFoto}
                            >
                                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                                <Text style={[styles.fotoActionText, { color: '#F44336' }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Botón para añadir foto
                    <TouchableOpacity
                        style={styles.extraButton}
                        onPress={handleAnadirFoto}
                    >
                        <MaterialCommunityIcons name="camera" size={24} color="#2D6A4F" />
                        <Text style={styles.extraButtonText}>Añadir Foto</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#6C757D" />
                    </TouchableOpacity>
                )}
            </View>

            {/* SECCIÓN: GPS */}
            <View style={styles.extrasContainer}>
                <Text style={styles.extrasTitle}>Punto de Inicio (GPS)</Text>

                {formData.punto_inicio_lat && formData.punto_inicio_lon ? (
                    // Mostrar coordenadas capturadas
                    <View style={styles.gpsContainer}>
                        <View style={styles.gpsInfo}>
                            <MaterialCommunityIcons name="map-marker" size={24} color="#2D6A4F" />
                            <View style={styles.gpsCoords}>
                                <Text style={styles.gpsLabel}>Latitud:</Text>
                                <Text style={styles.gpsValue}>{formData.punto_inicio_lat.toFixed(6)}</Text>
                                <Text style={styles.gpsLabel}>Longitud:</Text>
                                <Text style={styles.gpsValue}>{formData.punto_inicio_lon.toFixed(6)}</Text>
                            </View>
                        </View>

                        <View style={styles.gpsActions}>
                            <TouchableOpacity
                                style={styles.gpsActionButton}
                                onPress={handleCapturarUbicacion}
                            >
                                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#2196F3" />
                                <Text style={styles.gpsActionText}>Recapturar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.gpsActionButton}
                                onPress={handleEliminarUbicacion}
                            >
                                <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
                                <Text style={[styles.gpsActionText, { color: '#F44336' }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Botón para capturar ubicación
                    <TouchableOpacity
                        style={styles.extraButton}
                        onPress={handleCapturarUbicacion}
                    >
                        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#2D6A4F" />
                        <Text style={styles.extraButtonText}>Capturar Ubicación Actual</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#6C757D" />
                    </TouchableOpacity>
                )}
            </View>

            {/* BOTONES DE ACCIÓN */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleGuardar}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'Guardar Cambios' : 'Crear Ruta'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Espaciado inferior */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

// ============================================
// FUNCIÓN AUXILIAR: Color de dificultad
// ============================================
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
    },
    formGroup: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 8,
    },
    required: {
        color: '#F44336',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#212529',
        backgroundColor: '#FFFFFF',
    },
    inputError: {
        borderColor: '#F44336',
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        marginTop: 4,
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        padding: 12,
        gap: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#212529',
    },
    dificultadContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dificultadButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CED4DA',
        backgroundColor: '#FFFFFF',
    },
    dificultadButtonActive: {
        borderColor: 'transparent',
    },
    dificultadButtonText: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    dificultadButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    valoracionContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    valoracionText: {
        fontSize: 14,
        color: '#6C757D',
    },
    extrasContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 12,
    },
    extrasTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 12,
    },
    extraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 8,
        marginBottom: 12,
        gap: 12,
    },
    extraButtonTextDisabled: {
        fontSize: 16,
        color: '#999',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CED4DA',
    },
    cancelButtonText: {
        color: '#6C757D',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#2D6A4F',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 40,
    },
    extraButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#212529',
        fontWeight: '500',
    },
    fotoContainer: {
        gap: 12,
    },
    fotoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#E9ECEF',
    },
    fotoActions: {
        flexDirection: 'row',
        gap: 12,
    },
    fotoActionButton: {
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
    fotoActionText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
    },
    gpsContainer: {
        gap: 12,
    },
    gpsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        gap: 12,
    },
    gpsCoords: {
        flex: 1,
    },
    gpsLabel: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 4,
    },
    gpsValue: {
        fontSize: 16,
        color: '#212529',
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    gpsActions: {
        flexDirection: 'row',
        gap: 12,
    },
    gpsActionButton: {
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
    gpsActionText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
    },
});