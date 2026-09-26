import './Buzon.css';
import { useState } from 'react';
import { useParams } from 'react-router';

import useGlobalState from '../../../../zustandGlobalState/globalState';
import socketIOService from '../../../../servicios/socketIOService';

function Buzon() {
    const { datosCliente:cliente } = useGlobalState();
    const { idChat } = useParams();

    const [ chats,setChats ] = useState(cliente.misChats);
    const [ chatSeleccionado, setChatSeleccionado ] = useState( idChat ? cliente.misChats.find(chat => chat._id === idChat) : null );
    const [ textoMensaje, setTextoMensaje ] = useState('');
    
    function EnviarMensaje(){
        console.log('Funcion EnviarMensaje ejecutada, con mensaje a enviar:', textoMensaje, 'en el chat seleccionado:', chatSeleccionado);
        //aqui se deberia enviar el mensaje al servidor de socket.io usando el servicio socketIOService, y luego actualizar el estado global de cliente.misChats con el nuevo mensaje enviado, para que se muestre en el historial de mensajes del chat seleccionado
        socketIOService.sendMessage('nuevoMensaje', 
                                    JSON.stringify(
                                        { 
                                            idChat: chatSeleccionado._id,
                                            contenido: textoMensaje,
                                            idProducto: chatSeleccionado.anuncioProducto.id,
                                            idVendedor: chatSeleccionado.idVendedor, //<---- siempre va el id del cliente vendedor, pq se saca del producto q ha anunciado el cliente vendedor
                                            idEmisor: cliente._id, //<---- puede ir del cliente comprador o del vendedor
                                            timestamp: Date.now(),
                                            checked: false,
                                            tipoMensaje: 'texto'
                                             }
                                            ) 
                                    );
        setTextoMensaje('');
    }

    return (
            <div className="container">
                <div className="row">
                    <div className="col-3">
                        <h2>Bandeja de entrada</h2>
                        <hr/>
                        
                        <ul className="list-group list-group-flush">
                            {
                                chats.length > 0 ?
                                    chats.map(
                                        chat => 
                                        <li  className="list-group-item" style={{ cursor: 'pointer' }} onClick={() => setChatSeleccionado(chat)}>
                                            <div className="card mb-3">
                                                <div className="row g-0">
                                                    <div className="col-md-4">
                                                        <img src={chat.anuncioProducto.fotoPortada} className="img-fluid rounded" alt="..." />
                                                    </div>
                                                    <div className="col-md-8">
                                                        <div className="card-body">
                                                            <div className="d-flex flex-row justify-content-between">
                                                                { chat.mensajes.length > 0 && 
                                                                    <>                                                                    
                                                                        <p className="card-text"><small className="text-body-secondary">{chat.mensajes[-1].enviadoPorComprador ? 'Tú' : chat.idVendedor}</small></p>
                                                                        <p className="card-text"><small className="text-body-secondary">{chat.mensajes[-1].timestamp}</small></p>
                                                                    </>
                                                                }
                                                            </div>
                                                            <p className="card-text"><strong>{chat.anuncioProducto.titulo}</strong></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>                            
                                    )
                            : 
                                <li className="list-group-item">No tienes chats abiertos</li>
                            }
                        </ul>
                    </div>

                    <div className="col-6  d-flex flex-column align-items-stretch" >
                        {/* aqui se mostraria del chat seleccionado,  su historial de mensajes y un input para enviar nuevos mensajes */}

                                    <div className="border rounded-3 p-3" style={{ height: '600px', overflowY: 'auto' }}>

                                    </div>

                                    <div className="input-group mt-3">
                                        <input  type="text" className="form-control txt-mensaje" placeholder="Escribe tu mensaje..." onInput={ (e) => setTextoMensaje(e.target.value) }/>
                                        <button className="btn-send-mensaje" onClick={ EnviarMensaje}><i className="fa-solid fa-paper-plane" ></i></button>
                                    </div>

                    </div>

                    <div className="col-3">
                        { chatSeleccionado && (
                            <div className="card">
                                <img src={chatSeleccionado.anuncioProducto.fotoPortada} className="card-img-top rounded" alt="..." />
                                <div className="card-body">
                                    <h6>{chatSeleccionado.anuncioProducto.titulo}</h6>
                                    <div className="d-flex flex-row justify-content-between">
                                        <p className="card-text"><small className="text-body-secondary">{chatSeleccionado.anuncioProducto.precio} €</small></p>
                                        <div className="d-flex flex-row gap-2">
                                            <small className="text-body-secondary"><i className="fas fa-eye"></i> {chatSeleccionado.anuncioProducto.visitas || 0}</small>
                                            <small className="text-body-secondary"><i className="fas fa-heart"></i> {chatSeleccionado.anuncioProducto.likes || 0}</small>
                                        </div>                                        
                                    </div>
                                </div>
                            </div>
                        ) }
                    </div>

                </div>
            </div>
    );
}

export default Buzon;