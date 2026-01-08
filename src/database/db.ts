// src/database/db.ts
import * as SQLite from 'expo-sqlite';
import { Ruta, Estadisticas } from '../types';

// nombre con el que se guarda el archivo en el dispositivo
const db = SQLite.openDatabaseSync('senderismo.db');

// inicializa la base de datos
export const initDatabase = async (): Promise<void> => {
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS rutas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        zona TEXT NOT NULL,
        fecha_realizacion TEXT NOT NULL,
        duracion_horas REAL NOT NULL,
        distancia_km REAL NOT NULL,
        dificultad TEXT CHECK(dificultad IN ('Fácil', 'Moderada', 'Difícil', 'Muy Difícil')) NOT NULL,
        desnivel_positivo INTEGER,
        punto_inicio_lat REAL,
        punto_inicio_lon REAL,
        valoracion INTEGER CHECK(valoracion >= 1 AND valoracion <= 5),
        notas TEXT,
        foto_principal TEXT,
        fecha_creacion TEXT DEFAULT (datetime('now'))
      );
    `);

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar base de datos:', error);
        throw error;
    }
};

// INSERT para crear nuevas rutas
export const insertarRuta = async (ruta: Omit<Ruta, 'id' | 'fecha_creacion'>): Promise<number> => {
    try {
        const result = await db.runAsync(
            `INSERT INTO rutas (
        nombre, zona, fecha_realizacion, duracion_horas, distancia_km, 
        dificultad, desnivel_positivo, punto_inicio_lat, punto_inicio_lon, 
        valoracion, notas, foto_principal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ruta.nombre,
                ruta.zona,
                ruta.fecha_realizacion,
                ruta.duracion_horas,
                ruta.distancia_km,
                ruta.dificultad,
                ruta.desnivel_positivo ?? null,
                ruta.punto_inicio_lat ?? null,
                ruta.punto_inicio_lon ?? null,
                ruta.valoracion ?? null,
                ruta.notas ?? null,
                ruta.foto_principal ?? null,
            ]
        );

        console.log(`Ruta insertada con ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error al insertar ruta:', error);
        throw error;
    }
};

// SELECT para obtener todas las rutas
export const obtenerTodasLasRutas = async (): Promise<Ruta[]> => {
    try {
        const rutas = await db.getAllAsync<Ruta>(
            'SELECT * FROM rutas ORDER BY fecha_realizacion DESC'
        );

        console.log(`Se obtuvieron ${rutas.length} rutas`);
        return rutas;
    } catch (error) {
        console.error('Error al obtener rutas:', error);
        throw error;
    }
};

// SELECT para obtener una ruta por ID especifico
export const obtenerRutaPorId = async (id: number): Promise<Ruta | null> => {
    try {
        const ruta = await db.getFirstAsync<Ruta>(
            'SELECT * FROM rutas WHERE id = ?',
            [id]
        );

        if (ruta) {
            console.log(`Ruta encontrada: ${ruta.nombre}`);
        } else {
            console.log(`No se encontró ruta con ID: ${id}`);
        }

        return ruta;
    } catch (error) {
        console.error('Error al obtener ruta por ID:', error);
        throw error;
    }
};

// UPDATE para editar una ruta existente
export const actualizarRuta = async (id: number, ruta: Omit<Ruta, 'id' | 'fecha_creacion'>): Promise<void> => {
    try {
        await db.runAsync(
            `UPDATE rutas SET 
        nombre = ?, 
        zona = ?, 
        fecha_realizacion = ?, 
        duracion_horas = ?, 
        distancia_km = ?, 
        dificultad = ?, 
        desnivel_positivo = ?, 
        punto_inicio_lat = ?, 
        punto_inicio_lon = ?, 
        valoracion = ?, 
        notas = ?, 
        foto_principal = ?
      WHERE id = ?`,
            [
                ruta.nombre,
                ruta.zona,
                ruta.fecha_realizacion,
                ruta.duracion_horas,
                ruta.distancia_km,
                ruta.dificultad,
                ruta.desnivel_positivo ?? null,
                ruta.punto_inicio_lat ?? null,
                ruta.punto_inicio_lon ?? null,
                ruta.valoracion ?? null,
                ruta.notas ?? null,
                ruta.foto_principal ?? null,
                id,
            ]
        );

        console.log(`Ruta actualizada con ID: ${id}`);
    } catch (error) {
        console.error('Error al actualizar ruta:', error);
        throw error;
    }
};

// DELETE para eliminar una ruta
export const eliminarRuta = async (id: number): Promise<void> => {
    try {
        await db.runAsync('DELETE FROM rutas WHERE id = ?', [id]);
        console.log(`Ruta eliminada con ID: ${id}`);
    } catch (error) {
        console.error('Error al eliminar ruta:', error);
        throw error;
    }
};

// SELECT con operaciones para calcular estadisticas y medias de las rutas
export const obtenerEstadisticas = async (): Promise<Estadisticas> => {
    try {
        // Total de rutas
        const totalResult = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM rutas'
        );
        const totalRutas = totalResult?.count ?? 0;

        // Total km y horas
        const sumasResult = await db.getFirstAsync<{ totalKm: number; totalHoras: number }>(
            'SELECT SUM(distancia_km) as totalKm, SUM(duracion_horas) as totalHoras FROM rutas'
        );
        const totalKm = sumasResult?.totalKm ?? 0;
        const totalHoras = sumasResult?.totalHoras ?? 0;

        // Valoración media
        const valoracionResult = await db.getFirstAsync<{ media: number }>(
            'SELECT AVG(valoracion) as media FROM rutas WHERE valoracion IS NOT NULL'
        );
        const valoracionMedia = valoracionResult?.media ?? 0;

        // Ruta más larga
        const rutaMasLarga = await db.getFirstAsync<Ruta>(
            'SELECT * FROM rutas ORDER BY distancia_km DESC LIMIT 1'
        );

        // Ruta más difícil
        const rutaMasDificil = await db.getFirstAsync<Ruta>(
            "SELECT * FROM rutas WHERE dificultad = 'Muy Difícil' ORDER BY fecha_realizacion DESC LIMIT 1"
        );

        return {
            totalRutas,
            totalKm,
            totalHoras,
            valoracionMedia,
            rutaMasLarga: rutaMasLarga ?? null,
            rutaMasDificil: rutaMasDificil ?? null,
        };
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    }
};

// DATOS DE PRUEBA
export const insertarDatosDePrueba = async (): Promise<void> => {
    try {
        // Verificar si ya hay datos
        const rutas = await obtenerTodasLasRutas();
        if (rutas.length > 0) {
            console.log('Ya existen rutas en la BD, omitiendo datos de prueba');
            return;
        }

        // Insertar 3 rutas de ejemplo
        await insertarRuta({
            nombre: 'Vereda de la Estrella',
            zona: 'Sierra Nevada',
            fecha_realizacion: '2024-12-20',
            duracion_horas: 5.5,
            distancia_km: 14.2,
            dificultad: 'Difícil',
            desnivel_positivo: 800,
            valoracion: 5,
            notas: 'Vistas impresionantes del Mulhacén',
        });

        await insertarRuta({
            nombre: 'Cahorros del Monachil',
            zona: 'Monachil',
            fecha_realizacion: '2024-12-28',
            duracion_horas: 3.0,
            distancia_km: 8.5,
            dificultad: 'Moderada',
            desnivel_positivo: 300,
            valoracion: 4,
            notas: 'Ruta circular con puentes colgantes',
        });

        await insertarRuta({
            nombre: 'Paseo de los Tristes',
            zona: 'Granada Centro',
            fecha_realizacion: '2025-01-01',
            duracion_horas: 1.5,
            distancia_km: 3.2,
            dificultad: 'Fácil',
            valoracion: 3,
            notas: 'Paseo urbano con vistas a la Alhambra',
        });

        console.log('Datos de prueba insertados correctamente');
    } catch (error) {
        console.error('Error al insertar datos de prueba:', error);
    }
};