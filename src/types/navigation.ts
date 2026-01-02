import { Ruta } from './ruta';

export type RootStackParamList = {
    Home: undefined;
    Detail: { rutaId: number };
    AddEdit: { rutaId?: number }; // undefined = crear, number = editar
    Stats: undefined;
    Map: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}