import { Component, computed, input, output } from '@angular/core';
import { NuevoAnuncio } from '../sube-tu-anuncio';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-fotos',
  imports: [ NgClass],
  templateUrl: './fotos.html',
  styleUrl: './fotos.css',
})
export class Fotos {
  numDivFotos: number[] = Array.from({ length: 10 }, (_, i) => i);
  
  fotos=input<{ urlImg: string, file: File }[]>();
  //me creo señal computada para extraer solo las  urls de la señal de entrada "fotos" y poder asi despues modificarla (las señales "input" no pueden modificarse al ser readonly)
  fotosSrc=computed(() => this.fotos()?.map(foto => foto.urlImg) || []); 

  anuncioChanged=output<Partial<NuevoAnuncio>>(); //<------------ se podria poner: output<{ fotos: { urlImg: string, file: File }[] }>();
  showCategoriasEvent=output<boolean>();


  __procesaImagenes(files: File[]) {
    // Aquí puedes procesar las imágenes seleccionadas, por ejemplo, subirlas a un servidor o mostrarlas en una vista previa.
    console.log('Imágenes seleccionadas:', files);
    if( this.fotos()!.length + files.length > 10 ) {
      alert('Solo puedes subir un máximo de 10 fotos.');
      return;
    }
    const nuevasFotos = files.map(file => ({ urlImg: URL.createObjectURL(file), file })); //<---- cada objeto File arrastrado o seleccionado en el <input type="file"> lo convierto en un objeto con la url de la imagen para mostrarla en el preview y el propio file
    this.anuncioChanged.emit({ fotos: [...this.fotos()!, ...nuevasFotos] });
  }

  LeerImagenes(event: Event) {
    const files = Array.from( (event.target as HTMLInputElement).files || [] );
    this.__procesaImagenes(files);
    // Handle the selected images
  }

  DropImagenes(event: DragEvent) {
    event.preventDefault();
    const files = Array.from( event.dataTransfer?.files || [] );
    this.__procesaImagenes(files);
    // Handle the dropped images
  }

  DragOver(event: DragEvent) {
    event.preventDefault();
    // Optionally, you can add some visual feedback when dragging files over the drop area
  }

  RemoveImage(ev:Event, index: number) {
    ev.stopPropagation(); // Evita que el evento se propague al contenedor padre, el div q dispara la apertura del input-file
    const nuevasFotos = this.fotos()!.filter( (_, pos) => pos !== index);
    this.anuncioChanged.emit({ fotos: nuevasFotos });
  }

}
