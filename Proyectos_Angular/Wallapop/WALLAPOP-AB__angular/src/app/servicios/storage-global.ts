import { Injectable, signal, WritableSignal } from '@angular/core';
import ICliente from '../modelos/modelos_ORM/ICliente';


interface IStorageObject {
  cliente: ICliente | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}


@Injectable({
  providedIn: 'root',
})
export class StorageGlobal {

 
  //private _storageObject: WritableSignal< { cliente:ICliente | null, tokens:{ accessToken: string, refreshToken: string } } > = signal({ cliente: null, tokens: { accessToken: '', refreshToken: '' } });
  private _storageObject: WritableSignal< IStorageObject > = signal({ cliente: null, tokens: { accessToken: '', refreshToken: '' } });
  //#region ----------------------- metodos servicio para establecer valores en el storage -----------------------------------------------------
  SetDatosCliente( nuevosDatosCliente:ICliente){
    this._storageObject.update( (prev:IStorageObject) => {
      return { ...prev, cliente: { ...prev.cliente, ...nuevosDatosCliente } };
    });
    //lo almacenamos tambien en el storage del navegador para que persista aunque se recargue la pagina
    sessionStorage.setItem('storageObject', JSON.stringify(this._storageObject()));
  }

  SetTokens( nuevosTokens:{ accessToken: string, refreshToken: string } ){
    this._storageObject.update( (prev:IStorageObject) => {
      return { ...prev, tokens: { ...prev.tokens, ...nuevosTokens } };
    });
    //lo almacenamos tambien en el storage del navegador para que persista aunque se recargue la pagina
    sessionStorage.setItem('storageObject', JSON.stringify(this._storageObject()));
  }
  //#endregion -----------------------------------------------------------------------------------------------------------------------------------


  //#regiokn --------------------------- metodos del servicio para recuperar valores del storage -------------------------------------------------
  GetDatosCliente(): WritableSignal<ICliente | null> {
    //si los datos no existen en la señal lo intentamos recuperar del sessionStorage por si ha habido refresh de la pagina
    if (!this._storageObject().cliente) {
      const storedData = sessionStorage.getItem('storageObject');
      if (storedData) {
        const parsedData: IStorageObject = JSON.parse(storedData);
        this._storageObject.set(parsedData);
      }
    }
    return signal(this._storageObject().cliente);
  }

  GetTokens(): WritableSignal<{ accessToken: string, refreshToken: string }> {
    //si los tokens no existen en la señal lo intentamos recuperar del sessionStorage por si ha habido refresh de la pagina
    if (!this._storageObject().tokens.accessToken || !this._storageObject().tokens.refreshToken) {
      const storedData = sessionStorage.getItem('storageObject');
      if (storedData) {
        const parsedData: IStorageObject = JSON.parse(storedData);
        this._storageObject.set(parsedData);
      }
    }
    return signal(this._storageObject().tokens);
  }
  //#endregion -----------------------------------------------------------------------------------------------------------------------------------


  ClearStorage() {
    this._storageObject.set({ cliente: null, tokens: { accessToken: '', refreshToken: '' } });
    sessionStorage.removeItem('storageObject');
  }

}
