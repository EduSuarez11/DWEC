import './SubirTuAnuncio.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import useGlobalState from '../../../../../zustandGlobalState/globalState';
import fetchNode from  '../../../../../servicios/fetchNode';

import SeccionTitulo from './Seccion_1_TituloAnuncio/SeccionTitulo';
import SeccionFotos from './Seccion_2__Fotos/SeccionFotos';
import SeccionCategoria from './Seccion_3__Categoria/SeccionCategoria';
import SeccionInformacionProducto from './Seccion_4__InformacionProducto/SeccionInformacionProducto';
import SeccionEnvio from './Seccion_5__Envio/SeccionEnvio';

function SubirTuAnuncio(){
    const [showFotos, setShowFotos] = useState(false);
    const [ showCategoria, setShowCategoria ] = useState(false);
    const [ showInformacionProducto, setShowInformacionProducto ] = useState(false);

    const [ anuncio, setAnuncio ] = useState({
        titulo: '',
        fotos: [], //<---- array de objetos con este formato: { urlImg:URL a meter en src-img, file: objetoFile}
        categoria: '',
        descripcion: '',
        precio: '',
        estado:'',
        pesoEnvio:''
    });

    const { datosCliente, setDatosCliente } = useGlobalState();
    const navigate = useNavigate();

    async function handlerSubmitDatosAnuncio(){
        console.log('datos del anuncio a enviar al backend para crear el anuncio:', anuncio);
        const { fotos, ...datosAnuncio } = anuncio; // aqui habria que procesar el array de fotos para enviar al backend solo los archivos (prop file) y no las urls de las imagenes (prop urlImg) que se usan solo para mostrar la previsualizacion de las imagenes en el frontend, pero por ahora lo dejamos asi para probar a enviar los datos al backend y crear el anuncio sin fotos

        const formData=new FormData(); //<----- creo un Multipart/form-data para enviar los datos del anuncio al backend, porque el anuncio tiene un array de fotos con objetos File que no se pueden enviar en formato JSON, asi que con el FormData puedo enviar los datos del anuncio en formato multipart/form-data y el backend lo puede procesar con multer para guardar las fotos en el servidor y los datos del anuncio en la base de datos
        formData.append('idCliente', datosCliente._id); // aqui se añade al FormData el id del cliente que sube el anuncio, que se recupera del estado global de Zustand, donde se guardan los datos del cliente al hacer login, y que se necesita para asociar el anuncio al cliente que lo sube
        formData.append('datosAnuncio', JSON.stringify(datosAnuncio)); // aqui se añaden al FormData los datos del anuncio excepto las fotos, que se añaden en el siguiente paso
        fotos.forEach(
            objFot => formData.append('fotos', objFot.file) // aqui se añaden al FormData las fotos del anuncio, pero solo los archivos (prop file) y no las urls de las imagenes (prop urlImg) que se usan solo para mostrar la previsualizacion de las imagenes en el frontend
        )

        const resp=await fetchNode.PublicarAnuncio(formData); // aqui se hace la llamada al backend para crear el anuncio, enviando el FormData con los datos del anuncio y las fotos, y el backend lo procesa con multer para guardar las fotos en el servidor y los datos del anuncio en la base de datos 
        console.log('respuesta del backend al crear el anuncio:', resp);

        if(resp.codigo===0){
            //en resp.datos.anuncio se devuelve el anuncio creado en mongod con su _id, lo actualizamos en el state-global de zustand
            alert('Anuncio creado con éxito');
            setDatosCliente( { productosVenta: [ ...datosCliente.productosVenta, resp.datos.anuncio ] } ); // aqui se actualiza el estado global de Zustand con el nuevo anuncio creado, añadiendolo al array de productosVenta del cliente, para que se muestre en su dashboard sin necesidad de recargar la pagina
            navigate('/Cliente/Dashboard/TuCatalogo/published'); // aqui se redirige al cliente a su catalogo de anuncios, donde se muestra el nuevo anuncio creado
        } else {
            // aqui se podria mostrar un mensaje de error al usuario si el backend devuelve un codigo diferente de 0, indicando que hubo un error al crear el anuncio, por ejemplo:
            alert('Error al crear el anuncio: ' + resp.mensaje);
            console.log('Error al crear el anuncio:', resp.mensaje);
        }
    }


    return(
        <div className="container-anuncio">

            <h1 className="titulo">Sube tu anuncio</h1>
            <div className="card-anuncio">
                <h3 className="subtitulo">¿Qué subirás?</h3>
                <div className="opciones">

                    <div className='opcion activa'>
                        <span>Algo que ya no necesito</span>
                    </div>

                    <div className='opcion'>
                        <span>Empleo</span>
                    </div>

                    <div className='opcion'>
                        <span>Mis servicios</span>
                    </div>

                    <div className='opcion'>
                        <span>Un vehículo</span>
                    </div>

                    <div className='opcion'>
                        <span>Una propiedad</span>
                    </div>
                </div>
            </div>

            <SeccionTitulo anuncio={anuncio} setAnuncio={setAnuncio} setShowFotos={setShowFotos} />
            { showFotos && <SeccionFotos anuncio={anuncio} setAnuncio={setAnuncio} showCategoria={showCategoria} setShowCategoria={setShowCategoria} setShowInformacionProducto={setShowInformacionProducto} /> }
            { showCategoria && <SeccionCategoria anuncio={anuncio} setAnuncio={setAnuncio} setShowInformacionProducto={setShowInformacionProducto} /> }
            { showInformacionProducto && 
                <>
                    <SeccionInformacionProducto anuncio={anuncio} setAnuncio={setAnuncio} />
                    <SeccionEnvio anuncio={anuncio} setAnuncio={setAnuncio} />
                    <section className="secciones" style={{border: 'none'}}>
                        <span style={{fontSize:'0.875rem', lineHeight:'20px', color:'#5c7a89', fontWeight:'400', margin:'0'}}>Revisa toda la información antes de publicar tu anuncio.</span>
                        <button className="walla-button walla-button-primary" disabled={ !anuncio.titulo || !anuncio.descripcion || !anuncio.categoria || !anuncio.precio || !anuncio.estado || !anuncio.fotos[0]  } onClick={handlerSubmitDatosAnuncio}>Subir Producto</button>
                    </section>                    
                </>
        }
        </div>
    )
}
export default SubirTuAnuncio;