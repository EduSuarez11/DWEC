import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import jwtService from "../servicios/JWTService";
//funcion middleware q extrae (si existen) el accesstoken de cabecera Authorizaion: Bearer .....
//y refreshToken de cabecera personalizada X-Refresh-Token: ...., 


export default function extractJWTfromHeaders(req: Request, res: Response, next: NextFunction) {
    try{
        console.log('==> 🤖🤖 cabeceras en objeto Request interceptadas por funcion middleware extractJWTfromHeaders:', req.headers);
        
        //------- 1º extraer accessToken de cabecera Authorization: Bearer ...
        const authHeader:string=req.headers['Authorization'] as string;
        if (! authHeader || !authHeader.startsWith('Bearer ')) throw new Error( 'no se ha proporcionado accessToken en cabecera Authorization o no tiene formato Bearer' );

        const accessToken:string=authHeader.split(' ')[1]! ; //el token es la segunda parte de la cabecera, despues de "Bearer "
        //deberiamos comprobar validez del token (no ha expirado y ha sido firmado con nuestra clave secreta)
        const decodedAccessToken = jwtService.verificarJWT(accessToken);
        //si token valido, meto en el objeto req. los campos del payload
        (req as any).accessPayLoad=decodedAccessToken;
        next(); //paso el control al siguiente middleware o ruta

    } catch (error) {
        // si el servicio me devuelve un error de expiracion, no genero respuesta directa, uso el REFRESH para generar un nuevo accesstoken
        if(error instanceof TokenExpiredError){
            console.log('==> 🕐 El accessToken ha expirado, se intentara generar uno nuevo usando el refreshToken');
            //genero un nuevo accessToken usando el refreshToken y lo meto en el objeto req.nuevoAccessToken para q el siguiente middleware se lo pase al cliente de angular
            //OJO!!! si el refreshToken no es valido o ha expirado, entonces no puedo regenerar un nuevo accesstoken y devuelvo respuesta erronea
            //para redirigir al login....
            try{
                const refreshHeader:string=req.headers['x-refresh-token'] as string;
                if (! refreshHeader) throw new Error( 'no se ha proporcionado refreshToken en cabecera personalizada X-Refresh-Token' );
                //verificamosla validez del refreshToken y si es valido generamos un nuevo accessToken
                const decodedRefreshToken = jwtService.verificarJWT(refreshHeader); //<--- objeto: { id: ..., email: ....}
                
                console.log('==> ✅ El refreshToken es valido, se generara un nuevo accessToken con el mismo payload del refreshToken:', decodedRefreshToken);
                //si el refreshToken es valido, genero un nuevo accessToken con el mismo payload del refreshToken (podríamos añadirle también info adicional si quisieramos)
                const nuevoAccessToken = jwtService.generarJWT(decodedRefreshToken as object, { expiresIn: '15min' });
                //meto el nuevo accessToken en el objeto req para que el siguiente middleware o ruta se lo pueda pasar al cliente de angular en la respuesta
                (req as any).nuevoAccessToken=nuevoAccessToken;
                next(); //paso el control al siguiente middleware o ruta
                
            } catch(error){
                //si el refreshToken no es valido o ha expirado, entonces no puedo regenerar un nuevo accesstoken y devuelvo respuesta erronea
                res.status(200).send({ codigo: 1, mensaje: 'Error en extractJWTfromHeaders, el refreshToken no es valido o ha expirado o no hay cabecera X-Refresh-Token' });
            }

        }

        console.log('==>❌❌ error en funcion middleware extractJWTfromHeaders: ', error);
        res.status(200).send({ codigo: 1, mensaje: `Error en extractJWTfromHeaders, no hay tokens de acceso validos: ${error}`});
    }
}