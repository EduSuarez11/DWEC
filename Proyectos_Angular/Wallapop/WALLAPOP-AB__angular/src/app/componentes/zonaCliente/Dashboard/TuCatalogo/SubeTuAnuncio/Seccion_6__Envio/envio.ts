import { Component, input, output, signal } from '@angular/core';
import { NuevoAnuncio } from '../sube-tu-anuncio';

@Component({
  selector: 'app-envio',
  imports: [],
  templateUrl: './envio.html',
  styleUrl: './envio.css',
})
export class Envio {
  conEnvio=signal<boolean>(true);
  pesoEnvio=input<string>('');
  anuncioChanged=output<Partial<NuevoAnuncio>>();


  toggleEnvio() {
    this.conEnvio.set(!this.conEnvio());
    if (!this.conEnvio()) {
      this.anuncioChanged.emit({ pesoEnvio: '' });
    }
  }
}
