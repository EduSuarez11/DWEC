import { Component, input, output } from '@angular/core';
import { NuevoAnuncio } from '../sube-tu-anuncio';

@Component({
  selector: 'app-infoprod',
  imports: [],
  templateUrl: './infoprod.html',
  styleUrl: './infoprod.css',
})
export class Infoprod {
  infoProd=input< { titulo: string; descripcion: string; precio: string; estado: string }>();
  anuncioChanged=output<Partial<NuevoAnuncio>>();

  OnChanged(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { id, value } = target;
    this.anuncioChanged.emit({ [id]: value });
  }  
}
