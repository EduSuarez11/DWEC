import { redirect } from "react-router";
import useGlobalState from "../zustandGlobalState/globalState";

//------------------------------------------------------------------------------------------------------------
//-------------- hooks personalizados que devuelven funciones middleware para proteger rutas -----------------
//------------------------------------------------------------------------------------------------------------

export function useCheckUserData( ) {
    const { datosCliente } = useGlobalState(); //usamos el metodo getState del store de Zustand para acceder a los datosCliente sin necesidad de usar el hook useGlobalState, que solo se puede usar dentro de componentes funcionales de React...esta funcion checkUserData se ejecuta antes de cargar el componente Dashboard, por lo que no podemos usar el hook useGlobalState dentro de esta funcion, pero si podemos usar el metodo getState del store para acceder a los datosCliente y comprobar si hay datos de usuario o no.
    return function ({ request,params,context }, next ){
        //funcion para comprobar si en storage hay datos de usuario, sino los hubiera redirigimos al login...

        console.log('Datos cliente en middleware checkUserData: ', datosCliente);
        if(!datosCliente) {
            throw redirect('/Cliente/Login'); //si no hay datosCliente, redirigimos a Login
        }
        next(); //si hay datosCliente, continuamos con siguiente funcion del middleware o con la carga del componente Dashboard 
    }
}



export function useCheckAccessTokenValidate() {
    //funcion para comprobar si el accessToken del usuario es valido, sino lo es redirigimos al login...(como si no exisitiese el refreshtoken para renovar el accessToken)
    // esta funcion se podria ejecutar despues de checkUserData, ya que si no hay datosCliente, no tiene sentido comprobar el accessToken...
    const { tokens} = useGlobalState(); //usamos el metodo getState del store de Zustand para acceder a los tokens sin necesidad de usar el hook useGlobalState, que solo se puede usar dentro de componentes funcionales de React...esta funcion checkAccessTokenValidate se ejecuta antes de cargar el componente Dashboard, por lo que no podemos usar el hook useGlobalState dentro de esta funcion, pero si podemos usar el metodo getState del store para acceder a los tokens y comprobar si el accessToken es valido o no.
    return function ({ request,params,context }, next ) {
        // Implementación de la lógica de validación del accessToken
        console.log('Tokens en middleware checkAccessTokenValidate: ', tokens);
        // Aquí podrías hacer una llamada a tu backend para verificar si el accessToken es válido, o verificar su validez localmente si tienes la información necesaria (como la fecha de expiración).
        // Si el token no es válido, puedes redirigir al usuario al login o mostrar un mensaje de error.
        // Si el token es válido, simplemente llamas a next() para continuar con la carga del componente Dashboard.

    }
}