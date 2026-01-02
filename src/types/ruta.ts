export type Dificultad = 'Fácil' | 'Moderada' | 'Difícil' | 'Muy Difícil';

export interface Ruta {
  id?: number; // Opcional porque SQLite lo genera
  nombre: string;
  zona: string;
  fecha_realizacion: string; // ISO string: "2024-01-15"
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