import './SeccionFotos.css'
import { useRef,useEffect } from 'react';

function SeccionFotos({anuncio,setAnuncio, showCategoria, setShowCategoria,setShowInformacionProducto}) {
    const refInputFile = useRef(null);

     useEffect(() => {
        // Limpia los objetos URL para evitar fugas de memoria
        if(anuncio.fotos.length === 0) {
            refInputFile.current.value = null; // Limpia el input file para permitir subir las mismas fotos después de eliminarlas
            setShowCategoria(false); // Si no hay fotos, volvemos a ocultar la sección de selección de categoría
            setShowInformacionProducto(false); // Si no hay fotos, volvemos a ocultar la sección de información del producto
        }
        return () => {
            anuncio.fotos.forEach(foto => URL.revokeObjectURL(foto.urlImg));
        };
    }, [anuncio.fotos]);
   

    function __procesaImagenes(archivos){
        if( anuncio.fotos.length + archivos.length > 10) {
            alert('No puedes subir mas de 10 fotos');
            return;
        } 
        const nuevasFotos = archivos.map( archivo => {
            const urlImg = URL.createObjectURL(archivo); //<--- esto lo puedes meter ya directamente en el src de la img, no es necesario un FileReader
            return { urlImg, file: archivo };
        });
        setAnuncio({ ...anuncio, fotos: [...anuncio.fotos, ...nuevasFotos] });
    }

    function LeerImagenes(ev){
        const ficherosImag=Array.from(ev.target.files);
        __procesaImagenes(ficherosImag);
    }

    function DropImagenes(ev){
        ev.preventDefault();
        const ficherosImag=Array.from(ev.dataTransfer.files).filter( fich => fich.type.startsWith('image/'));
        __procesaImagenes(ficherosImag);
    }

    return (
             <section className='secciones'>
                    <h1 className='titulo-foto'>Fotos</h1>

                    <div style={{ border: '2px dashed #5c7a89', borderRadius: '10px' }} className='p-4 cont-input' draggable onDragOver={ ev => ev.preventDefault() }  onDrop={ DropImagenes} >

                        <div className='d-flex flex-wrap gap-3'>
                            <input type='file' hidden multiple accept='image/*' ref={refInputFile} onChange={LeerImagenes} />
                            <button className='botonFotos' onClick={() => refInputFile.current.click()} >Subir fotos</button>
                            <div className='d-flex flex-column justify-content-start'>
                                <span className='textoNormal'>Arrastra tus fotos aquí</span>
                                <span className='textoPequenio'>Formatos aceptados: JPEG, PNG y WebP. Tamaño límite: 10 MB por archivo.</span>
                            </div>
                        </div>
                    </div>

                    <div className='divFotos'>
                        {
                            Array.from({ length: 10 }).map((_, pos) =>
                                <div className='botonImagen' key={pos} onClick={() => !anuncio.fotos[pos] && refInputFile.current.click()}>
                                    <img src={ anuncio.fotos[pos] ? anuncio.fotos[pos].urlImg : '/images/dashboard/subetuanuncio/fotoDefault.png'} className={ anuncio.fotos[pos] ? 'imagenPreview' : ''} /> 
                                     { (pos === 0 && anuncio.fotos[0]) && <span className="badge bg-primary" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>PORTADA</span> }
                                    {
                                        anuncio.fotos[pos] &&
                                        <>
                                            <button className='deleteImage' type="button" data-bs-toggle="modal" data-bs-target="#delImg">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                                </svg>
                                            </button>

                                            <div className="modal fade" id="delImg" tabIndex="-1" aria-labelledby="labelDel" aria-hidden="true">
                                                <div className="modal-dialog">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h1 className="modal-title fs-5" id="labelDel">¿Seguro que quieres borrar la foto?</h1>
                                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        {/* <div className="modal-body">
                                                            ...
                                                        </div> */}
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No, mantenerla</button>
                                                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => setAnuncio({ ...anuncio, fotos: anuncio.fotos.filter((_, index) => index !== pos) })} >Si, eliminarla</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </>
                                    }
   
                                </div>
                            )
                        }
                    </div>
                    <button className="botonContinuar align-self-end mt-3" aria-disabled={showCategoria} disabled={anuncio.fotos.length < 0} onClick={() => setShowCategoria(true)} >Continuar</button>
             </section>
    )
}
export default SeccionFotos;