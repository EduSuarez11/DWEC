import './ProdsElegidosUser.css';
import { useNavigate } from 'react-router';

function ProdsElegidosUser( { productosQueTeInteresan, clienteNombre } ) {
    const navigate = useNavigate();
    return (
        <>
            <h1>Elegidos para ti,  { clienteNombre }</h1>
            <div className="d-flex flex-row justify-content-start align-items-center m-3 gap-4">                
                 {                 
                 productosQueTeInteresan.length > 0 ?
                    productosQueTeInteresan.map(
                        (prod, index) => 
                            <div key={prod._id} className="d-flex flex-column justify-content-start align-items-center m-1 gap-2" style={{ cursor: 'pointer', width: '250px' }}>                                
                                <div style={{height: '304px', width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px'}}>
                                    <img src={prod.fotoPortada} 
                                        alt={`producto-elegido-${index}`} 
                                        className="img-fluid rounded" 
                                        style={{height: '304px', width: '100%'}}
                                        onClick={() => navigate(`/Producto/${prod.idCliente}/${prod._id}`)} />
                                    <div className="d-flex flex-row justify-content-between align-items-center bottom-0 start-0 end-0 position-absolute p-2">
                                        <span style={{color: '#29363d', fontSize: '0.875rem', lineHeight: '20px', fontWeight: 600, backgroundColor: '#fff', paddingInline: '12px', borderRadius: '50rem', border: '1px solid #d1dbe0'}}>{ prod.precio } €</span>
                                        <button type="button" className="btn-heart-miniproducto"><i className="fa-regular fa-heart"></i></button>
                                    </div>
                                </div>
                                <span style={{color: '#29363d', fontSize: '0.875rem', lineHeight: '20px', fontWeight: 500, paddingRight: '.25rem', paddingLeft: '.25rem', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ prod.titulo }</span>
                            </div>
                    )
                :
                    <p> ... pues no hay productos elegidos para ti 😒...</p>
                 }
            </div>         
        </>
    );
}

export default ProdsElegidosUser;