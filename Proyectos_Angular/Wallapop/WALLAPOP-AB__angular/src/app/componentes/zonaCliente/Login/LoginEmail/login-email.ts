import { Component, effect, ElementRef, OnInit, signal, viewChild } from '@angular/core';

interface IFormData {
  email: string;
  password: string;
}



@Component({
  selector: 'app-login-email',
  imports: [],
  templateUrl: './login-email.html',
  styleUrl: './login-email.css',
})
export class LoginEmail implements OnInit {

  refDivCaptcha=viewChild<ElementRef>('divCaptcha'); //<---- referencia a la variable TEMPLATE del contenedor del reCAPTCHA, para poder acceder a ese elemento del DOM desde el código del componente y renderizar el reCAPTCHA de google en ese contenedor, usando la API de google recaptcha que se carga en index.html con el tag <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  idCheckReCapctha:number=0; //variable para almacenar el id del reCAPTCHA renderizado, por si queremos usar la API de google recaptcha para resetear el reCAPTCHA o para obtener el token generado por el reCAPTCHA, etc...

  //usando señales pero sin usar Signal-Forms de angular 21...
  //meto el modelo de datos del formulario en un objeto para no tener que crear una señal para cada campo del formulario
  formData=signal<IFormData>({
    email: "introduce tu email",
    password: ""
  });

  constructor(){
    //efecto que se lanza cada vez que el valor de la señal formData cambia..
    effect(
      ()=> console.log('efecto lanzado por el cambio en formData, nuevo valor de formData:', this.formData())
    )
  }

  ngOnInit(): void {
    //cargamos reCAPTCHA de google...
    if( (window as any).grecaptcha ){
      
      console.log('reCAPTCHA de google no cargado en index.html...falta tag <script src="https://www.google.com/recaptcha/api.js" async defer></script> en index.html');
      
      (window as any).grecaptcha.ready( 
        () => {
                this.idCheckReCapctha = (window as any).grecaptcha.render(this.refDivCaptcha()!.nativeElement, { sitekey: '6LcdrHksAAAAADD1Kb7jwR4bfJg_ilNEMjvZhXo6', action:'LOGIN'});
                console.log('reCAPTCHA de google renderizado en el contenedor con id "recaptcha-login"');
              }
      );
    }
  }

  ChangeInput(event: Event) {
    //console.log('evento productido en el input:', event.target);
    const name:string = (event.target as HTMLInputElement).name;
    const value:string = (event.target as HTMLInputElement).value;
    console.log('name del input:', name, 'value del input:', value);

    //formas de actualizar el valor de una señal, siendo un objeto el valor almacenada en la misma:
    //1. usando el método set, pero hay que pasarle el objeto completo con todos sus campos, no solo el campo que queremos actualizar
    //    this.formData.set({ ...this.formData(), [name]: value });

    //2. usando el método update, que nos permite actualizar solo el campo que queremos, sin tener que pasarle el objeto completo 
    //   el método update recibe una función que recibe el valor actual de la señal y devuelve el nuevo valor de la señal, por lo que podemos usar el operador
    //  spread para mantener los campos que no queremos actualizar y solo actualizar el campo que queremos
    this.formData.update(
                          (valorActualFormData:IFormData) => ({
                          ...valorActualFormData,
                          [name]: value
                        })
                      );
    console.log('valor actualizado de formData:', this.formData());
  }


  SubmitLoginEmail() {
    const tokenReCAPTCHA:string = (window as any).grecaptcha.getResponse(this.idCheckReCapctha);
    console.log('datos del formulario de login y token de reCAPTCHA:', this.formData(), tokenReCAPTCHA);
    
  }
}
