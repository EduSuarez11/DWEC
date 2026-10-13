// modulo de codigo para definir el amacen global de variables para todos los componentes
// del proyecto, usando la libreria de zustand

// se crea un STORE (almacen) con la funcion "create" de zustand, la cual te devuelve un HOOK que
// vas a usar en los componentes para acceder a las variables globales del STORE
// parametro una funcion 
import { create } from 'zustand';

const useGlobalState = create((set, get, store) => {
    return {
        datosCliente: null,
        tokens: {
            accessToken: null,
            refreshToken: null
        },

        pedidos: [],

        setDatosCliente: (newData) => {
            set((oldData) => (
                {
                    ...oldData,
                    datosCliente: {
                        ...oldData.datosCliente,
                        newData
                    }
                }
            ))
        },

        setTokens: (newTokens) => {
            set((oldData) => ({
                ...oldData,
                tokens: {
                    ...oldData.tokens,
                    accessToken: newTokens.accessToken,
                    refreshToken: newTokens.refreshToken
                }
            }));
        }

    }
})



export default useGlobalState;