import './Producto.css';
import { useLoaderData, useNavigate } from 'react-router';
import useGlobalState from '../../../zustandGlobalState/globalState';
import fetchNode  from '../../../servicios/fetchNode';

function Producto(){
    const navigate = useNavigate();
    const producto = useLoaderData()[0];
    const { datosCliente:cliente, setDatosCliente } = useGlobalState();

    console.log('Producto cargado en loader:', producto);

   async function CrearNuevoChat() {
        console.log('Crear nuevo chat para producto:', producto);
        //1º comprobamos que no existe ya un chat abierto entre el cliente y el vendedor para este producto, si existe, redirigimos al cliente a ese chat en el buzón
        const chatExistente = cliente.misChats.find(chat => 
            chat.idVendedor === producto.idCliente && 
            chat.anuncioProducto.id === producto._id
        );
        if(chatExistente){
            console.log('Chat existente encontrado:', chatExistente);
            navigate('/Cliente/Dashboard/Buzon/' + chatExistente._id);
            return;
        }
        //----------------------------------------------------------------------------------------------------------------------------------------------------------
        const nuevoChat = {
            idComprador: cliente._id,
            idVendedor: producto.idCliente,
            anuncioProducto: {
                id: producto._id,
                titulo: producto.titulo,
                fotoPortada: producto.fotos && producto.fotos.length > 0 ? producto.fotos[0].data : null,
                precio: producto.precio,
                visitas: producto.visitas,
                likes: producto.likes                
            },
            mensajes: [], //<---- array de objetos: { contenido: string, timestamp: number, idEmisor: string, checked: boolean, tipoMensaje: 'texto' | 'oferta' | 'compra' }
            fechaInicioChat: Date.now(),
            fechaFinChat: 0
        };
        //mandamos a nodejs el nuevo chat para que lo añada a la base de datos y si ok, refrescamos datos del cliente en el estado global para que se muestre el nuevo chat en el buzón
        const resp = await fetchNode.ActualizarDatosCliente('AddChat', nuevoChat);
        if(resp.codigo===0){
            //refrescamos datos del cliente en el estado global para que se muestre el nuevo chat en el buzón con el _id de mongodb generado para el nuevo chat en nodejs
            setDatosCliente({ ...cliente, misChats: [...cliente.misChats, { ...nuevoChat, _id: resp.datos.idChat }] });
            navigate('/Cliente/Dashboard/Buzon');

        } else {
            alert('Error al intentar comunicarnos con el vendedor. Inténtalo de nuevo más tarde.');
        }    

    }

    return(
        <div className="container">
            <div className="row m-2">                
                <div className="col-md-8">
                    {producto.fotos && producto.fotos.length > 0 ? (
                        <div id="carouselExampleIndicators" className="carousel carousel-dark slide">
                            <div className="carousel-indicators">
                                {
                                    producto.fotos.map((foto, index) => (
                                        <button key={index}
                                                type="button"
                                                data-bs-target="#carouselExampleIndicators" 
                                                data-bs-slide-to={index} 
                                                className={index === 0 ? 'active' : ''} 
                                                aria-current={index === 0 ? 'true' : 'false'} 
                                                aria-label={`Slide ${index + 1}`}>
                                        </button>
                                    ))
                                }
                            </div>
                            <div className="carousel-inner">
                                {
                                    producto.fotos.map((foto, index) => (
                                        <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                            <img src={foto.data} className="d-block flex-fill w-50 h-50 rounded "  alt={foto.originalname} />
                                        </div>
                                    ))
                                }
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>                        
                    ) : (
                        <p>No hay fotos disponibles</p>
                    )
                    }

                </div>

                <div className="col-md-4">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">{producto.titulo}</h5>
                            <h6 className="card-subtitle mb-2 text-body-secondary">{producto.estado}</h6>
                            <p className="card-text"><strong>{producto.precio} €</strong></p>
                            <div className="d-flex flex-column gap-2">
                                <button className="walla-button walla-button-primary">Comprar</button>
                                <button className="walla-button walla-button-secondary">Hacer oferta</button>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="row g-0">
                            <div className="col-md-4 d-flex justify-content-center align-items-center">
                                <img src="/images/inicio/empty-image.png" className="avatar-vendedor" alt="..."/>
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <div className="d-flex flex-row justify-content-between">
                                        <h5 className="card-title">Nombre vendedor</h5>
                                        <button type="button" className="btn-chat" onClick={ CrearNuevoChat }>Chat</button>
                                    </div>
                                    <p className="card-text">
                                        {
                                            Array.from({ length: 5 }, (_, i) => (
                                                <i key={i} className="fa-solid fa-star" style={{ color: '#000' }}></i>
                                            ))
                                        }
                                        <strong>5</strong>
                                        <span className="text-body-secondary">(100)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="row m-2">
                <div className="col">
                    <h5>Descripción</h5>
                    <p>{producto.descripcion}</p>
                    <hr />
                    <h5>Estado</h5>
                    <p>{producto.estado}</p>
                </div>
            </div>
        </div>
    );
}

export default Producto;