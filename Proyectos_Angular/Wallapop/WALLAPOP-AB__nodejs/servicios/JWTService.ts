import jwt,{ TokenExpiredError, JsonWebTokenError} from 'jsonwebtoken';

interface IJwtService {
    vigenciaMaximaTokens: number, //<---- lo podria definir como SignOptions.expiresIn (q te da un tipo "StringValue" importado del paquete "ms"  ver fichero en node_modules --> @types ---> jsonwebtoken ---> el import q hace de StringValue from "ms";  o  number) 
    generarJWT: (payload: { [key: string]: any }, options: jwt.SignOptions) => string,
    verificarJWT: (token: string) => string | jwt.JwtPayload //{ [key: string]: any }
}

const jwtService: IJwtService = {
    vigenciaMaximaTokens: 60 * 60, //<--- si lo defines como tipo SignOptions.expiresIn, entonces no podrías asignarle directamente un número, sino que tendrías que asignarle un valor del tipo StringValue (ej: "1h", "2d", etc) o un número (en segundos) pero con la sintaxis de SignOptions.expiresIn (ej: expiresIn: 60*60)
    generarJWT(payload: { [key: string]: any }, options: jwt.SignOptions) {
        const token = jwt.sign(payload, process.env.FIRMA_JWT_SECRET!, { expiresIn: this.vigenciaMaximaTokens, ...options });
        return token;
    },

    verificarJWT: (token: string) => {
        try {    
                    
            const validToken = jwt.verify(token, process.env.FIRMA_JWT_SECRET!);
            return validToken;

        } catch (error: any) {
            if (error instanceof TokenExpiredError) {
                console.log('===> El token JWT ha expirado:', error);
                throw new TokenExpiredError('Token JWT expirado', error.expiredAt);
            }
            if (error instanceof JsonWebTokenError) {
                console.log('===> Error en verificación de JWT:', error);
                throw new JsonWebTokenError('Token JWT no válido    ');
            }
            throw new Error(`Error desconocido en verificación de JWT: ${error}`);
        }
    }
}

export default jwtService;

