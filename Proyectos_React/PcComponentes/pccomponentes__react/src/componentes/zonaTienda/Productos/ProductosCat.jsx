import { useState, useEffect } from 'react';
import './ProductosCat.css'
import { useSearchParams } from 'react-router'

function ProductosCat() {
    const [searchParams] = useSearchParams();
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        async function obtenerProductos() {
            const petProductos = await fetch('http://localhost:3000/api/Portal/ProductosByCat');
            const respJSON = await petProductos.json();
            console.log('Productos: ', respJSON.productos);

            if (respJSON.codigo !== 0) {
                alert(respJSON.mensaje);
            } else {
                setProductos(respJSON.productos);
            }
        }
        obtenerProductos();
    }, []);


    return (
        <div className="container py-4">
            <h3>Estas en la Categoria: <strong>{searchParams.get('nombreCat')}</strong></h3>
            <p>Lista de productos de: <strong>{searchParams.get('nombreCat')}</strong></p>

            <section class="product-grid">
                {
                    productos.length !== 0 ?
                        productos.map((prod, pos) => 
                            <article class="product-card" key={pos}>
                                <div class="product-image-container">
                                    <img src={prod.imagenes[0]} alt={prod.nombre} class="product-image"/>
                                </div>

                                <h2 class="product-name small">{prod.nombre}</h2>

                                <div class="product-rating">
                                    <span class="rating-stars" aria-label="5 estrellas">★★★★★</span>
                                    <span class="rating-number">{prod.valoracionMedia}</span>
                                    <span class="product-opinions">({prod.numeroOpiniones})</span>
                                </div>

                                <p class="product-price">{prod.precio} €</p>
                                <button type="button" class="compare-button">Comparar</button>
                            </article>
                        )
                        :
                        <p>No hay productos disponibles</p>
                }
            </section>
        </div>
    )
}

export default ProductosCat