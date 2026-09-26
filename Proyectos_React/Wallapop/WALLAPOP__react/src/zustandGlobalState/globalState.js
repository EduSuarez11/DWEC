//modulo de codigo q exporta un hook (funcion js q devuelve "algo") creado por funcion "create" de libreria de "zustand"
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

//referencia a la documentacion de zustand funcion "create":https://zustand.docs.pmnd.rs/reference/apis/create
//como parametro unico recibe una funcion "StateCreatorFn" q tiene este formato:
// StateCreatorFn = (set, get, store) => stateObject
// donde:
// - set: parametro funcion q se usa para actualizar el objeto estado global
// - get: parametro funcion q se usa para obtener del estado global actual alguna propiedad o valor concreto, o el estado global completo
// - store referencia al objeto global de zustand respectivamente

// stateObject: es un objeto js con las propiedades y valores que queremos que tenga nuestro estado global, y q se usara para acceder
//  a ellos desde los componentes de React usando el hook useGlobalState
const useGlobalState=create(
    persist(
            (set, get, store)=>{
                console.log( 'funcion StateCreatorFn de create de zustand ejecutada, con parametros set, get, store:', set.toString(), get.toString(), store );
                return {
                    //propiedades y valores del estado global, a almacenar: datosCliente, tokens, etc
                    datosCliente:null,
                    tokens:{
                        accessToken: null,
                        refreshToken: null,
                    },
                    setDatosCliente: ( nuevosDatosCliente )=>{
                        console.log('funcion setDatosCliente ejecutada con valores a modificar en datosCliente:', nuevosDatosCliente);
                        set ( valorAnteriorState => ({ ...valorAnteriorState, datosCliente: {...valorAnteriorState.datosCliente, ...nuevosDatosCliente } }) );
                    },
                    setTokens: ( newAccess,newRefresh )=>{
                        console.log('funcion setTokens ejecutada con valores a modificar en tokens:', newAccess, newRefresh);
                        set ( valorAnteriorState => ({ ...valorAnteriorState, tokens: { ...valorAnteriorState.tokens, accessToken: newAccess, refreshToken: newRefresh } }) );
                    }
                }
            }
    ),
    {
        name: 'wallapopGlobalState', //nombre del item en storage donde se guardara el estado global, por ejemplo, en localStorage se guardaria con la clave 'wallapopGlobalState'
        //getStorage: () => sessionStorage, //tipo de storage a usar para guardar el estado global, por ejemplo, localStorage o sessionStorage
        storage: createJSONStorage(() => sessionStorage), //tipo de storage a usar para guardar el estado global, por ejemplo, localStorage o sessionStorage, usando la funcion createJSONStorage de zustand para manejar el almacenamiento en formato JSON
    }
);


console.log('hook useGlobalState creado con funcion create de zustand:', useGlobalState);
export default useGlobalState;