import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageGlobal } from '../servicios/storage-global';
import { inject } from '@angular/core';

/*
  dos formas de actuar a la hora de usar el accessToken y el refreshToken:
   - 1º forma) se manda siempre y solo el accessToken en cabecera Header Authorization: Bearer <accessToken>
      y si el accessToken ha expirado, el backend devuelve un error 401 Unauthorized, y entonces el interceptor captura ese error, hace una peticion al backend 
      para renovar el accessToken usando el refreshToken q se puede mandar:
        - en el body de la peticion
        - o en una cookie httpOnly (esta es la forma mas segura, ya que el refreshToken no es accesible desde el cliente, por lo que no se puede robar mediante un ataque XSS, pero tiene la contra que el backend y el cliente deben estar en el mismo dominio o configurar CORS para permitir el envio de cookies entre dominios, lo cual puede ser un engorro)

    Login ----> nodejs: accessToken <--- se manda en el body de la respuesta
                        refreshToken <--- se establece en una cookie httponloy en la respuesta:

                    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' });
                    res.status(200).json({ datosCliente, accessToken })

      - 2º forma) se manda siempre y el accessToken y el refreshToken, el accessToken en cabecera Header Authorization y el refreshToken en una cabecera personalizada
      por ejemplo: X-Refresh-Token: .....

      para q node pueda entender y extraer el refreshToken de esa cabecera personalizada, debo configurar CORS en node para permitir esta cabecera:

      servWeb.use(
       cors(
              { 
                origin: 'http://localhost:4200', 
                credentials: true,
                allowedHeaders: ['X-Refresh-Token','Authorization','Content-Type'] }) );
*/

export const authJWTInterceptor: HttpInterceptorFn = (req:HttpRequest<unknown>, next:HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  
  const storageGlobal=inject(StorageGlobal);
  const tokensJWT=storageGlobal.GetTokens()();
  console.log(' ==> 👾👾authJWTInterceptor interceptando la peticion y valor de tokens: ', req.method, req.urlWithParams, tokensJWT);

  //si tengo tokens en el storage los añado en cabeceras de peticion...OJO!!! no puedo mutar(modificar) directamente el objeto HttpRequest: req
  //tegno q clonarlo con metodo .clone() del objeto req HttpRequest y en el modificamos cabeceras
  let reqClon:HttpRequest<unknown> = req;
  
  if(tokensJWT){
    reqClon=req.clone(
       {
          setHeaders: {
                        Authorization: `Bearer ${tokensJWT.accessToken}`,
                        'X-Refresh-Token': tokensJWT.refreshToken
                     }
        }
    );
    console.log(' ==> 👾👾authJWTInterceptor peticion clonada con tokens en cabecera: ', reqClon.method, reqClon.urlWithParams, reqClon.headers);
  }
  
  return next(reqClon).pipe(
    tap(
      ( event:HttpEvent<unknown> )=>{
        console.log(' <== 👾👾authJWTInterceptor interceptando la respuesta: ', event);
      }
    )
  );
};
