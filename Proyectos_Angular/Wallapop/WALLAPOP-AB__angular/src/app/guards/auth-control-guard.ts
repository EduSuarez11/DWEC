import { ActivatedRouteSnapshot, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { StorageGlobal } from '../servicios/storage-global';
import { inject } from '@angular/core';

export const authControlGuard: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot):MaybeAsync<GuardResult> => {
  
  console.log('==> 👮‍♂️👮‍♂️authControlGuard ejecutandose, valores de parametros: ', route, state);
  
  // guard q sirve para controla el acceso a determinadas rutas segun si el cliente esta logueado o no....
  const storage=inject(StorageGlobal);
  const router=inject(Router);

  const cliente=storage.GetDatosCliente()();
 
  if(!cliente){
    console.log('==> 🚫 cliente no autenticado, redirigiendo a login');
    router.navigateByUrl('/Cliente/Login');
  }
  return true;
};
