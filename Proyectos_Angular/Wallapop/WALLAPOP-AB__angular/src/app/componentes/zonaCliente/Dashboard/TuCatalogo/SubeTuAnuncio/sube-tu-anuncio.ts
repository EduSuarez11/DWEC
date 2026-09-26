import { Component, computed, effect, inject, Injector, resource, ResourceRef, signal } from '@angular/core';
import { TipoAnuncio } from './Seccion_1__TipoAnuncio/tipo-anuncio';
import { Titulo } from './Seccion_2__Titulo/titulo';
import { Fotos } from './Seccion_3__Fotos/fotos';
import { Categoria } from './Seccion_4__Categoria/categoria';
import { Infoprod } from './Seccion_5__InfoProd/infoprod';
import { Envio } from './Seccion_6__Envio/envio';
import { Router } from '@angular/router';
import { FecthNode } from '../../../../../servicios/fecth-node';
import IRestAPI from '../../../../../modelos/IRestAPI';
import { StorageGlobal } from '../../../../../servicios/storage-global';
import ICliente from '../../../../../modelos/modelos_ORM/ICliente';

export type NuevoAnuncio = {
  titulo: string;
  descripcion: string;
  precio: string;
  categoria: string;
  fotos: Array<{ urlImg: string, file: File}>;
  pesoEnvio: string;
  estado: string;
}

@Component({
  selector: 'app-sube-tu-anuncio',
  imports: [TipoAnuncio, Titulo, Fotos, Categoria, Infoprod, Envio],
  templateUrl: './sube-tu-anuncio.html',
  styleUrl: './sube-tu-anuncio.css',
})
export class SubeTuAnuncio {
  router=inject(Router);
  fetchNode=inject(FecthNode);
  _svcInjector=inject(Injector);
  storage=inject(StorageGlobal);
  injector = inject(Injector)

  nuevoAnuncio=signal<NuevoAnuncio>({
    titulo: '',
    descripcion: '',
    precio: '0',
    estado:'',
    categoria: '',
    fotos: [],
    pesoEnvio: '',
  });

  checkValueNuevoAnuncio=computed<boolean>(
    () => {
      this.nuevoAnuncio(); // Dependencia para que se vuelva a calcular cada vez que cambie el anuncio
      const { titulo, descripcion, precio, estado, categoria } = this.nuevoAnuncio();
      return titulo.length > 0 && descripcion.length > 0 && precio.length > 0 && estado.length > 0 && categoria.length > 0 && this.nuevoAnuncio().fotos.length > 0;
    }  
  );

  infoProd=computed(
    () => {
        const { titulo, descripcion, precio,  estado } = this.nuevoAnuncio();
        return { titulo, descripcion, precio, estado };
    }
  );

  //señales para ir mostrando/ocultando cada sección del formulario según se vayan completando las anteriores
  showSeccionFotos=signal<boolean>(false);
  showSeccionCategorias=signal<boolean>(false);
  showSeccionInfoProd=signal<boolean>(false);

  constructor() {
    effect(
      () => {
        console.log('Valor actual de nuevoAnuncio en efecto de SubeTuAnuncio cada vez que cambia:', this.nuevoAnuncio());
        this.nuevoAnuncio().titulo.length == 0 && this.showSeccionFotos.set(false); // si el titulo del anuncio se borra, ocultamos la sección de fotos hasta que se vuelva a escribir un titulo no vacío
        this.nuevoAnuncio().fotos.length == 0 && this.showSeccionCategorias.set(false); // si se eliminan todas las fotos del anuncio, ocultamos la sección de categorias hasta que se vuelva a subir al menos una foto
      }
    )
  }


  //---- metodo handler evento "anuncioChanged" para actualizar el anuncio con los datos recibidos de cada componente hijo----//
  // el componente Titulo nos pasa en el evento un objeto: { titulo: '....' } con el nuevo titulo a actualizar
  // el componente Fotos nos pasa en el evento un objeto:  { fotos: [ { urlImg: '...', file: File }, ... ] } con las nuevas fotos a actualizar
  // el componente Categoria nos pasa en el evento un objeto: { categoria: '...' } con la nueva categoria a actualizar
  UpdateAnuncio(ev: Partial<NuevoAnuncio>) {    
    console.log('Evento recibido en SubeTuAnuncio con nuevos datos a meter en señal de nuevoAnuncio desde componente hijo:', ev);

    this.nuevoAnuncio.update(valorAnterior => ({ ...valorAnterior, ...ev }))
  }

  OnShowFotosEvent(valorRecibido: boolean) {    
    this.showSeccionFotos.set(valorRecibido);
  }

  OnShowInfoProdEvent(valorRecibido: boolean) {
    this.showSeccionInfoProd.set(valorRecibido);
  }

  OnShowCategoriasEvent(valorRecibido: boolean) {
    //aqui se podria poner la lógica para mostrar la sección de categorias, por ejemplo: this.showSeccionCategorias.set(valorRecbido);
    this.showSeccionCategorias.set(valorRecibido); 
  }

  SubmitAnuncio() {
    //aqui iria la lógica para enviar el anuncio creado a la API, por ejemplo, haciendo una petición POST con el objeto nuevoAnuncio() como cuerpo de la petición
    console.log('Anuncio a enviar a la API: ', this.nuevoAnuncio());
    const idCliente=this.storage.GetDatosCliente()()!._id; //el id del cliente autenticado lo tenemos en el storage global, que se estableció al hacer login con los datos extraidos del accessToken
    
    const formData = new FormData();

    const { fotos, ...datosAnuncio } = this.nuevoAnuncio();
    const datos={...datosAnuncio, idCliente}; //añado el id del cliente autenticado a los datos del anuncio, aunque el backend también podría extraerlo del token, lo añado por si acaso para que quede claro que el anuncio va asociado al cliente autenticado  
    //podria mandar el idCliente en el body, pero esta metido en el token...no lo mandamos!!!!
    formData.append('datos', JSON.stringify(datos)); //agrego los datos del anuncio al formData como un string JSON
    fotos.forEach( (foto, index) => formData.append('fotos', foto.file) ); //agrego cada foto al formData, el backend las recibirá como un array de archivos en el campo "fotos"

    const respuestaResource = this.fetchNode.SubirAnuncio(formData);
    effect(
      ()=>{
        const respuestaAPI:IRestAPI|undefined=respuestaResource.value();
        console.log('Valor de respuestaResource (HttpResourceRef) despues de llamar a fecthNode.SubirAnuncio: ', respuestaAPI);
        if(respuestaAPI?.codigo==0){
          // el anuncio se ha subido correctamente, meterlo en los datos del cliente del global storage...
          const _datosCliente=this.storage.GetDatosCliente()() as ICliente;
          this.storage.SetDatosCliente({ ..._datosCliente, productosVenta: [ ...(_datosCliente?.productosVenta || []), respuestaAPI.datos.anuncio ] });
          
          // si hay nuevo accessToken, actualizarlo en el storage global para que se use en siguientes peticiones a la API desde angular
          const refresh=this.storage.GetTokens()().refreshToken;
          if(respuestaAPI.datos.nuevoAccessToken){
            this.storage.SetTokens({ accessToken: respuestaAPI.datos.nuevoAccessToken, refreshToken: refresh });
          }
         
          // redirigir a la página de mi catálogo o a la página del anuncio recién creado, etc...
          this.router.navigateByUrl('/Cliente/Dashboard/TuCatalogo/published'); 

        } else {
          // manejar error
          window.alert(`Error al subir el anuncio: ${respuestaAPI?.mensaje || 'Error desconocido'}. Intentalo de nuevo mas tarde`);
        }
      }, { injector: this._svcInjector } //<--- si no indico contexto de inyeccion a usar por funcion del efecto, kaska
    )
  }

  // Prueba
  peticionConResource() {
    const reqPrueba: ResourceRef<IRestAPI | undefined> = resource<IRestAPI, string>(
      {
        params: ()=> 'mi_data',
        loader: async ({params, abortSignal}) => {
          const req = await fetch('http://localhost:3000/api/Cliente', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(params)
          })

          const resp:IRestAPI = await req.json();
          if (resp.codigo !== 0) {
            // dirigirse al inicio
          }
          return resp;
        },
        injector: this.injector
      }
    )
  }

}
