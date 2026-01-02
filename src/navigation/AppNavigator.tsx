// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Importar pantallas (las crearemos después)   
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import AddEditScreen from '../screens/AddEditScreen';
import StatsScreen from '../screens/StatsScreen';
import MapScreen from '../screens/MapScreen';

// Crear el Stack Navigator con tipos
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    // Estilos globales del header para TODAS las pantallas
                    headerStyle: {
                        backgroundColor: '#2D6A4F', // Verde bosque
                    },
                    headerTintColor: '#FFFFFF', // Texto blanco
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    // Animación en Android (por defecto es slide_from_right)
                    animation: 'slide_from_right',
                }}
            >
                {/* Pantalla 1: Lista de rutas */}
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: 'Mis Rutas',
                        // Opcional: ocultar el botón "atrás" porque es la pantalla inicial
                        headerLeft: () => null,
                    }}
                />

                {/* Pantalla 2: Detalle de una ruta */}
                <Stack.Screen
                    name="Detail"
                    component={DetailScreen}
                    options={{
                        title: 'Detalle de Ruta',
                        // El botón "atrás" aparece automáticamente
                    }}
                />

                {/* Pantalla 3: Formulario crear/editar */}
                <Stack.Screen
                    name="AddEdit"
                    component={AddEditScreen}
                    options={({ route }) => ({
                        // Título dinámico según si es crear o editar
                        title: route.params?.rutaId ? 'Editar Ruta' : 'Nueva Ruta',
                    })}
                />

                {/* Pantalla 4: Estadísticas */}
                <Stack.Screen
                    name="Stats"
                    component={StatsScreen}
                    options={{
                        title: 'Estadísticas',
                    }}
                />

                {/* Pantalla 5: Mapa */}
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{
                        title: 'Mapa de Rutas',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}