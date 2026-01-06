// Navegador principal de la aplicación
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Importar las diferentes pantallas desde la carpeta layers
import PantallaPrincipal from '../layers/PrincipalLayer';
import PantallaDetalle from '../layers/DetalleLayer';
import PantallaFormulario from '../layers/FormularioLayer';
import PantallaEstadisticas from '../layers/EstadisticasLayer';
import PantallaMapa from '../layers/MapaLayer';

// Crear el navegador de pantallas con tipos
const Pila = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Pila.Navigator
                initialRouteName="Home"
                screenOptions={{
                    // Estilos globales del encabezado para todas las pantallas
                    headerStyle: {
                        backgroundColor: '#2D6A4F', // Verde bosque
                    },
                    headerTintColor: '#FFFFFF', // Texto blanco
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    // Animación al cambiar de pantalla
                    animation: 'slide_from_right',
                }}
            >
                {/* Pantalla principal: Lista de rutas */}
                <Pila.Screen
                    name="Home"
                    component={PantallaPrincipal}
                    options={{
                        title: 'Mis Rutas',
                        // Ocultar el botón de volver porque es la pantalla inicial
                        headerLeft: () => null,
                    }}
                />

                {/* Pantalla de detalle de una ruta */}
                <Pila.Screen
                    name="Detail"
                    component={PantallaDetalle}
                    options={{
                        title: 'Detalle de Ruta',
                    }}
                />

                {/* Pantalla de formulario para crear o editar una ruta */}
                <Pila.Screen
                    name="AddEdit"
                    component={PantallaFormulario}
                    options={({ route }) => ({
                        // Título dinámico: si hay rutaId estamos editando, si no, creando
                        title: route.params?.rutaId ? 'Editar Ruta' : 'Nueva Ruta',
                    })}
                />

                {/* Pantalla de estadísticas */}
                <Pila.Screen
                    name="Stats"
                    component={PantallaEstadisticas}
                    options={{
                        title: 'Estadísticas',
                    }}
                />

                {/* Pantalla del mapa */}
                <Pila.Screen
                    name="Map"
                    component={PantallaMapa}
                    options={{
                        title: 'Mapa de Rutas',
                    }}
                />
            </Pila.Navigator>
        </NavigationContainer>
    );
}
