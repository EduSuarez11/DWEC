import { ActivatedRouteSnapshot, CanDeactivateFn, GuardResult, MaybeAsync, RouterStateSnapshot } from '@angular/router';
import { SubeTuAnuncio } from '../componentes/zonaCliente/Dashboard/TuCatalogo/SubeTuAnuncio/sube-tu-anuncio';

export const checkLeaveCrearAnuncioGuard: CanDeactivateFn<SubeTuAnuncio> = (
  component: SubeTuAnuncio, // instancia del componente desde el que se intenta salir hacia otra ruta
  currentRoute: ActivatedRouteSnapshot, //informacion sobre la ruta actual desde la que se intenta salir
  currentState: RouterStateSnapshot, //informacion sobre el estado actual del router, que incluye la ruta actual completa, parametros, etc...
  nextState: RouterStateSnapshot, //informacion sobre el estado del router al que se intenta navegar, que incluye la ruta destino completa, parametros, etc...
) : MaybeAsync<GuardResult> => {
  
  //compruebo en la ruta actual q estoy realmente publicando un anuncio, el parametro :id es "upload"
  if(currentRoute.paramMap.get('id') !== 'upload'){
    return true; //si no estoy en la ruta de subir anuncio, dejo salir sin preguntar nada
  } else {
    console.log('==> 🚨🚨 intentando salir de la ruta de crear anuncio, se requiere confirmación antes de salir');
    //...comprobar mediante parametro component q si los datos del anuncio no estan completos lanzar una window.confirm
    //para pedir si quiero salir sin guardar o no....
    if (!component.checkValueNuevoAnuncio) { //<--- OJO!!!! no se ejecuta la señal directamente, sino se accede a su referencia
      const confirmLeave = window.confirm('¿Estás seguro de que quieres salir? Tienes un anuncio sin completar.');
      return confirmLeave; // Devuelve true si el usuario confirma, false si cancela
    }
    return true; //si el anuncio esta completo, dejo salir sin preguntar nada
  }

};
