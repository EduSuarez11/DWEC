import { useState, useEffect } from 'react';
import './ProductosCat.css'
import { useSearchParams } from 'react-router'
import MiniProducto from '../Productos/MiniProducto/MiniProducto';

function ProductosCat() {
    const [searchParams] = useSearchParams();
    const [productos, setProductos] = useState([]);
    const pathCat = searchParams.get('pathCat') || '';

    useEffect(() => {
        async function obtenerProductos() {
            const petProductos = await fetch(`http://localhost:3000/api/Portal/Productos?byPathCat=${pathCat}`);
            const respJSON = await petProductos.json();
            console.log('Productos: ', respJSON.productos);

            if (respJSON.codigo !== 0) {
                alert(respJSON.mensaje);
            } else {
                setProductos(respJSON.productos);
            }
        }
        obtenerProductos();
    }, [pathCat]);


    return (
        <div className="d-flex flex-column justify-content-center align-items-center ">
            {
                productos.length === 0 ? (
                    <div className="text-muted">No hay productos en esta categoría</div>
                ) : (
                    <div className="productos-cat-grid">
                        {
                            productos.map(
                                producto => (
                                    <div key={producto._id} className="producto-cat-item">
                                        <MiniProducto producto={producto} />
                                    </div>
                                )
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default ProductosCat