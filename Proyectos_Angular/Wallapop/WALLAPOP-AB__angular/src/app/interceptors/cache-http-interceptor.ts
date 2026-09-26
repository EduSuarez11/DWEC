import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

let _cache = new Map<string, HttpEvent<unknown>>();

export const cacheHttpInterceptor: HttpInterceptorFn = (req:HttpRequest<unknown>, next:HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  console.log('==> 🐱🐱cacheHttpInterceptor interceptando la peticion: ', req.method, req.urlWithParams);
  
  //solo cacheamos las peticiones GET, las demas las dejamos pasar sin cachear
  if(req.method !== 'GET') return next(req)

  //comprobamos si la peticion a esa url ya esta en cache, si es asi, devolvemos la respuesta cacheada sin hacer la peticion al backend
  if(_cache.has(req.urlWithParams)){
    
    console.log('==> 🐱🐱cacheHttpInterceptor devolviendo respuesta cacheada para la url: ', req.urlWithParams);  
    
    //el valor recuperado de la cache debo convertirlo a un observable pq es lo q la funcion interceptor debe devolver, para eso uso el operardor "of" de rxjs, que convierte 
    //un valor a un observable que emite ese valor y luego se completa. En este caso, el valor es la respuesta cacheada para esa url, que es de tipo HttpEvent<unknown>,
    //por lo que el observable resultante es de tipo Observable<HttpEvent<unknown>>.
    
    return of(_cache.get(req.urlWithParams)!);
  }

  return next(req).pipe(
    tap(
      ( event:HttpEvent<unknown> )=>{
        console.log(' <== 🐱🐱cacheHttpInterceptor interceptando la respuesta y la meto en cache para evitar volverla a repetir mas adelante: ', event);
        _cache.set(req.urlWithParams, event);
      }
    )
  );
};
