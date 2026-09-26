import { Component, computed, effect, inject, resource, signal, untracked } from '@angular/core';
import { StorageGlobal } from '../../../../servicios/storage-global';
import { Router, RouterEvent, Event, NavigationEnd } from '@angular/router';
import { filter, map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import ICliente from '../../../../modelos/modelos_ORM/ICliente';
import ICategoria from '../../../../modelos/modelos_ORM/ICategoria';
import { NgClass } from '@angular/common';
import { SocketIOSvc } from '../../../../servicios/socket-iosvc';

@Component({
  selector: 'app-header',
  imports: [NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  storageService = inject(StorageGlobal)
  router = inject(Router);
  socketIOSvc = inject(SocketIOSvc);
  storegeGlobal = inject(StorageGlobal);

  //----------------------- señales implicadas en la gestion de recepcion de nuevos mensajes por WebSocket ------------------------------------
  unirseSalaChat = this.socketIOSvc.GetMessage("unirseSalaChat"); //<--- cuando se dispara esta señal, el cliente vendedor: crear un chat nuevo en su lista de chats y mandar señal al servidor para q nos meta a sala de chat, lo voy a hacer en un efecto
  tienesNuevosMensajes = signal<boolean>(false);
  //-------------------------------------------------------------------------------------------------------------------------------------------

  //tengo q ver si hay datos del cliente o no para mostrar en la vista el boton de login/registro o el de perfil, favoritos, ...
  //necesito una señal q vaya captando los cambios en los datos del cliente para actualizar la vista en consecuencia (el componente HEADER esta siempre cargado en la aplicacion pq
  //esta dentro del componente App raiz)

  //cliente=this.storageService.GetDatosCliente();

  estoyEnLoginRegistro = toSignal<boolean>(
    this.router
      .events
      .pipe(
        filter((ev: Event | RouterEvent): ev is NavigationEnd => ev instanceof NavigationEnd),
        tap((ev: NavigationEnd) => {
          console.log('evento de ruta filtrado y mapeado en url: ', ev.url);
        }),
        map(
          (ev: NavigationEnd) => {
            return new RegExp("/Cliente/(Login|LoginEmail|Registro)").test(ev.url);
          }
        )
      )
  )

  cliente = computed<ICliente | null>(
    () => {
      const estoyEnLoginRegistro = this.estoyEnLoginRegistro();
      console.log('estoyEnLoginRegistro en computed cliente: ', estoyEnLoginRegistro);
      if (estoyEnLoginRegistro) {
        return null;
      }
      const datosCliente = this.storageService.GetDatosCliente()();
      console.log('datos cliente en header: ', datosCliente);
      return datosCliente;
    }
  )

  


  //logica peticion en componente para recuperar las categorias desde el servicio de nodejs...la otra forma de hacerlo y mas recomendada es haciendo uso de nuestro servicio FecthNode
  categorias = resource<ICategoria[], void>(
    {
      loader: async () => {
        const petServer = await fetch('http://localhost:3000/api/Portal/Categorias?pathCat=principales');
        const respServer = await petServer.json();

        console.log('respuesta del servidor categorias: ', respServer);
        const categorias: ICategoria[] = respServer.datos.categorias as ICategoria[] || [];
        return categorias;
      }
    }
  )


  GotoBuzon() {
    const _url = `/Cliente/Dashboard/Buzon/${this.unirseSalaChat() ? this.unirseSalaChat().idChat : ''}`;
    this.router.navigateByUrl(_url);
  }





  // Error al modificar los datos del cliente porque al hacerlo el efecto se vuelve a modificar y vuelve a ejecutar 
  // la misma función produciendose un bucle infinito hasta que colapsa el navegador
  constructor() {
    effect(
      () => {
        const datosCliente = untracked(() => this.cliente()!);
        if (this.unirseSalaChat() && datosCliente && this.unirseSalaChat().datosVendedor.idVendedor === datosCliente._id) {
          console.log(" ===> en efecto unirseSalaChat: unirse a sala de chat con idChat: ", this.unirseSalaChat().idChat, " y datos del chat: ", this.unirseSalaChat(), "_id cliente logueado: ", datosCliente._id);

          const { idChat, primerMensaje, datosComprador, datosVendedor, anuncioProducto, fechaInicioChat, fechaFinChat } = this.unirseSalaChat();
          //añado el nuevo chat a los datos del storage del cliente vendedor logueado---------------------
          this.storageService.SetDatosCliente({
            ...datosCliente,
            misChats: [
              ...datosCliente.misChats,
              {
                _id: idChat,
                mensajes: [primerMensaje],
                datosComprador,
                datosVendedor,
                anuncioProducto,
                fechaInicioChat,
                fechaFinChat
              }
            ]
          });
          //emito evento al servidor para q una al cliente vendedor a la sala de chat...
          this.socketIOSvc.SendMessage("unirseSalaChat", { idChat, idVendedor: this.cliente()!._id });

          //modifico señal de la q no depende el efecto, la de tieneNuevosMensajes:
          this.tienesNuevosMensajes.set(true);
        }
      }
    )
    // this.router
    //     .events
    //     .pipe(
    //       filter( (ev: Event|RouterEvent): ev is NavigationEnd => ev instanceof NavigationEnd  ),
    //       map( 
    //         (ev: NavigationEnd) => {
    //           console.log('evento de ruta filtrado y mapeado: ', ev);
    //         return ev.url;
    //        }
    //       )
    //     )
    //     .subscribe( 
    //       (url: string )=>{
    //         console.log('evento de ruta disparado y capturado por servicio router: ', url);
    //       }
    //     ); 

    // effect(
    //   ()=>{
    //     console.log('datos en header: ', this.cliente());
    //   }
    // )
  }

}
