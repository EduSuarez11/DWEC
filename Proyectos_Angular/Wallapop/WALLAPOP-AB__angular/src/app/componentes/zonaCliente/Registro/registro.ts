import { Component, inject, signal } from '@angular/core';
import { FecthNode } from '../../../servicios/fecth-node';
import { form, maxLength, required } from '@angular/forms/signals';


interface IRegisterForm {
  nombre: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-registro',
  imports: [],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  fetchNode = inject(FecthNode);

  formData = signal<IRegisterForm>({ nombre: '', email: '', password: '' })

  registerForm = form(
    this.formData,
    (schema) => {
      required(schema.nombre, {message: 'Nombre obligatorio'})
      maxLength(schema.nombre, 40, {message: 'Máximo 40 caracteres'})      
    }
  )


  SubmitRegisterForm(ev: Event) {
    this.fetchNode.Registro(this.formData().nombre, this.formData().email, this.formData().password);
  }

}
