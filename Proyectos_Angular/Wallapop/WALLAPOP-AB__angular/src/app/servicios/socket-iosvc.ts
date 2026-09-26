import { Injectable, signal, Signal } from '@angular/core';
import { io, Socket} from 'socket.io-client';


@Injectable({
  providedIn: 'root',
})
export class SocketIOSvc {
  private _socket:Socket=io("http://localhost:3000");


  SendMessage(event: string, data: any): void {
    this._socket.emit(event, JSON.stringify(data));
  }

  GetMessage(event:string):Signal<any>{
     const _mensajeRecibido=signal<any>(null);

     this._socket.on(event, (data:any) =>  _mensajeRecibido.set(JSON.parse(data)) );

     return _mensajeRecibido.asReadonly();
  }

  OffEvent(event:string):void{
    if(this._socket.hasListeners(event)){
      this._socket.off(event);
    }
  }

}
