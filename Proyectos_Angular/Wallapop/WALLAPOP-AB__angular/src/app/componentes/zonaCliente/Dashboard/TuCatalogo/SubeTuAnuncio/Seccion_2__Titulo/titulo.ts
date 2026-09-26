import { Component, input, output, OutputEmitterRef } from '@angular/core';
import { NuevoAnuncio } from '../sube-tu-anuncio';

@Component({
  selector: 'app-titulo',
  imports: [],
  templateUrl: './titulo.html',
  styleUrl: './titulo.css',
})

export class Titulo {
  titulo=input<string>('');
  //anuncioChanged=output<{titulo: string}>(); //<--- output crea una señal que devuelve un objeto EventEmmitter(evento) con el tipo definido entre las < >;  
  anuncioChanged=output<Partial<NuevoAnuncio>>(); // <--- output con Partial permite emitir un objeto con solo una parte de las propiedades definidas entre las < >, en este caso solo la propiedad "titulo"
  showFotosEvent=output<boolean>();
}
