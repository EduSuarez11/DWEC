import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { StorageGlobal } from '../../../../servicios/storage-global';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { IChat } from '../../../../modelos/modelos_ORM/ICliente';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SocketIOSvc } from '../../../../servicios/socket-iosvc';

@Component({
  selector: 'app-buzon',
  imports: [ DatePipe, NgClass, NgStyle],
  templateUrl: './buzon.html',
  styleUrl: './buzon.css',
})
export class Buzon {
  storageGlobal=inject(StorageGlobal);
  activatedRoute=inject(ActivatedRoute);
  socketIOSvc=inject(SocketIOSvc);

  paramsSignal=toSignal(this.activatedRoute.paramMap); 

  textoMensaje=signal<string>('');
  cliente=this.storageGlobal.GetDatosCliente().asReadonly(); // Asumimos que el cliente siempre estará presente en el storage global al acceder al buzón, ya que esta ruta está protegida por un guard de autenticación
  //chats=computed(() => this.cliente()!.misChats);
  
  idChatSeleccionado = computed( // <--- modificar utilizando computed kaska
      () => {
          if(this.paramsSignal() === null) return ''; // Si paramsSignal es null, devolvemos una cadena vacía para indicar que no se ha seleccionado ningún chat
          const idChat=this.paramsSignal()!.get('idChat');
          return this.activatedRoute.snapshot.paramMap.get('idChat') || '';
        }
  ); //<--- en angular no hay parametros opcionales como en react-router, por lo que para manejar la selección de un chat a través de la URL, simplemente obtenemos el último segmento de la URL y lo tratamos como el id del chat seleccionado. Si el idChat no coincide con ningún chat en la lista, entonces no se seleccionará ningún chat y se mostrará un mensaje indicando que no se ha seleccionado ningún chat o que el chat no existe.
 
  //  chatSeleccionado = linkedSignal<IChat | undefined>(() => this.chats().find(chat => chat._id === this.idChatSeleccionado()));

  mensajeEnChat=this.socketIOSvc.GetMessage('mensajeEnChat');

  chatSeleccionado=linkedSignal< { idChatSeleccionado:string, mensajeEnChat: any }, IChat | null >(
    {
        source: ()=> ({ idChatSeleccionado: this.idChatSeleccionado(), mensajeEnChat: this.mensajeEnChat() }),
        computation: (source,previous) =>{
          //- el parametro source es un objeto con las señales idChatSeleccionado y mensajeEnChat, que se actualizan cada vez que cambia el id del chat seleccionado o llega un nuevo mensaje por socket respectivamente. El parámetro previous es el valor anterior del chat seleccionado, que nos puede servir para comparar si ha habido cambios en el chat seleccionado o en el mensaje recibido.
          //- el parametro previous es el objeto IChat almacenado anteriormente en la señal 
          console.log(" ===> en linkedSignal chatSeleccionado,: Evaluando chat con id: ", source.idChatSeleccionado, " y mensajeEnChat: ", source.mensajeEnChat, " valores previos almacenados en el chat (mensajes):", (previous?.value as IChat).mensajes);
          
          //en teoria si se dispara la señal mensajeEnChat, tengo q añadir el nuevo mensaje al chat con idChatSeleccionado
          const _chatSeleccionado= this.cliente()!.misChats.find(chat => chat._id === source.idChatSeleccionado) || null;
          
          if( _chatSeleccionado && source.mensajeEnChat && source.mensajeEnChat.idChat === source.idChatSeleccionado ){  //<---- nuevo mensaje para chat seleccionado
            
            return { ...previous!.value, mensajes: [...previous!.value!.mensajes, source.mensajeEnChat.mensaje]  } as IChat;
          
          } else { //o bien no hay chat seleccionado (devolveria null la señal o si es un chat al q no le ha llegado un mensaje para el)
           
            return _chatSeleccionado
          }
        }
    }
  );
  
  SeleccionarChat(chat:IChat){
    this.chatSeleccionado.set(chat);
  }

  EnviarMensaje(){
    if(this.textoMensaje().trim() === '' || !this.chatSeleccionado()) return; // No enviamos mensajes vacíos ni si no hay ningún chat seleccionado

    const nuevoMensaje = {
      contenido: this.textoMensaje(),
      idEmisor: this.cliente()!._id,
      timestamp: Date.now(),
      checked: false,
      tipoMensaje: "texto"
    };

    //actualizamos el chat seleccionado añadiendo el nuevo mensaje  al array de mensajes del chat seleccionado...
    this.chatSeleccionado.update(
      (valorAnt:IChat | null) => {
        if(valorAnt === null) return valorAnt;
        return { ...valorAnt, mensajes: [...valorAnt.mensajes, nuevoMensaje] } as IChat;
      }
    );
    //debo actualizar el valor de este chat en prop.misChats del cliente almacenado en el storage global...
    const __chatsActualizados=this.cliente()!.misChats.map( (chat:IChat) => chat._id=== this.chatSeleccionado()!._id ? this.chatSeleccionado()! : chat );
    this.storageGlobal.SetDatosCliente({ ...this.cliente()!, misChats: __chatsActualizados }); //actualizamos el cliente almacenado en el storage global con el nuevo array de chats actualizado que contiene el chat seleccionado con el nuevo mensaje añadido
    
    //enviamos mensaje al servidor "mensajeEnChat" para que lo reenvie al otro cliente (vendedor o comprador) que participa en el chat a través de socket.io
    this.socketIOSvc.SendMessage("nuevoMensaje",{
      idChat: this.chatSeleccionado()!._id,
      mensaje: nuevoMensaje,
      anuncioProducto: this.chatSeleccionado()!.anuncioProducto,
      datosVendedor: this.chatSeleccionado()!.datosVendedor,
      datosComprador: this.chatSeleccionado()!.datosComprador,
      fechaInicioChat: this.chatSeleccionado()!.fechaInicioChat,
      ffechaFinChat: this.chatSeleccionado()!.fechaFinChat
    });


    this.textoMensaje.set(''); // Limpiamos el campo de texto después de enviar el mensaje



  }
}
