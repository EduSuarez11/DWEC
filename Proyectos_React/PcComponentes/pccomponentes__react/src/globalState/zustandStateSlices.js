import { create } from 'zustand';
import { ClienteSlice } from './zustand-slices/ClienteSlice';
import { CarritoSlice } from './zustand-slices/CarritoSlice';
import { SesionSlice } from './zustand-slices/SesionSlice';

const useStore = create(
    (set, get, store) => {
        //console.log('ejecutando funcion creadora del STORE de ZUSTAND, valor 1º parametro funcion set(): ', store);
        return {
            ...ClienteSlice(set, get, store),
            ...CarritoSlice(set, get, store),
            ...SesionSlice(set, get, store)
        } //<---- objeto global del store al cual tienen acceso todos los componentes 
        // usando el hook useStore() q devuelve este objeto global del store
    }
)

export default useStore;