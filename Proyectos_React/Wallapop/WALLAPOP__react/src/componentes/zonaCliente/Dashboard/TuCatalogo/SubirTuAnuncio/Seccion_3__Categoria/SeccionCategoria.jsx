import './SeccionCategoria.css'
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { fetchNodePortal } from '../../../../../../servicios/fetchNode';

function SeccionCategoria({anuncio,setAnuncio,setShowInformacionProducto}) {
    const categorias = useLoaderData();
    const [mostrarSubcategorias, setMostrarSubcategorias] = useState(categorias);

    async function handlerChangeCategoria(ev){
        // aqui se podria hacer una llamada al backend para recuperar las subcategorias de la categoria seleccionada y mostrarlas en otro select debajo del select de categorias...pero por ahora lo dejamos asi
        // si no tiene subcategorias, se mete en el state del anuncio la categoria seleccionada y se muestra la seccion de informacion del producto, si tiene subcategorias, se muestra otro select debajo del select de categorias para que el usuario seleccione la subcategoria y entonces se mete en el state del anuncio la categoria seleccionada junto con la subcategoria seleccionada y se muestra la seccion de informacion del producto
        console.log('categoria seleccionada: ', ev.target.value);
        const subcategorias = await fetchNodePortal.getCategorias(ev.target.value==='volver' ? mostrarSubcategorias[0].pathCategoria.split('-').slice(0,-2) : ev.target.value); // aqui se hace la llamada al backend para recuperar las subcategorias de la categoria seleccionada, pasando como parametro el pathCategoria de la categoria seleccionada, que tiene el formato 'idCategoria-nombreCategoria', y si el usuario selecciona la opcion de volver, se pasa como parametro el idCategoria de la categoria padre, que se obtiene del pathCategoria de la primera subcategoria mostrada en el select, que tiene el formato 'idCategoria-nombreCategoria', y se muestra el select de subcategorias con las subcategorias recuperadas del backend
        if(subcategorias.categorias.length > 0){
            //mostrar en el select de subcategorias
            setMostrarSubcategorias(subcategorias.categorias);
        } else {
            //meter en el state del anuncio la categoria seleccionada y mostrar la seccion de informacion del producto
            setAnuncio({ ...anuncio, categoria: ev.target.value });
            setShowInformacionProducto(true);
        }
    }

    return (
        <section className="secciones">
            <h1 className='titulo-1'>Selecciona una categoría para tu anuncio</h1>
            <h2 className='textInfo'>No te preocupes, te ayudaremos con algunas sugerencias cuando abras el desplegable</h2>

            <div className='form-floating' style={{ width: '100%' }}>
                <select className="form-select" aria-label="Default select example" id="floatingSelectCats" onChange={handlerChangeCategoria} >
                    <option disabled defaultValue={''}>Categoria y subcategoria</option>
                    {                        
                        mostrarSubcategorias.map( cat => <option key={cat.pathCategoria} value={cat.pathCategoria}>{cat.nombreCategoria}</option> )                        
                    }
                    { /^\d+-/.test(mostrarSubcategorias[0]?.pathCategoria) && (<option value="volver" style={{border:'1px solid #007bff'}}>🔙 Volver</option>)}
                </select>
                 <label htmlFor="floatingSelectCats">Works with selects</label>
            </div>
            <button className="botonContinuar align-self-end" disabled={anuncio.titulo.length === 0} onClick={ () => setShowInformacionProducto(true) } >Continuar</button>
        </section>
    )
}
export default SeccionCategoria;