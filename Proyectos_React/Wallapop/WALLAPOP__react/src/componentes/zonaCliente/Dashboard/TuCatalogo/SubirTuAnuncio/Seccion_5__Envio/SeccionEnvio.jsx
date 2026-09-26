import './SeccionEnvio.css'
import { useState } from 'react';

function SeccionEnvio({anuncio, setAnuncio}) {
    const [conEnvio, setConEnvio] = useState(true);

    return (
        <section className="secciones">
            <span className="titulo-1">Opciones de envío</span>
            <img src="/images/dashboard/subetuanuncio/opcionesEnvio.png" style={{width:'70%', height:'auto'}} alt="Opciones de envío" />
            <hr/>
            <div className="form-check form-switch form-check-reverse">
                <input className="form-check-input" type="checkbox" role="switch" id="switchCheckChecked" defaultChecked onChange={(ev)=>setConEnvio(!conEnvio)}/>
                <label className="form-check-label" htmlFor="switchCheckChecked">Activar envío</label>
            </div>            
            <hr/>
            {
                conEnvio && (
                    <div className="d-flex flex-column gap-3">
                        <span style={{fontSize:'0.875rem', lineHeight:'20px', color:'#29363d', fontWeight:'700', margin:'0'}}>¿Cuánto pesa?</span>
                        <span style={{fontSize:'0.75rem', lineHeight:'16px', color:'#5c7a89', fontWeight:'400', margin:'0'}}>Elige el tramo de peso correspondiente a tu producto. Ten en cuenta el peso añadido del envoltorio.</span>
                        {
                            [
                                { value: 'menos-1kg', label: 'Menos de 1 kg' },
                                { value: 'entre-1y2kg', label: 'Entre 1 kg y 2 kg' },
                                { value: 'entre-2y5kg', label: 'Entre 2 kg y 5 kg' },
                                { value: 'entre-5y10kg', label: 'Entre 5 kg y 10 kg' },
                                { value: 'entre-10y20kg', label: 'Entre 10 kg y 20 kg' },
                                { value: 'entre-20y30kg', label: 'Entre 20 kg y 30 kg' },
                            ].map((option) => (
                                <>
                                    <hr/>
                                    <div key={option.value} className="form-check ">
                                        <input className="form-check-input" type="radio" name="pesoEnvio" id={option.value} value={option.value} onChange={(ev) => setAnuncio({...anuncio, pesoEnvio: ev.target.value }) }/>
                                        <label className="form-check-label" htmlFor={option.value}>
                                            {option.label}
                                        </label>
                                    </div>
                                </>
                            ))
                        }
                    </div>
                )
            }
        </section>
    );
}
export default SeccionEnvio;