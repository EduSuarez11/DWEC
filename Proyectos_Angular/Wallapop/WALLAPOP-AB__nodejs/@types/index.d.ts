declare global {
    namespace Express {
        interface Request {
            accessPayLoad?: { [key: string]: any } | string; //el payload del accessToken decodificado, que se añadira al objeto Request por la funcion middleware extractJWTfromHeaders, para que las rutas protegidas puedan acceder a los datos del cliente autenticado (ej: idCliente, email, etc) y usarlos para su logica de negocio
            nuevoAccessToken?: string; //nuevo accessToken generado a partir del refreshToken en caso de que el accessToken haya expirado, que se añadira al objeto Request por la funcion middleware extractJWTfromHeaders, para que las rutas protegidas puedan acceder a el y enviarlo al cliente de angular en la respuesta, para que el cliente pueda actualizar su accessToken y seguir haciendo peticiones protegidas sin necesidad de volver a loguearse
        }
    }
}