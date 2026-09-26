import { inject, Injectable, Injector } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import IRestAPI from '../modelos/IRestAPI';
import ICategoria from '../modelos/modelos_ORM/ICategoria';

@Injectable({
  providedIn: 'root',
})
export class FecthNode {
  private injector = inject(Injector);

  Registro(nombre: string, email: string, password: string): HttpResourceRef<IRestAPI | undefined> {
    return httpResource<IRestAPI>(
      () => ({
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { nombre, email, password }
      }),
      { injector: this.injector }
    )

  }

  Login(email: string, password: string, tokenReCAPTCHA: string): HttpResourceRef<IRestAPI | undefined> {
    //usando funcion "httpResource" devuevle señal de tipo HttpResourceRef, que es un recurso que se puede consumir en el componente, y que al consumirlo hace la peticion al backend y devuelve la respuesta del backend, en este caso un objeto de tipo IRestAPI o undefined si hay un error en la peticion. 
    return httpResource<IRestAPI>(
      () => (
        {
          url: 'http://localhost:3000/api/Cliente/Login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { email, password, tokenReCAPTCHA },
        }
      ),
      { injector: this.injector }
    )
  }

  LoginGoogle(): HttpResourceRef<IRestAPI | undefined> {
    //usando funcion "httpResource" devuevle señal de tipo HttpResourceRef, que es un recurso que se puede consumir en el componente, y que al consumirlo hace la peticion al backend y devuelve la respuesta del backend, en este caso un objeto de tipo IRestAPI o undefined si hay un error en la peticion. 

    return httpResource<IRestAPI>(() => 'http://localhost:3000/api/Cliente/LoginGoogle', { injector: this.injector });
  }

  GetCategorias(pathCat: string): HttpResourceRef<IRestAPI | undefined> {
    console.log('fecthNode.GetCategorias llamado con pathCat: ', pathCat);
    return httpResource<IRestAPI>(() => `http://localhost:3000/api/Portal/Categorias?pathCat=${pathCat}`, { injector: this.injector });
  }

  SubirAnuncio(formData: FormData): HttpResourceRef<IRestAPI | undefined> {
    console.log('fecthNode.SubirAnuncio llamado con formData: ', formData);

    return httpResource<IRestAPI>(() => ({
      url: 'http://localhost:3000/api/Cliente/SubirAnuncio',
      method: 'POST',
      body: formData,
    }), { injector: this.injector });
  }

  GetProductosVenta(filtro: { [key: string]: string }): HttpResourceRef<IRestAPI | undefined> {
    return httpResource<IRestAPI>(
      //1º parametro funcion request q devuelve objeto HttpResourceRequest con la url, el método HTTP, los headers y el body de la petición HTTP a realizar para el login, en este caso se simula una petición POST a una API REST 
      //si fuese una peticion GET normal, con solo pasar el string de la url valdria
      () => (
        {
          url: 'http://localhost:3000/api/Portal/GetProductosVenta',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtro)
        }
      ),
      //2º parametro objeto options de tipo HttpResourceOptions (para definir contexto de injeccion, etc)
      { injector: this.injector }
    )
  }

  ActualizarDatosCliente(accion: string, datos: any): HttpResourceRef<IRestAPI | undefined> {
    return httpResource<IRestAPI>(
      () => (
        {
          url: `http://localhost:3000/api/Cliente/ActualizarDatos/${accion}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        }
      ),
      { injector: this.injector }
    )
  }































  peticionEjemploWithResourceHttp() {
    // return httpResource<IRestAPI>(
    //   () => 'http://localhost:3000/'
    // )

    return httpResource<IRestAPI>(
      () => (
        {
          url:'',
          method:'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: ''
        }
      )
    )
  }


}
