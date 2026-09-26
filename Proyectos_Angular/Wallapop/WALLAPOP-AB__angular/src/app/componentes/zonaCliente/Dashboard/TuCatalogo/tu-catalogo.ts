import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubeTuAnuncio } from './SubeTuAnuncio/sube-tu-anuncio';
import { TusProductos } from './TusProductos/tus-productos';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tu-catalogo',
  imports: [ SubeTuAnuncio, TusProductos],
  templateUrl: './tu-catalogo.html',
  styleUrl: './tu-catalogo.css',
})
export class TuCatalogo {
  activatedRoute=inject(ActivatedRoute);
  id=toSignal(this.activatedRoute.paramMap.pipe(map(params => params.get('id'))));
}
