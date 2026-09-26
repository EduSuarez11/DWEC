import './MiniAnuncio.css';
import { useState } from 'react';

function MiniAnuncio({ producto }){
    const [isChecked, setIsChecked] = useState(false);

    return(
        <div className="d-flex flex-row justify-content-start align-items-start gap-3"> 
            <input className="form-check-input" type="checkbox" id={producto._id} value={producto._id} aria-label="..." checked={isChecked} onChange={() => setIsChecked(!isChecked)}></input>
            <div className="card mb-3" style={{ width:'100%', backgroundColor: isChecked ? '#13c1ac33' : 'transparent', border: isChecked && '1px solid #13c1ac', padding: '10px', borderRadius: '5px'}}>
                <div className="row g-0">
                    <div className="col-md-2">
                        <img src={producto.fotos[0].data} className="img-fluid rounded-start" style={{ width:'80px', height:'80px' }} alt={`portada de ${producto.titulo}`}/>
                    </div>
                    <div className="col-md-10">
                        <div className="card-body">
                            <div className="d-flex flex-row justify-content-between align-items-center">
                                
                                <div className="d-flex flex-column justify-content-start">
                                    <h5 className="card-title">{producto.precio} €</h5>
                                    <p className="card-text"><small className="text-body-secondary">{producto.titulo}</small></p>
                                </div>
                                
                                <div className="d-flex flex-column justify-content-start">
                                    <p className="card-text">Publicado</p>
                                    <p className="card-text"><small className="text-body-secondary">{new Date(producto.fechaPublicacion).toLocaleDateString()}</small></p>
                                </div>
                                
                                <div className="d-flex flex-column justify-content-start">
                                    <p className="card-text">Modificado</p>
                                    <p className="card-text"><small className="text-body-secondary">{new Date(producto.fechaModificacion).toLocaleDateString()}</small></p>
                                </div>
                                
                                <button type="button" className="btn btn-sm btn-dark" style={{borderRadius:'100px', minWidth:'88px', fontSize:'1rem'}}>Destacalo</button>
                                
                                <div className="d-flex flex-row justify-content-end">
                                    <button type="button" className="btn-icon" id="btn-icon-save"><i class="fa-regular fa-handshake"></i></button>
                                    <button type="button" className="btn-icon" id="btn-icon-bookmark"><i class="fa-regular fa-bookmark"></i></button>
                                    <button type="button" className="btn-icon" id="btn-icon-pencil"><i class="fa-solid fa-pencil"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>             
        </div>
    )
}
export default MiniAnuncio;