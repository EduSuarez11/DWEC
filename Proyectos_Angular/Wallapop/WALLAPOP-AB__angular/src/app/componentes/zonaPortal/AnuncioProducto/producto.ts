import { Component, computed, effect, inject, Injector, OnInit, resource } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import IMiniProducto from '../../../modelos/IMiniProducto';
import IRestAPI from '../../../modelos/IRestAPI';
import { FecthNode}  from '../../../servicios/fecth-node';
import { NgClass } from '@angular/common';
import { StorageGlobal } from '../../../servicios/storage-global';
import ICliente, { IChat } from '../../../modelos/modelos_ORM/ICliente';

@Component({
  selector: 'app-producto',
  imports: [ NgClass],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto  {
  router=inject(Router);
  activatedRoute=inject(ActivatedRoute);
  fetchNode=inject(FecthNode);
  storageGlobal=inject(StorageGlobal);
  injector=inject(Injector);

  cliente=this.storageGlobal.GetDatosCliente()!.asReadonly();
  stars=Array.from({ length: 5 }, (_, i) => i + 1); // Array para representar las estrellas de valoración del producto, con valores del 1 al 5
  idCliente=this.activatedRoute.snapshot.paramMap.get('idCliente');
  idProducto=this.activatedRoute.snapshot.paramMap.get('idProducto');
  
  productoResourceRef=this.fetchNode.GetProductosVenta({ idProducto: this.idProducto!, idVendedor: this.idCliente! }); // Recurso para obtener los detalles del producto utilizando el idProducto e idCliente obtenidos de la ruta
  producto=computed<IMiniProducto | undefined>(() => {
    const resp=this.productoResourceRef.value() as IRestAPI; // Obtenemos la respuesta del recurso
    if(resp && resp.codigo===0 ){ // Si la respuesta es exitosa y contiene datos, devolvemos el producto
      return resp.datos!["productos"][0] as IMiniProducto;
    } else {
      return undefined; // En caso contrario, devolvemos undefined
    }
  });

  constructor(){
    effect(
      ()=>{
        const respGetProducto=this.productoResourceRef.value(); // Obtenemos los datos del producto a través del recurso
        console.log('Respuesta de la API al obtener el producto:', respGetProducto);
      }
    )
  }

  CrearNuevoChat(){
    
      console.log('crear nuevo chat para el producto:', this.producto());
      
      //1º comprobamos que no existe ya un chat abierto entre el cliente y el vendedor para este producto, si existe, redirigimos al cliente a ese chat en el buzón
      const chatExistente = this.cliente()!.misChats.find( (chat:IChat) =>  chat.datosVendedor.idVendedor === this.producto()!.idCliente &&  chat.anuncioProducto._id === this.producto()!._id );
      if(chatExistente){
          console.log('Chat existente encontrado:', chatExistente);
          this.router.navigate(['/Cliente/Dashboard/Buzon/',chatExistente._id]);
          return;
      }
      //----------------------------------------------------------------------------------------------------------------------------------------------------------
      const nuevoChat: IChat = {
          datosComprador: {
              idComprador: this.cliente()!._id,
              nombreCompleto: this.cliente()!.nombreCompleto
          },
          datosVendedor: {
              idVendedor: this.producto()!.idCliente,
              nombreCompleto: this.producto()!.nombreCompletoVendedor // Aquí podrías agregar el nombre completo del vendedor si lo tienes disponible
          },
          anuncioProducto: {
              _id: this.producto()!._id,
              titulo: this.producto()!.titulo,
              fotoPortada: this.producto()!.fotos && this.producto()!.fotos!.length > 0 ? this.producto()!.fotos![0].data : '',
              precio: this.producto()!.precio,
              visitas: this.producto()!.visitas,
              likes: this.producto()!.likes
          },
          mensajes: [], //<---- array de objetos: { contenido: string, timestamp: Date, enviadoPorComprador: boolean }
          fechaInicioChat: Date.now(),
          fechaFinChat: 0
      };
      //mandamos a nodejs el nuevo chat para que lo añada a la base de datos y si ok, refrescamos datos del cliente en el estado global para que se muestre el nuevo chat en el buzón
      const nuevoChatResource = this.fetchNode.ActualizarDatosCliente('AddChat', nuevoChat);
      effect(
        ()=>{
          const resp = nuevoChatResource.value() as IRestAPI;
          console.log('Respuesta de la API al crear un nuevo chat:', resp);

          if(resp.codigo===0){
            //refrescamos datos del cliente en el estado global para que se muestre el nuevo chat en el buzón con el _id de mongodb generado para el nuevo chat en nodejs
            this.storageGlobal.SetDatosCliente( { ...this.cliente()!, misChats: [...this.cliente()!.misChats, { ...nuevoChat, _id: resp.datos!["idChat"] }] });
            this.router.navigateByUrl(`/Cliente/Dashboard/Buzon/${resp.datos!["idChat"]}`);

          } else {
            alert('Error al intentar comunicarnos con el vendedor. Inténtalo de nuevo más tarde.');
          }
        }, { injector: this.injector })      
  }
}
