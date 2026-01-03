export type Dificultad = 'Fácil' | 'Moderada' | 'Difícil' | 'Muy Difícil';

export interface Ruta {
  id?: number; // Opcional porque SQLite lo genera
  nombre: string;
  zona: string;
  fecha_realizacion: string; // ISO string: "yyyy-mm-dd"
  duracion_horas: number;
  distancia_km: number;
  dificultad: Dificultad;
  desnivel_positivo?: number;
  punto_inicio_lat?: number;
  punto_inicio_lon?: number;
  valoracion?: number; // 1-5
  notas?: string;
  foto_principal?: string; // URI
  fecha_creacion?: string; // ISO string
}

export interface RutaFormData {
  nombre: string;
  zona: string;
  fecha_realizacion: Date;
  duracion_horas: string;
  distancia_km: string;
  dificultad: Dificultad;
  desnivel_positivo: string;
  valoracion: number;
  notas: string;
  foto_principal?: string;
  punto_inicio_lat?: number;
  punto_inicio_lon?: number;
}

export interface Estadisticas {
  totalRutas: number;
  totalKm: number;
  totalHoras: number;
  valoracionMedia: number;
  rutaMasLarga: Ruta | null;
  rutaMasDificil: Ruta | null;
}

/**
 * Helper: Convertir de RutaFormData a Ruta (para guardar en BD)
 */
export function formDataToRuta(formData: RutaFormData): Omit<Ruta, 'id' | 'fecha_creacion'> {
  return {
    nombre: formData.nombre.trim(),
    zona: formData.zona.trim(),
    fecha_realizacion: formData.fecha_realizacion.toISOString().split('T')[0], // "yyyy-mm-dd"
    duracion_horas: parseFloat(formData.duracion_horas) || 0,
    distancia_km: parseFloat(formData.distancia_km) || 0,
    dificultad: formData.dificultad,
    desnivel_positivo: formData.desnivel_positivo ? parseInt(formData.desnivel_positivo) : undefined,
    punto_inicio_lat: formData.punto_inicio_lat,
    punto_inicio_lon: formData.punto_inicio_lon,
    valoracion: formData.valoracion || undefined,
    notas: formData.notas.trim() || undefined,
    foto_principal: formData.foto_principal,
  };
}

/**
 * Helper: Convertir de Ruta a RutaFormData (para cargar en formulario de edición)
 */
export function rutaToFormData(ruta: Ruta): RutaFormData {
  return {
    nombre: ruta.nombre,
    zona: ruta.zona,
    fecha_realizacion: new Date(ruta.fecha_realizacion),
    duracion_horas: ruta.duracion_horas.toString(),
    distancia_km: ruta.distancia_km.toString(),
    dificultad: ruta.dificultad,
    desnivel_positivo: ruta.desnivel_positivo?.toString() || '',
    valoracion: ruta.valoracion || 3,
    notas: ruta.notas || '',
    foto_principal: ruta.foto_principal,
    punto_inicio_lat: ruta.punto_inicio_lat,
    punto_inicio_lon: ruta.punto_inicio_lon,
  };
}
