import './Registro.css';
import { useState } from 'react';

function Registro() {
    // const [ valorInicial, setValorIncial ]=useState('valor inicial variable ValorINICIAL');
    // console.log('valores devueltos por hook useState...',valorInicial, setValorIncial);

    return (       
       <div className="cards">
                <h3 className='titulo'>Unete a wallapop</h3>
                <form>
                    <div className="form-floating mb-3">
                        <input type="name" className="form-control" id="floatingInput" placeholder="Nombre y apellidos"/>
                        <label htmlFor="floatingInput">Nombre y apellidos</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="name" className="form-control" id="floatingInput" placeholder="Email"/>
                        <label htmlFor="floatingInput">Email</label>
                    </div>
                    <div className="form-floating mb-3">
                        <input type="password" className="form-control" id="floatingInput" placeholder="Contraseña"/>
                        <label htmlFor="floatingInput">Contraseña</label>
                    </div>
                    <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
                        <label className="form-check-label" htmlFor="exampleCheck1">Quiero recibir comunicaciones sobre promociones y novedades de Wallapop</label>
                    </div>
                      <div className="mb-3 form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
                        <label className="form-check-label" htmlFor="exampleCheck1">He leído y acepto las Condiciones de uso y Política de privacidad de Wallapop.</label>
                    </div>
                    <a href="#" className="btn btn-primary" id='btn-crearCuenta'>Crear cuenta</a>
                </form>
        </div>  
    )
}
export default Registro;