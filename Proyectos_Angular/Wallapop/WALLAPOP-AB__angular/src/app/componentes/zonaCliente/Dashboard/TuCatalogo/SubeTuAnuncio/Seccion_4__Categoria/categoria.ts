import { Component, computed, inject, output } from '@angular/core';
import { FecthNode } from '../../../../../../servicios/fecth-node';
import { HttpResourceRef } from '@angular/common/http';
import ICategoria from '../../../../../../modelos/modelos_ORM/ICategoria';
import IRestAPI from '../../../../../../modelos/IRestAPI';
import { NuevoAnuncio } from '../sube-tu-anuncio';

@Component({
  selector: 'app-categoria',
  imports: [],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class Categoria {
  //debo de recuperar las categorias raices nada mas cargar el componente o subcategorias de una categoria seleccionada
  //dos formas:
  // 1. usando nuestro servicion fetchNode
  // 2. haciendo peticion con funcion "resource" en componente
  fetchNode=inject(FecthNode);
  categoriasResource: HttpResourceRef<IRestAPI | undefined>=this.fetchNode.GetCategorias('principales');
  //categorias=this.categoriasResource.value() ?? []; //<--- si lo dejo asi, como la httpResourceRef es una op.asincrona, su valor inicial es undefined, por lo que categorias se inicializa como un array vacio, y cuando la peticion se resuelve y el valor de categoriasResource se actualiza, categorias no se actualiza automaticamente, por lo que categorias sigue siendo un array vacio. Para solucionar esto, debo interceptar a los cambios de categoriasResource y actualizar categorias cada vez que categoriasResource cambie
  categorias=computed( ()=>{
    console.log('categoriaResource ha cambiado, nuevo valor: ', this.categoriasResource.value());
    return  this.categoriasResource.value() ? (this.categoriasResource.value() as IRestAPI).datos.categorias : [];
  } );  

  anuncioChanged=output<Partial<NuevoAnuncio>>();
  showInfoProdEvent=output<boolean>();

  SeleccionarCategoria(event: Event){
    const selectElement = event.target as HTMLSelectElement;
    const categoriaSeleccionadaId = selectElement.value;
    
    console.log('Categoria seleccionada: ', categoriaSeleccionadaId);

    this.anuncioChanged.emit({ categoria: categoriaSeleccionadaId }); //emito el id de la categoria seleccionada para actualizar el anuncio en el componente padre
    //aqui debo de hacer algo con la categoria seleccionada, como por ejemplo, guardar su id en una variable para luego usarla en el siguiente paso del formulario, o hacer una peticion para obtener las subcategorias de la categoria seleccionada
    this.showInfoProdEvent.emit(true); //despues de seleccionar una categoria, muestro la siguiente sección del formulario para introducir la info del producto
    
  }

}
