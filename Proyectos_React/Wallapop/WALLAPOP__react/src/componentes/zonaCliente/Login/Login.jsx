import './Login.css';
import fetchNode from '../../../servicios/fetchNode';

function Login(){


    const HandlerLoginGoogle = async () => {
        try {
            console.log('pedimos a nuestro servidor de nodejs q se ponga en contacto con GOOGLE para q me mande una URL y pueda autenticarme con mis creds.de google');
            
            const respuestaNode = await fetchNode.LoginGoogle();
            console.log('respuesta de nodejs con URL hacia  google:', respuestaNode); //<---{ codgo: ..., mensaje: ..., datos: { urlGoogle: '...' } }
            window.location.href=respuestaNode.datos.urlGoogle; //<---- desaparece la pagina cargada de react, si quisiera despues volver donde estaba tendria q cargar de nuevo toooooda la app. de react desde el iniicio
            //NOTA: este proceso de autenticacion con google es un proceso q debe hacerse fuera de nuestra app. de react mediante un popup
        } catch (error) {
            console.error('Error al intentar iniciar sesión con Google:', error);
        }
    }

    return (
        <div className="container mt-4">
            <div className="row d-flex flex-row justify-content-center align-items-center">
                <div className="col col-md-6 col-lg-4">
                    <div className="card">
                        <img src="/images/wellcome_login.png" className="card-img-top" alt="Imagen de bienvenida" />
                        <div className="card-body">
                            <h5 className="card-title">Registrate o inicia sesion.</h5>
                            <h5 className="card-title" style={{color: '#038673'}}>!Te estamos esperando!</h5>
                            <div className="d-flex flex-column align-items-center mt-3">
                                <button className="walla-button m-2" onClick={ HandlerLoginGoogle }><img src="/images/google_icon.png" style={{width: '24px', height: '24px', marginRight: '10px'}}/> Continuar con Google</button>
                                <button className="walla-button m-2" ><img src="/images/facebook_icon.png" style={{width: '24px', height: '24px', marginRight: '10px'}}/> Continuar con Facebook</button>
                                <button className="walla-button m-2" ><img src="/images/mail_icon.png" style={{width: '24px', height: '24px', marginRight: '10px'}}/> Continuar con el email (Registro)</button>
                                <span className="mt-3">¿Ya tienes una cuenta? <a href="/Cliente/LoginEmail" style={{color: '#038673'}}>Iniciar sesion</a></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;