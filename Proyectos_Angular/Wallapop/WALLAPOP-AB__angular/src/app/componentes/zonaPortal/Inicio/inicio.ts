import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageGlobal } from '../../../servicios/storage-global';
import { ProdsViewedRecent } from './ProdsViewedRecent/prods-viewed-recent';
import { ProdsLastSearch } from './ProdsLastSearch/prods-last-search';
import { ProdsElegidosUser } from './ProdsElegidosUser/prods-elegidos-user';
import { FecthNode } from '../../../servicios/fecth-node';
import { HttpResourceRef } from '@angular/common/http';
import IRestAPI from '../../../modelos/IRestAPI';
import IMiniProducto from '../../../modelos/IMiniProducto';

@Component({
  selector: 'app-inicio',
  imports: [ ProdsElegidosUser, ProdsViewedRecent, ProdsLastSearch],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  router=inject(Router);
  storageGlobal=inject(StorageGlobal);
  fetchNode=inject(FecthNode);

  cliente=this.storageGlobal.GetDatosCliente().asReadonly();
  
  private _httpResRefProdsInteresan:HttpResourceRef<IRestAPI | undefined> | null = null;

  productosQueTeInteresan=computed<IMiniProducto[]>(
    () => {
            if(this.cliente()){
                const httpRes = this._httpResRefProdsInteresan!.value();
                console.log('Respuesta de GetProductosVenta:', httpRes);
    
                if( this._httpResRefProdsInteresan!.status()==='resolved' && httpRes!.codigo === 0){
                  return httpRes!.datos!["productos"] as IMiniProducto[];
                } else {
                  return [];
                }

            } else {
              return [];
            }
    }
  );

  // productosQueTeInteresan:IMiniProducto[] = [];

   constructor(){
     if(this.cliente()){
        this._httpResRefProdsInteresan = this.fetchNode.GetProductosVenta({ idCliente: this.cliente()!._id });
     }    
   }
}
