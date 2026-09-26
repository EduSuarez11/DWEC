import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import fetchNode from '../../../servicios/fetchNode';
import useGlobalState from '../../../zustandGlobalState/globalState';

function LoginEmail() {
    const [ formData, setFormData ] = useState({ email: '', password: '' });
    const [ fortalezaPassword, setFortalezaPassword ] = useState({ longitud: false, mayuscula: false, minuscula: false, numero: false, simbolo: false });
    const checkPasswordStrength = (password) => {
            const longitud = password.length >= 8;
            const mayuscula = /[A-Z]/.test(password);
            const minuscula = /[a-z]/.test(password);
            const numero = /[0-9]/.test(password);
            const simbolo = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            setFortalezaPassword({ longitud, mayuscula, minuscula, numero, simbolo });
        }
    const recaptchaRef = useRef(null);
    const timerRef= useRef(null);
    const divErroresLoginRef = useRef(null); //<---- referencia al div donde se mostrarán los errores de login mandados por el servidor, para poder actualizar su contenido desde el código sin necesidad de usar un estado de React, ya que no es necesario que el componente se vuelva a renderizar cada vez que cambie el mensaje de error, con actualizar el contenido del div es suficiente
    const {setDatosCliente, setTokens} = useGlobalState();
    const navigate = useNavigate();


    useEffect(
        ()=>{
            // console.log('efecto q se ejecuta al montar el componente LoginEmail, solo una vez');
            // si la funcion del efecto devuelve un valor, DEBE SER UNA FUNCION DE FORMA OBLIGATORIA!!!!, q se ejecutara
            // cuando el efecto finalice
            // return ()=>{
            //     console.log('funcion de limpieza del efecto, se ejecuta al desmontar el componente LoginEmail');
            // }
            const divRecaptcha = document.getElementById('recaptcha-login'); //<--- lo suyo seria usar una referencia de react, con hook : useRef
            if( ! divRecaptcha ){
                console.error('No se ha encontrado el div para renderizar el reCAPTCHA de Google');
                return;
            }

            const RenderCaptcha=()=>{
                    console.log('==> INICIANDO RenderCaptcha - ref a div del reCAPTCHA de Google recaptchaRef.current:', recaptchaRef.current);
                try {                    
                    if( window.grecaptcha.enterprise){
                        if( recaptchaRef.current == null ) {
                            //console.log('window.grecaptcha.enterprise esta disponible, renderizando el reCAPTCHA de Google...', window.grecaptcha.enterprise);
                            recaptchaRef.current = window.grecaptcha.enterprise.render(divRecaptcha, { sitekey:'6LcdrHksAAAAADD1Kb7jwR4bfJg_ilNEMjvZhXo6', action: 'LOGIN'});
                            console.log('reCAPTCHA de Google renderizado correctamente', recaptchaRef.current);
                        } else {
                            console.log('el div para enlazar el check-reCAPTCHA esta ya en uso o la ref. se ha perdido');
                            //window.grecaptcha.enterprise.reset(recaptchaRef.current); //reseteo el reCAPTCHA para que se vuelva a mostrar el check de verificación al usuario, en caso de que ya se hubiera generado un token anteriormente y el usuario quiera volver a intentarlo, o simplemente para asegurarme de que el reCAPTCHA se muestre correctamente aunque la ref. se haya perdido por alguna razón
                        }
                    } else {
                        console.log('reCAPTCHA de Google no disponible en este momento');
                    }
                } catch (error) {
                    console.log('Error al renderizar el reCAPTCHA de Google:', error, recaptchaRef.current);
                }

            }
            
            if( window.grecaptcha ){                
                window.grecaptcha.enterprise.ready(
                    ()=>{
                    console.log('script de reCAPTCHA listo para usarse...');
                    if (! recaptchaRef.current) RenderCaptcha();
                }
            );
            }

            // timerRef.current = setInterval(()=>{
            //     if( window.grecaptcha.enterprise ){                
            //         window.grecaptcha.enterprise.ready(
            //             ()=>{
            //             RenderCaptcha();
            //         }
            //     );
            //     }
            // }, 500); //intento renderizar el reCAPTCHA cada medio segundo, hasta que esté disponible en la ventana global

            // if( window.grecaptcha && window.grecaptcha.enterprise ){
            //     RenderCaptcha();
            // } else {
            //     console.log('reCAPTCHA de Google no disponible en este momento');
            //     timeoutRef.current = setTimeout(RenderCaptcha, 1000); //intento renderizar el reCAPTCHA cada 1 segundo, hasta que esté disponible en la ventana global
            // }

            // return ()=>{
            //     if( timerRef.current ){
            //         clearInterval(timerRef.current); //limpio el timeout para evitar que siga intentando renderizar el reCAPTCHA después de desmontar el componente
            //     }
            // }
        },
        []
    )
    

    const handlerSubmit = async () => {
        console.log('datos del formulario de login e id del reCAPTCHA:', formData, recaptchaRef.current);

        if ( recaptchaRef.current != null && window.grecaptcha.enterprise ) {
            const token = await window.grecaptcha.enterprise.getResponse(recaptchaRef.current);
            console.log('Token generado por reCAPTCHA de Google:', token);

            const resp=await fetchNode.LoginRegistro('LoginEmail', { email: formData.email, password: formData.password, tokenReCAPCTHA: token });
            console.log('respuesta del servidor a la petición de login:', resp);

            if( resp.codigo === 0 ){
                //en resp.datos: { datosCliente:{ ...}, accessToken: ..., refreshToken: ... }
                //GUARDAR los datos del cliente y los tokens de acceso y refresco en el state global y redirigir a pagina principal
                setDatosCliente(resp.datos.datosCliente);
                setTokens({ accessToken: resp.datos.accessToken, refreshToken: resp.datos.refreshToken });
                navigate('/'); //redirijo a la página principal después de un login exitoso

            } else {
                console.log('error en el login:', resp.mensaje);
                //OJO!!! no manipular directamente el DOM desde JS puro...esto funcionaria, pero react pierde el "control" de ese div,
                // y no se volveria a renderizar el componente aunque cambiara el mensaje de error,
                // por eso usamos una referencia de React con useRef para acceder al div y actualizar su contenido directamente sin necesidad
                // de usar un estado de React
                
                //document.getElementById('errores-login').innerHTML = `<div class="alert alert-danger" role="alert">${resp.mensaje}</div>`;
                if( divErroresLoginRef.current ){
                    divErroresLoginRef.current.innerHTML = `<div class="alert alert-danger" role="alert">${resp.mensaje}</div>`;
                }
            }

        } else {
            console.log('No se ha podido generar el token de reCAPTCHA de Google, el reCAPTCHA no está disponible');
        }
    }


    return (
        <div className="container mt-4">
            <div className="row d-flex flex-row justify-content-center align-items-center">
                <div className="col col-md-6 col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">!Te damos la bienvenida!</h5>

                            {/* .... mensajes de error mandados por el server tras el login.... */}
                            <div id="errores-login" className="mb-3" ref={divErroresLoginRef}></div>


                            <div className="form-floating mb-3">
                                <input type="email" className="form-control" id="floatingInput" placeholder="Dirección de email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                <label htmlFor="floatingInput">Dirección de email</label>
                            </div>



                            <div className="form-floating">
                                <input type="password" className="form-control" id="floatingPassword" placeholder="Contraseña" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); checkPasswordStrength(e.target.value); }} />
                                <label htmlFor="floatingPassword">Contraseña</label>
                            </div>
                            {
                                (formData.password.length > 0) && 

                                <div className="d-flex flex-column justify-content-start mt-2 mb-2">
                                    <span className={fortalezaPassword.longitud ? "text-success": "text-danger"}>{ fortalezaPassword.longitud ? "✔️" : "❌"} La contraseña debe tener al menos 8 caracteres.</span>
                                    <span className={fortalezaPassword.mayuscula && fortalezaPassword.minuscula ? "text-success": "text-danger"}>{ fortalezaPassword.mayuscula && fortalezaPassword.minuscula ? "✔️" : "❌"} La contraseña debe tener letras MAYS y MINS </span>
                                    <span className={fortalezaPassword.numero ? "text-success": "text-danger"}>{ fortalezaPassword.numero ? "✔️" : "❌"} La contraseña debe tener al menos un número.</span>
                                    <span className={fortalezaPassword.simbolo ? "text-success": "text-danger"}>{ fortalezaPassword.simbolo ? "✔️" : "❌"} La contraseña debe tener al menos un símbolo especial.</span>
                                </div>
                            }

                            <div id="recaptcha-login"  className="m-4"></div>

                            <a href="/Cliente/PasswordRecovery" className="m-4 d-flex flex-row justify-content-center align-items-center"><strong>¿Has olvidado tu contraseña?</strong></a>

                            <div className="d-grid gap-2 mt-4">
                                <button className="walla-button walla-button-primary" type="button" onClick={ handlerSubmit }>Acceder a Wallapop</button>
                            </div>                  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default LoginEmail;