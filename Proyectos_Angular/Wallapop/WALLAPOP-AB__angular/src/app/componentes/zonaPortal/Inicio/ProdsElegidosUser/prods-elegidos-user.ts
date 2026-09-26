import { Component, inject, input } from '@angular/core';
import IMiniProducto from '../../../../modelos/IMiniProducto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prods-elegidos-user',
  imports: [],
  templateUrl: './prods-elegidos-user.html',
  styleUrl: './prods-elegidos-user.css',
})
export class ProdsElegidosUser {
  router=inject(Router);

  productosQueTeInteresan = input<IMiniProducto[]>([]); // Array de productos que se mostrarán en esta sección, inicialmente vacío. Este input se llenará con los productos que el sistema determine que pueden interesarle al usuario, basándose en su historial de navegación, búsquedas, compras anteriores, etc. La lógica para determinar estos productos se implementará en el componente padre (Inicio) y se pasará a este componente a través de este input.
  clienteNombre=input<string>(''); // Nombre del cliente, que se mostrará en el título de esta sección para personalizar la experiencia del usuario. Este input se llenará con el nombre del cliente obtenido del storage global o de la sesión del usuario, y se pasará a este componente desde el componente padre (Inicio) para mostrar un mensaje como "Productos que pueden interesarte, [Nombre del Cliente]".
}
