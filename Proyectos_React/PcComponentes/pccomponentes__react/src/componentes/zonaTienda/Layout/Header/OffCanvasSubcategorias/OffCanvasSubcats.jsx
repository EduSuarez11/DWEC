import { useNavigate } from 'react-router';
import './OffCanvasSubcats.css';
import { useEffect, useState } from 'react';

function OffCanvasSubcats({ categoriaSeleccionada }) {
    const [subcategorias, setSubcategorias] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function obtenerSubcategorias() {
            const petSubcategorias = await fetch('http://localhost:3000/api/Cliente/Subcategorias');
            const respJSON = await petSubcategorias.json();

            console.log('Subcategorias: ', respJSON.datos.subcategorias);
            if (respJSON.codigo !== 0) {
                alert(respJSON.mensaje);
            } else {
                setSubcategorias(respJSON.datos.subcategorias);
            }
        }

        obtenerSubcategorias();
    }, [categoriaSeleccionada])

    //console.log('Subcategorias: ', subcategorias)
    //console.log('Subcategoria filtrada: ', subcategorias.filter(subcat => subcat?.pathCat.split('-')[0] === categoriaSeleccionada?.pathCat));
    //console.log('Categoria seleccionada: ', categoriaSeleccionada);

    return (
        <div className='mt-4 ms-3'>
            <div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasSubcats" aria-labelledby="offcanvasSub">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title fw-bold" id="offcanvasSub">{categoriaSeleccionada?.nombre}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <p>Todo en {categoriaSeleccionada?.nombre}</p>
                    <div className="list-group">
                        {
                            subcategorias.length !== 0 ?
                            subcategorias.filter(subcat => subcat?.pathCat.split('-')[0] === categoriaSeleccionada?.pathCat).map((subcat, pos) => 
                                <button key={pos} type="button" className="list-group-item list-group-item-action" onClick={() => navigate(`/Productos/Categoria?nombreCat=${categoriaSeleccionada?.nombre}`)}>{subcat.nombre}</button>
                            )
                            : 
                            <p>No existen subcategorias de {categoriaSeleccionada?.nombre}</p>
                        }
                    </div>
                </div>
            </div>
        </div>


        // <aside class="subcategory-panel" id="subcategoryPanel" aria-label="Subcategorías" aria-hidden="true">
        //     <div class="panel-header">
        //         <h2 id="subcategoryTitle">Subcategorías</h2>

        //         <button type="button" class="close-panel" id="closeSubcategories" aria-label="Cerrar subcategorías">&times;</button>
        //     </div>

        //     <div class="panel-content" id="subcategoryContent">
        //         {
        //             subcategorias.length !== 0 ?
        //                 subcategorias.filter(subcat => subcat?.pathCat.split('-')[0] === categoriaSeleccionada?.pathCat).map((subcat, pos) =>
        //                     <button key={pos} type="button" className="list-group-item list-group-item-action" onClick={() => navigate(`/Productos/Categoria?nombreCat=${categoriaSeleccionada?.nombre}`)}>{subcat.nombre}</button>
        //                 )
        //                 :
        //                 <p>No existen subcategorias de {categoriaSeleccionada?.nombre}</p>
        //         }

        //     </div>
        // </aside>
    )
}

export default OffCanvasSubcats;