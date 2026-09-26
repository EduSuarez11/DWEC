import { Component, inject, Signal } from '@angular/core';
import { StorageGlobal } from '../../../../../servicios/storage-global';
import ICliente from '../../../../../modelos/modelos_ORM/ICliente';
import { Miniprodanuncio } from './MiniProductoAnuncio/miniprodanuncio';

@Component({
  selector: 'app-tus-productos',
  imports: [Miniprodanuncio],
  templateUrl: './tus-productos.html',
  styleUrl: './tus-productos.css',
})
export class TusProductos {
  storageSvc=inject(StorageGlobal)
  cliente:Signal<ICliente|null>=this.storageSvc.GetDatosCliente().asReadonly(); // Recuperamos los datos del cliente desde el servicio de almacenamiento global, esto es una señal que se actualizará automáticamente cuando los datos del cliente cambien en el servicio de almacenamiento global, lo que nos permitirá mostrar siempre la información actualizada del cliente en la vista de tus productos sin necesidad de hacer nada más, ya que al ser una señal, cualquier cambio en los datos del cliente en el servicio de almacenamiento global hará que esta señal se actualice automáticamente y por lo tanto se actualizará la vista de tus productos con la información más reciente del cliente.
}
