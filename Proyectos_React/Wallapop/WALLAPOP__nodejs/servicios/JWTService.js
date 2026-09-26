//modulo de codigo que se va a encargar de GENERAR y VERIFICAR tokens JWT (JSON Web Tokens) 
const jwt=require('jsonwebtoken'); //importo la libreria jsonwebtoken para generar y verificar tokens JWT
//console.log("contenido de la variable jwt (libreria jsonwebtoken):", jwt);

module.exports={
    vigenciaMaximaTokens: '1h',
    generarJWT: function( payload, opcionesJWT={ expiresIn: this.vigenciaMaximaTokens } ){
        console.log("generando token JWT con payload:", payload, " .... y opcionesJWT:", opcionesJWT);

        //puedo comprobar que en el objeto "opcionesJWT" q es opcional, al menos continene claim "expiresIn" y ponerle como valor la prop. "vigenciaMaximaTokens" de este modulo, que es de 1 hora. De esta forma, el token JWT generado expirará en 1 hora.
        //o directamente asociarle un valor por defecto al parametro
        // opcionesJWT = { expiresIn: '1h' } //opcion para que el token expire en 1 hora
        const token = jwt.sign( payload, process.env.FIRMA_JWT_SECRET, opcionesJWT );
        console.log("token JWT generado:", token);
        return token;
    },
    verificarJWT: function( token, refresh ){
        
        //el parametro "refresh" representa el refreshtoken para regenerar un nuevo token de acceso si el token JWT ha expirado

        console.log("verificando token JWT:", token);
        
        try {
            //si el token JWT es valido y no ha expirado, la función jwt.verify() devuelve el payload decodificado del token JWT.
            //  Si el token JWT no es válido o ha expirado, la función jwt.verify() lanza UNA EXCEPCION o ERROR que se captura en el bloque catch.
            const payload = jwt.verify( token, process.env.FIRMA_JWT_SECRET );
            console.log("token JWT verificado correctamente. Payload decodificado:", payload);
            return payload; //devuelvo el payload decodificado del token JWT
        
        } catch (error) {
            //en variable "error" puedo diferenciar entre distintos tipos de errores relacionados con la verificación del token JWT, como por ejemplo:
            // - Token JWT expirado: error.name === 'TokenExpiredError'
            // - Token JWT inválido: error.name === 'JsonWebTokenError' (no ha sido firmado o creado por mi servidor de nodjes)
            console.log("error al verificar token JWT:", error);
         
            switch (error.name) {
                case 'TokenExpiredError':
                    console.log("el token JWT ha expirado:", error);
                    //usamos el refreshtoken para generar un nuevo token de acceso
                    if (refresh) {
                        console.log("refreshtoken proporcionado para regenerar nuevo token de acceso:", refresh);
                       
                        const payloadRefresh = jwt.verify( refresh, process.env.FIRMA_JWT_SECRET ); //verifico el refreshtoken para obtener su payload decodificado
                        const tokenAccesoNuevo = this.generarJWT( payloadRefresh ); //genero un nuevo token de acceso con el payload que contiene el refreshtoken
                       
                        return { error: 'TokenExpiredError', message: 'usa el refresh para generar nuevo token de acceso', nuevoToken: tokenAccesoNuevo }; //si el token JWT ha expirado, devuelvo un objeto con el error, mensaje y nuevo token correspondiente
                    
                    } else {
                        return { error: 'TokenExpiredError', message: 'token JWT ha expirado y no se proporcionó refresh' }; //si el token JWT ha expirado y no se proporcionó refreshtoken, devuelvo un objeto con el error y mensaje correspondiente
                    }

                case 'JsonWebTokenError':
                    console.log("el token JWT no es válido:", error);
                    return { error: 'JsonWebTokenError', message: 'token JWT no válido' }; //si el token JWT no es válido, devuelvo un objeto con el error y mensaje correspondiente
           }

        }
    },
    decodificarJWT: function( token ){
        console.log("decodificando token JWT:", token);
    }
}