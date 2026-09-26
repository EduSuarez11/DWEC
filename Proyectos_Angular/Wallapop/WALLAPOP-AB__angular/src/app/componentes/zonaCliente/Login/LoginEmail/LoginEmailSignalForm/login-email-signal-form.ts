import { Component, effect, ElementRef, inject, Injector, OnInit, resource, ResourceRef, signal, viewChild } from '@angular/core';
import { email, form, FormField, required, SchemaPathTree, validateHttp, pattern, minLength, validate, FieldTree, TreeValidationResult, FormRoot } from '@angular/forms/signals';
import IRestAPI from '../../../../../modelos/IRestAPI';
import { FecthNode } from '../../../../../servicios/fecth-node';
import { StorageGlobal } from '../../../../../servicios/storage-global';
import { Router } from '@angular/router';

interface IFormData {
  email: string;
  password: string;
}

interface IFortalezaPassword {
  longitud: boolean;
  digito: boolean;
  minuscula: boolean;
  MAYS: boolean;
  simbolo: boolean;
}

@Component({
  selector: 'app-login-email-signal-form',
  imports: [FormField, FormRoot],
  templateUrl: './login-email-signal-form.html',
  styleUrl: './login-email-signal-form.css',
})
export class LoginEmailSignalForm implements OnInit {

  private _svcInjector = inject(Injector);
  private fecthNode = inject(FecthNode);
  private storageSvc = inject(StorageGlobal);
  private router = inject(Router);

  refDivCaptcha = viewChild<ElementRef>('divCaptcha'); //<---- referencia a la variable TEMPLATE del contenedor del reCAPTCHA, para poder acceder a ese elemento del DOM desde el código del componente y renderizar el reCAPTCHA de google en ese contenedor, usando la API de google recaptcha que se carga en index.html con el tag <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  idCheckReCapctha: number = 0; //variable para almacenar el id del reCAPTCHA renderizado, por si queremos usar la API de google recaptcha para resetear el reCAPTCHA o para obtener el token generado por el reCAPTCHA, etc...


  //inicializamos modelo de datos para el Signal-Form, creando una señal con el objeto q representa los campos del formulario y usandno la funcion "form"
  //despues mapeamos cada campo del formulario con una prop. del modelo, usando directiva FormField asi: [formField]="loginForm.propiedadDelCampo"
  formData = signal<IFormData>({ email: '', password: '' });
  //los mensajes de validacion tienen este formato: { kind:'tipo_validacion', message:'mensaje de error' }
  loginForm = form(
    this.formData,
    (schema: SchemaPathTree<IFormData>) => {
      //--------- validaciones sobre primer campo del formulario email: ---------
      required(schema.email, { message: '* Email obligatorio' });
      email(schema.email, { message: '* Email no válido' });
      //validacion asincrona, el 2º parametro es un objeto q implementa interface HttpValidatorOptions
      validateHttp(
        schema.email,
        {
          //1º prop: la funcion request recibe como parametro un objeto del tipo ItemFieldContext o ChildItemFieldContext q tiene como props: key,value,state,fildtree y como metodos: valueOf(),...
          //funcion que devuelve un string con la url a la q se hace la peticion hhtp(pet.por GET), si quieres pet. mas compleja necesitas devolver objeto HttpResourceRequest
          request: ({ value }) => {
            //return `http://localhost:3000/api/Cliente/ComprobarEmail?email=${value}`
            return {
              url: 'http://localhost:3000/api/Cliente/ComprobarEmail',
              method: 'POST',
              body: { email: value() },
              headers: { 'Content-Type': 'application/json' },
            }
          },
          //2º prop: funcion onSuccess que se ejecuta si la peticion asincrona definida en request sale ok...
          onSuccess: (respuesta: IRestAPI) => {
            console.log("respuesta de validacion http: ", respuesta);
            if (respuesta.codigo == 0) {
              //email existe, puede hacer login....
              return null; //null o undefined significa q la validacion ha pasado, cualquier otro valor se interpreta como error de validacion y se muestra el mensaje definido en message
            } else {
              return { kind: 'EmailExiste', message: '* El email no existe, por favor regístrese' }; //cualquier valor distinto de null o undefined se interpreta como error de validacion y se muestra el mensaje definido en message
            }
          },
          //3º prop: funcion onError que se ejecuta si la peticion asincrona definida en request sale mal (red se cae, servidor no responde, endpoint no existe, ...)
          onError: (error: any) => {
            console.log('error en la peticion HTTP al servicio de nodejs para validar el email: ', error);
            return { kind: 'serverErrorEmailExiste', message: '* Error al validar email, por favor intentalo de nuevo mas tarde' }; //cualquier valor distinto de null o undefined se interpreta como error de validacion y se muestra el mensaje definido en message
          }
        }
      );

      //--------- validaciones sobre segundo campo del formulario password: ---------
      required(schema.password, { message: '* Contraseña obligatoria' });
      // minLength(schema.password, 8, { message: '* Contraseña debe tener al menos 8 caracteres'});
      // pattern(schema.password, /[0-9]/, { message: '* La contraseña debe contener al menos un digito'});
      // pattern(schema.password, /[a-z]/, { message: '* La contraseña debe contener al menos una letra minuscula'});
      // pattern(schema.password, /[A-Z]/, { message: '* La contraseña debe contener al menos una letra MAYS'});
      // pattern(schema.password, /[^0-9a-zA-Z]/, { message: '* La contraseña debe contener al menos simbolo'});

      //validacion personalizada sobre campo password, usando funcion "validate" recibe 2 parametros:
      //-1º parametro: el campo del formulario sobre el q se quiere hacer la validacion personalizada, en este caso schema.password
      //-2º parametro: funcion que se ejecuta cada vez que cambia el valor sobre el que se quiere hacer la validacion y es una funcion
      //   que recibe como parametro un objeto de tipo ItemFieldContext
      validate(schema.password, ({ value }) => {

        const fortaleza: IFortalezaPassword = {
          longitud: value().length >= 8,
          digito: /[0-9]/.test(value()),
          minuscula: /[a-z]/.test(value()),
          MAYS: /[A-Z]/.test(value()),
          simbolo: /[^0-9a-zA-Z]/.test(value())
        };

        if (fortaleza.longitud && fortaleza.digito && fortaleza.minuscula && fortaleza.MAYS && fortaleza.simbolo) {
          return null; //validacion pasada
        } else {
          //validacion no pasada, devolvemos un objeto con la prop "kind" q es el tipo de error personalizado y una prop "message" con el mensaje de error a mostrar
          //{ kind:'errorFortaleza', message: ''} ... tengo q recorrer el objeto fortaleza, ver que propiedad esta a "false" y segun se compla para esa propiedad ir 
          //concatenando al mensaje de error el texto correspondiente a esa propiedad
          let mensajeError = '';
          Object.keys(fortaleza)
            .forEach(
              (key: string) => {
                if (fortaleza[key as keyof IFortalezaPassword]) {
                  mensajeError += `✅ la password tiene al menos ${key} requerida |`;
                } else {
                  mensajeError += `❌ la password no tiene ${key} requerida|`;
                }
              }
            );

          return { kind: 'errorFortaleza', message: mensajeError }
        }

      })
    },    // <-------------3º parametro FormOptions donde puedo controlar el SUBMIT del formulario sin necesidad de usar un event listener para el evento (submit) del formulario empleado junto con directiva formRoot, entre otras opciones: https://angular.dev/api/forms/signals/FormOptions
    {
      submission: { //la propiedad submission del objeto q implementa interface FormOptions a su vez es un objeto que 
                    // implementa la interface FormSubmissionOptions: https://angular.dev/api/forms/signals/FormSubmitOptions que 
                    // tiene las siguientes propiedades para controlar el submit del formulario:

        //la propiedad action es una función que se ejecuta cuando se envía el formulario y es valido,
        action: async (
          field: FieldTree<IFormData, string | number>,
          detail: { root: FieldTree<IFormData, string | number>, submitted: FieldTree<unknown, string | number> }
        ): Promise<TreeValidationResult> => { 

          console.log('En la función action de FormOptions, el formulario es válido, valor del campo que se envió:', field().value());
          // const tokenReCAPTCHA = (window as any).grecaptcha.enterprise.getResponse( this.idCheckReCapctha ); // Obtenemos el token generado por el reCAPTCHA de Google al resolver el captcha, para enviarlo junto con los datos del formulario de login y que el servidor pueda verificarlo y validar que el usuario ha resuelto el captcha correctamente antes de procesar la solicitud de login, lo que ayuda a proteger la seguridad del portal contra ataques de fuerza bruta y bots automatizados
          // console.log('Token generado por reCAPTCHA de Google al resolver el captcha:', tokenReCAPTCHA);

          const petServer = await fetch('http://localhost:3000/api/Cliente/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: field().value().email, password: field().value().password, tokenReCAPTCHA: '' }), // Enviamos el token de reCAPTCHA junto con los datos del formulario de login para que el servidor pueda verificarlo y validar que el usuario ha resuelto el captcha correctamente antes de procesar la solicitud de login, lo que ayuda a proteger la seguridad del portal contra ataques de fuerza bruta y bots automatizados
          });
          const respAPI = await petServer.json();

          console.log('Respuesta de la API al enviar el formulario de login desde la función action de FormOptions:', respAPI);

          if (respAPI.codigo == 0) {

            //almacenamos datos del cliente en state-global y redirigimos al inicio
            //window.alert('Login exitoso, redirigiendo al inicio...');

            this.storageSvc.SetDatosCliente(respAPI.datos.cliente);
            this.storageSvc.SetTokens({ accessToken: respAPI.datos.accessToken, refreshToken: respAPI.datos.refreshToken });
            this.router.navigate(['/']);

            field().reset(); // Reseteamos el formulario después de enviarlo para limpiar los campos y el estado del formulario, y así dejarlo listo para un nuevo envío si el usuario quiere iniciar sesión con otro email o password sin necesidad de recargar la página

          } else {
            //mostramos en div-errores del formulario el mensaje de error devuelto por la API al intentar hacer login
            return { kind: 'apiError', message: respAPI.mensaje };

          }
        },

        //la propiedad onInvalid es una función que se ejecuta cuando se intenta enviar el formulario pero este no es válido, 
        // es decir, cuando hay errores de validación en alguno de los campos del formulario, esta función no recibe ningún parámetro
        onInvalid: (
          field: FieldTree<IFormData, string | number>,
          detail: { root: FieldTree<IFormData, string | number>, submitted: FieldTree<unknown, string | number> }
        ) => { 
          console.log('No se puede enviar el formulario de login, el formulario no es válido, por favor corrige los errores antes de enviar.');
          field.email().markAsTouched(); // Marcamos el campo email como tocado para que se muestren los errores de validación de este campo si los hay
          field.password().markAsTouched(); // Marcamos el campo password como tocado para que se muestren los errores de validación de este campo si los hay
          field.email().focusBoundControl(); // Enfocamos el campo email para que el usuario pueda corregirlo si es el campo que tiene errores de validación, si el campo email no tiene errores de validación entonces se enfocará el campo password para que el usuario pueda corregirlo si es el campo que tiene errores de validación
          
        }
      }
    }
  );

  ngOnInit(): void {
    //cargamos reCAPTCHA de google...
    if ((window as any).grecaptcha) {

      console.log('reCAPTCHA de google no cargado en index.html...falta tag <script src="https://www.google.com/recaptcha/api.js" async defer></script> en index.html');

      (window as any).grecaptcha.enterprise.ready(
        () => {
          this.idCheckReCapctha = (window as any).grecaptcha.enterprise.render(this.refDivCaptcha()!.nativeElement, { sitekey: '6LcdrHksAAAAADD1Kb7jwR4bfJg_ilNEMjvZhXo6', action: 'LOGIN' });
          console.log('reCAPTCHA de google renderizado en el contenedor con id "recaptcha-login"');
        }
      );
    }
  }

  //#region ----- metodo Submit con peticion hecha al servicio de nodejs con señal RESOURCE creada en el componente -----
  SubmitLogin() {
    const tokenReCAPTCHA: string = (window as any).grecaptcha.enterprise.getResponse(this.idCheckReCapctha);

    console.log("valor de loginForm y del token : ", this.loginForm().value(), tokenReCAPTCHA);

    if (this.loginForm().valid()) {
      //aqui iria la logica para enviar el formulario al backend y hacer el login del usuario
      console.log("Formulario enviado al backend para hacer login...");
      //para hacer peticion a nodejs usamos funcion "resource" es un generico donde defines el tipo de valor a obtener como respuesta y el tipo de valor del que depende esa peticion
      //esta funcion como parametro recibe un objeto de tipo ResourceOptions que tiene como propiedades: 
      // - params: <--- funcion que devuelve el objeto con los parametros necesarios para hacer la peticion http
      // - loader: <---- funcion de tipo ResourceLoader que se ejecuta y hace la peticion, recibe como parametros objeto ResourceLoaderParams
      const resp: ResourceRef<IRestAPI | undefined> = resource<IRestAPI, IFormData>(
        {
          params: () => ({ ...this.loginForm().value(), tokenReCAPTCHA }), //devuelve el valor actual del formulario, es decir un objeto con las props email y password con los valores introducidos por el usuario
          loader: async ({ params, abortSignal, previous }) => {
            console.log('Parametros recibidos en loader para hacer login: ', params);
            const response = await fetch('http://localhost:3000/api/Cliente/Login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params),
              signal: abortSignal //señal para abortar la peticion si el componente se destruye antes de que la peticion termine
            });
            const datos: IRestAPI = await response.json();
            console.log('Respuesta del backend a la peticion de login: ', datos);
            return datos;
          },
          injector: this._svcInjector //le paso el contexto de inyeccion de dependencias para que lo pueda usar la funcion loader en caso de necesitar inyectar algun servicio para hacer la peticion http o para cualquier otra cosa
        }
      );
      console.log('Valor de resp (ResourceRef) despues de llamar a resource: ', resp.value());  //<---- saldra undefined en la primera ejecucion porque la peticion asincrona no ha terminado, pero cuando la peticion termine y se obtenga la respuesta del backend, el valor de resp se actualizara con esa respuesta y se re-renderizara el componente con el nuevo valor de resp

      //si quiero ir observando  los cambios en el valor de la señal asincrona, debo usar un efecto....
      //CUANDO ME DEFINO UN EFECTO FUERA DE UN CONSTRUCTOR DEBO PASARLE UN CONTEXTO DE INJECCION DE DEPENDENCIAS POR SI LO NECESITASE EN LA FUNCION QUE EJECUTA
      //para pasarselo, despues de la funcion que ejecuta el efecto, se le pasa un objeto con opciones de configuracion del efecto, con una propiedad llamada "injector" donde se el pasa dicho contexto
      effect(
        () => {
          const respuestaAPI = resp.value();
          console.log('Valor de resp (ResourceRef) despues de llamar a resource: ', resp.value());
          //si el codigo de respuesta es 0, almacenar datoscliente y tokens en state-global, y redirigir
          //sino mostrar mensaje de error
        },
        {
          injector: this._svcInjector
        }
      )


    } else {
      console.log("El formulario no es valido, no se puede enviar al backend");
    }
  }
  //#endregion ----------------------------------------------------------------------------------------------------------


  //#region ----- metodo Submit usando un servicio para hacer la peticion a nuestro servicio de nodejs  ----------------
  SubmitLogin2() {
    const tokenReCAPTCHA: string = (window as any).grecaptcha.enterprise.getResponse(this.idCheckReCapctha);
    console.log("valor de loginForm y del token : ", this.loginForm().value(), tokenReCAPTCHA);

    if (this.loginForm().valid()) {
      const respuestaLogin = this.fecthNode.Login(this.loginForm().value().email, this.loginForm().value().password, tokenReCAPTCHA);
      console.log('Valor de respuestaLogin (HttpResourceRef) despues de llamar a fecthNode.Login: ', respuestaLogin.value());  //<---- saldra undefined en la primera ejecucion porque la peticion asincrona no ha terminado, necesito un EFECTO para ir capturando los diferentes valores de la señal

      effect(
        () => {
          const respuestaAPI: IRestAPI | undefined = respuestaLogin.value();
          console.log('Valor de respuestaLogin (HttpResourceRef) despues de llamar a fecthNode.Login: ', respuestaAPI);
        }, { injector: this._svcInjector } //<--- si no indico contexto de inyeccion a usar por funcion del efecto, kaska
      )

    } else {
      console.log("El formulario no es valido, no se puede enviar al backend");
    }
  }

  //#endregion ----------------------------------------------------------------------------------------------------------
  
}


