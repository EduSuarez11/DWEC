import './Header.css'
import { useLoaderData, useLocation, useNavigate } from 'react-router'; //hook para recuperar los datos del LOADER asociado a esta ruta, en este caso las categorias
import { useEffect, useState } from 'react';

import useGlobalState from '../../../../zustandGlobalState/globalState';
import socketIOService from '../../../../servicios/socketIOService';

function Header() {
    const { datosCliente: cliente } = useGlobalState();
    const location = useLocation();
    const navigate = useNavigate(); //<---- el hook devuelve una funcion q te permite cargar una url o ruta por programacion

    //recuperamos las categorias del LOADER...se puede hacer tb en el componente con un resource o pet.fetch  
    const categorias = useLoaderData();
    const [tienesNuevosMensajes, setTienesNuevosMensajes] = useState(false);

    const rutasLoginRegistro = ['/Cliente/Registro', '/Cliente/Login', '/Cliente/LoginEmail'];
    const enLoginRegistro = rutasLoginRegistro.includes(location.pathname);


    useEffect(
        () => {
            socketIOService.getMessage('unirseSalaChat', (data) => {
                console.log('Evento "unirseSalaChat" recibido en el cliente, datos recibidos:', data);
                const { claveChat, idVendedor } = JSON.parse(data); //<---- en data: { claveChat: string, idVendedor: string }
                if (cliente && cliente._id === idVendedor) {
                    console.log('El cliente es el vendedor del chat, se une a la sala del chat:', claveChat);
                    setTienesNuevosMensajes(true);
                    //soy el vendedor, le digo al servidor q me meta a la sala q ha creado el comprador....
                    socketIOService.emit('unirseSalaChat', JSON.stringify({ claveChat, idVendedor: cliente._id })); //emito un mensaje al servidor de socket.io para q el cliente se una a la sala del chat y pueda recibir ya los mensajes...
                }

            })// Objeto que mapea la peticion del servidor

        }, []
    )


    return (
        <div className="container mt-4 mb-4">
            {/*-- fila para logo y botones de inicio sesion, favoritos, etc... --*/}
            <div className="row">
                <div className={`col d-flex ${enLoginRegistro ? 'flex-column justify-content-start align-items-start' : 'flex-row justify-content-between align-items-center'} `}>
                    <img src="/images/logo-wallapop-home-v2.svg" alt="logo" className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
                    {
                        !enLoginRegistro ?
                            <>
                                <input type="search" className="form-control search-input w-50" placeholder="¿Qué estás buscando?" />
                                <div className="d-flex flex-row gap-3">
                                    {cliente ?
                                        <div className="d-flex flex-row justify-content-between gap-3 align-items-center">
                                            <button className="btn btn-sm btn-light"><img src="/images/dashboard/layout/favoritos.png" style={{ width: '32px', height: '32px' }} alt="Favoritos" /> Favoritos</button>
                                            <button className="btn btn-sm btn-light">
                                                <img src="/images/dashboard/layout/buzon.png" style={{ width: '32px', height: '32px' }} alt="Buzón" /> Buzón
                                                {
                                                    tienesNuevosMensajes && <span className="badge bg-danger" style={{ position: 'absolute', top: '0', right: '0', transform: 'translate(50%, -50%)' }}>1</span>
                                                }
                                            </button>
                                            <button className="btn btn-sm btn-light" onClick={() => navigate('/Cliente/Dashboard/TuCatalogo/upload')}>
                                                <img src={cliente.cuenta.imagenAvatar || "/images/dashboard/layout/perfil.png"} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundPosition: 'center', backgroundSize: 'cover' }} alt="Perfil" />Tu Perfil
                                            </button>
                                        </div>
                                        :
                                        <button className="walla-button walla-button-secondary" onClick={() => navigate('/Cliente/Login')}>Regístrate o Inicia sesión</button>
                                    }
                                    <button className="walla-button walla-button-primary" onClick={() => navigate('/Cliente/Dashboard/TuCatalogo/upload')} style={{ minWidth: !cliente ? '100%' : 'auto' }}>Vender</button>
                                </div>
                            </> :
                            <hr style={{ width: '100%', marginTop: '1rem', marginBottom: '1rem' }}></hr>
                    }
                </div>
            </div>

            {/* --------------- fila para las categorias -----------------  */}
            {!enLoginRegistro &&
                <div className="row border-top border-bottom m-3">
                    <div className="col d-flex flex-row justify-content-start align-items-center gap-3">
                        <nav className="navbar ">

                            <ul className="navbar-nav d-flex flex-row gap-3">
                                {/*--  offCanvas del navbar para desplegar todas las categorias... --*/}
                                <li className="nav-item"><button className="nav-link btn btn-link" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample"><i className="fa-solid fa-bars"></i>  Todas las categorias </button> </li>

                                <div className="offcanvas offcanvas-start" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
                                    <div className="offcanvas-header">
                                        <h5 className="offcanvas-title" id="offcanvasExampleLabel">Todas las categorias</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                                    </div>
                                    <div className="offcanvas-body">
                                        <div className="list-group list-group-flush -2">
                                            {
                                                categorias.map(categoria =>
                                                    <button key={categoria.pathCategoria} className="list-group-item list-group-item-action"> {categoria.nombreCategoria} </button>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>


                                {
                                    /*-- Mostramos solo las primeras 5 categorias en el navbar, el resto se pueden ver en el offCanvas --*/
                                    categorias.slice(0, 5).map(
                                        categoria =>

                                            <li key={categoria.pathCategoria} className="nav-item">
                                                <button className="nav-link btn btn-link"> {categoria.nombreCategoria} </button>
                                            </li>

                                    )
                                }
                            </ul>
                        </nav>
                    </div>
                </div>

            }


        </div>
    )
}

export default Header