import { Component, effect, inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { FecthNode } from '../../../../servicios/fecth-node';
import IRestAPI from '../../../../modelos/IRestAPI';
import { HttpResourceRef } from '@angular/common/http';
import { StorageGlobal } from '../../../../servicios/storage-global';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-oauth',
  imports: [],
  templateUrl: './login-oauth.html',
  styleUrl: './login-oauth.css',
})
export class LoginOAuth implements OnInit, OnDestroy {

  
  private fecthNode = inject(FecthNode);
  private injector = inject(Injector);
  private storageService= inject(StorageGlobal);
  router=inject(Router)

  private popupWindowGoogle: Window | null = null;
  
  ngOnDestroy(): void {
    //quito el manejador de eventos del evento "message" del objeto window para evitar posibles fugas de memoria o comportamientos no deseados cuando el componente se destruya
    (window as any).removeEventListener('message', this._handlerMessagePopupGoogle.bind(this));
  }
  ngOnInit(): void {
    //añado manejador de eventos del evento "message" del objeto window para poder interceptar el mensaje que me va a enviar el popup de Google con la informacion del perfil del usuario autenticado 
    (window as any).addEventListener('message', this._handlerMessagePopupGoogle.bind(this));
  }

  private _handlerMessagePopupGoogle(event: MessageEvent) {
    //aqui debo procesar el mensaje recibido desde el popup de Google, que debe contener la informacion del perfil del usuario autenticado, y luego cerrar el popup
    //en event.data <--- objeto de tipo IRestAPI con la informacion del perfil del usuario autenticado, que me envia el popup de Google
    console.log('===> mensaje recibido en el componente LoginOAuth desde el popup de Google:', event.data);
    
    const { codigo, mensaje, datos } = event.data as IRestAPI;
    
    if (codigo === 0) {
      //login exitoso, datos.perfilGoogle <--- informacion del perfil del usuario autenticado con Google, a almacenar en el storage global de la aplicacion y redirigir al panel o al inicio
      console.log('Login con Google exitoso, perfil del usuario autenticado y tokens:', datos);
      console.log('instancia del servicio StorageGlobal en el componente LoginOAuth:', this.storageService);

      //almaceno los tokens de autenticacion y los datos del cliente en el storage global
      this.storageService.SetDatosCliente(datos.perfilGoogle);
      this.storageService.SetTokens(datos.tokens);

      //redirijo al panel del cliente o al inicio
      this.router.navigateByUrl('/');

    } else {
      //error en el login con Google
      console.log('Error en el login con Google:', mensaje);
    }
  }


  LoginGoogle(){
    const petLoginGoogle:HttpResourceRef<IRestAPI|undefined>=this.fecthNode.LoginGoogle();
    //como petLoginGoogle es una señal que va capturando el estado de la peticion al servicio de nodejs, tengo q crear un EFECTO para ir viendo su evolucion (cambio de valores de la señal)

    effect(
      ()=>{
        const respuetaLoginGoogle: IRestAPI|undefined = petLoginGoogle.value();
        console.log('respuesta de nodejs a la peticion sobre Google para que me de url de solicitud de credenciales:', respuetaLoginGoogle);
        
        if( respuetaLoginGoogle && respuetaLoginGoogle.codigo === 0 ){
          // dentro de datos <--- urlGoogle y la debemos abrir en un popup
          const urlGoogle:string = respuetaLoginGoogle.datos.urlGoogle;
          console.log('url de solicitud de credenciales de Google:', urlGoogle);

          this.popupWindowGoogle = (window as any).open(urlGoogle, 'popup', 'width=500,height=600');

        } else {
          console.log('Error en la peticion al servicio de nodejs para obtener la url de solicitud de credenciales de Google');
        }
      },
      { injector: this.injector }
    )
  }
}
