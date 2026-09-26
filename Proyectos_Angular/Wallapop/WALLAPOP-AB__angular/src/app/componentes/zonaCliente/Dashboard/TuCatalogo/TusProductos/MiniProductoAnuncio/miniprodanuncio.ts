import { Component, input, signal } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { IProductoAnuncio } from '../../../../../../modelos/modelos_ORM/ICliente';

@Component({
  selector: 'app-miniprodanuncio',
  imports: [NgClass, NgStyle, DatePipe],
  templateUrl: './miniprodanuncio.html',
  styleUrl: './miniprodanuncio.css',
})
export class Miniprodanuncio {
  producto:any=input<IProductoAnuncio>();
  isChecked=signal<boolean>(false);
}
