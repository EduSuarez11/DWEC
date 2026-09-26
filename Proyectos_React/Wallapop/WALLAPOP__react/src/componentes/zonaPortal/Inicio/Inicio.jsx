import './Inicio.css';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router';
import useGlobalState from '../../../zustandGlobalState/globalState';
import {fetchNodePortal} from '../../../servicios/fetchNode';
import ProdsElegidosUser from './ProdsElegidosUser/ProdsElegidosUser';
import ProdsViewsRecent from './ProdsVistosRencientemente/ProdsViewsRecent';
import ProdsLastSearch from './ProdsUltimaBusqueda/ProdsLastSearch';

function Inicio() {
    const {datosCliente: cliente}=useGlobalState();
    const navigate = useNavigate();
    const [productosQueTeInteresan, setProductosQueTeInteresan]=useState([]);

    useEffect(() => {
        // recuperamos productos que le pueden interesar al cliente, para mostrarlos en la seccion "Elegidos para ti"
            const recuperarProductosQueTeInteresan=async()=>{
                try {
                    if (cliente && cliente._id) {
                        const filtro={ idcliente: cliente._id };
                        const productosInteres=await fetchNodePortal.GetProductosVenta(filtro);
                        console.log('Productos que le pueden interesar al cliente:', productosInteres);
                        // aqui se deberia actualizar el estado global con los productos recuperados, para luego mostrarlos en la seccion "Elegidos para ti"
                        setProductosQueTeInteresan(productosInteres);
                    }
                } catch (error) {
                    console.error('Error al recuperar productos que te interesan:', error);
                }
            };

            recuperarProductosQueTeInteresan();
    }, [cliente]);

    return (
        <div className="container">
            <div className="row mb-4">
                { ! cliente ? 
                    <div className="d-flex flex-row justify-content-center align-items-center m-3" style={{ backgroundColor: 'rgb(233, 255, 180)' }}>
                        <div className="d-flex flex-column justify-content-center align-items-center m-5">
                            <div className="m-2" style={{ color: '#015354' }}><h1><strong>Compra y vende productos</strong> de segunda mano</h1></div>
                            <button className="btn btn-vender" onClick={() => navigate('/Cliente/Dashboard/TuCatalogo/upload')}>
                                <i className="fa-solid fa-circle-plus"></i> Vender ahora
                            </button>
                        </div>
                        <img src="/images/inicio/portada.png" className="img-inicio" alt="Imagen de portada" onClick={() => navigate('/Cliente/Dashboard/TuCatalogo/upload')}/>
                    </div>
                
                : 
                    <div className="d-flex flex-column justify-content-center align-items-center m-3" >
                        <h1><strong>Compra y vende cosas de segunda mano</strong></h1>
                        <h2>casi, casi, sin moverte del sofá</h2>
                        <div className="d-flex flex-row align-items-center m-3 gap-4 w-100">
                            <input type="search" className="search-box" style={{ minWidth: '75%' }} placeholder="Buscar en Wallapop"  />
                            <button className="walla-button walla-button-primary" style={{maxWidth: '80px' }}>Buscar</button>
                        </div>
                    </div>
                }
            </div>

            <div className="row">
                { 
                    ! cliente ? 
                    
                    <>        
                        <h1>A mucha gente le gustan</h1>
                        <p> ... aqui irian los productos de clientes con mas visitas o likes...</p>
                    </>
                    
                : 
                    <>
                        <h1> Sigue donde lo dejaste</h1>
                        <div className="d-flex flex-row justify-content-start align-items-center m-3 gap-4">                   
                            <ProdsLastSearch />
                            <ProdsViewsRecent />
                        </div>

                        <hr/>
                        <ProdsElegidosUser productosQueTeInteresan={productosQueTeInteresan} clienteNombre={cliente.nombreCompleto} />
                    </>            
                }
            </div>

            <div className="row">
                <div className="d-flex flex-row justify-content-center align-items-center m-3">
                    <img src="/images/inicio/wallapop-pro.png"  alt="Wallapop Pro" onClick={() => navigate('/Portal/Inicio')} style={{cursor: 'pointer'}}/>
                    <img src="/images/inicio/qr-app.png"  alt="App wallapop"/> 
                </div>
            </div>
        </div>
    );
        
}

export default Inicio;