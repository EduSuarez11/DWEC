import { useEffect, useState, useRef } from 'react';
import './OffCanvas.css'
import ListaCategorias from './ListaCategorias/ListaCategorias'
import PanelSubcategorias from './PanelSubcategorias/PanelSubcategorias'

function OffCanvasCats() {
    const [categoriaSeleccionada, setCategoriaSeleccionada]=useState(null)
    const offcanvasRef = useRef(null);

    /*
         hook useEffect() es una funcion js que adminte como parametros:
            - 1º parametro: una funcion q se va a ejecutar siempre y cuando  se cambia el valor de alguna de las variables que se
             definen como dependencia del efecto
            - 2º parametro: un array de variables q al modificar su valor por cualquier motivo (evento, cambio del estado, ...)
                provocara que se ejecute la funcion definida en el 1º parametro

                OJO!!!!! si el array esta vacio, la funcion del 1º parametro se ejecutara una sola vez
                al montar el componente y nunca mas
    */

    // Cuando bootstrap termina de cerrar el offcanvas, cerramos tambien el panel de subcategorias
    useEffect(() => {
        const offcanvasElement = offcanvasRef.current;
        const cerrarPanel = () => setCategoriaSeleccionada(null);

        offcanvasElement.addEventListener('hidden.bs.offcanvas', cerrarPanel);
        return () => offcanvasElement.removeEventListener('hidden.bs.offcanvas', cerrarPanel);
    }, []);


    function handleCategoriaSeleccionada(categoria){
        setCategoriaSeleccionada(categoriaPrevia => (
            categoriaPrevia?._id === categoria._id ? null : categoria
        ))
    }


    return (
        <div className="mt-5 mb-4">
            <button className="btn btn-otuline-secondary"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasWithBothOptions"
                aria-controls="offcanvasWithBothOptions">
                <i className="fa-solid fa-bars"></i> Todas las categorias
            </button>

            <div className="offcanvas offcanvas-start"
                data-bs-scroll="true"
                tabIndex="-1"
                id="offcanvasWithBothOptions"
                aria-labelledby="offcanvasWithBothOptionsLabel"
                ref={offcanvasRef}>

                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">Campañas y ofertas</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <hr></hr>

                <div className="offcanvas-body">
                    <h3><strong>Categorias</strong></h3>
                    {/* <p>....cargar categorias principales invocando a servicio....</p> */}
                    <hr/>
                    <ListaCategorias pathCat='principales'
                                onCategoriaSeleccionada={handleCategoriaSeleccionada}
                                categoriaActiva={categoriaSeleccionada}
                    />
                </div>

                <PanelSubcategorias key={categoriaSeleccionada?._id ?? 'sin-categoria'}
                                categoriaPadre={categoriaSeleccionada}
                                onClose={() => setCategoriaSeleccionada(null)}/>
            </div>
        </div>
    )

}

export default OffCanvasCats