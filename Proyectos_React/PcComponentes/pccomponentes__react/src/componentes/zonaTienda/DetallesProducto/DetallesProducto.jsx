import './DetallesProducto.css';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

function DetallesProducto() {
    const navigate = useNavigate();
    const param = useParams();
    const [producto, setProducto] = useState({});
    const [imagenAMostrar, setImagenAMostrar] = useState(producto.imagenes && producto.imagenes[0]);

    useEffect(() => {
        async function getProducto() {
            try {
                const reqProducto = await fetch(`http://localhost:3000/api/Tienda/ObtenerProducto/${param.idProducto}`);
                const response = await reqProducto.json();
                if (response.codigo !== 0) throw new Error(response.mensaje);
                console.log('Respuesta del producto: ', response);
                setProducto(response.datos.producto);
            } catch (error) {
                console.log('Error al obtener el producto');
            }
        }

        getProducto();
    }, [])

    return (
        <main className="dp-page container-fluid">

            {/* Ruta de navegación */}
            <nav className="dp-breadcrumb" aria-label="Ruta de navegación">
                <span onClick={() => navigate('/')}>Inicio</span>
                <span>/</span>
                <span>{producto.marca}</span>
                {/* <span>{producto?.nombre}</span> */}
            </nav>

            {/* Zona principal del producto */}
            <section className="dp-product-main">

                {/* Galería de imágenes */}
                <div className="dp-gallery">

                    {/* Imagen principal */}
                    <div className="dp-main-image">
                        <img src={imagenAMostrar ? imagenAMostrar : (producto.imagenes && producto.imagenes[0])} alt={producto?.nombre}/>
                    </div>

                    {/* Carrusel de miniaturas */}
                    <div className="dp-gallery-carousel">
                        <button type="button" className="dp-gallery-arrow" aria-label="Imagen anterior">
                            ‹
                        </button>

                        <div className="dp-thumbnails-track">

                            {producto.imagenes && producto.imagenes.filter(Boolean).map((imagen, index) => (
                                <button
                                    type="button"
                                    className={`dp-thumbnail ${imagen === imagenAMostrar ? "active" : ""}`}
                                    key={`${imagen}-${index}`}
                                    aria-label={`Ver imagen ${index + 1}`}
                                    onClick={() => setImagenAMostrar(imagen)} >
                                    <img src={imagen} alt={`${producto?.nombre} - imagen ${index + 1}`}/>
                                </button>
                            ))}
                        </div>

                        <button type="button" className="dp-gallery-arrow" aria-label="Imagen siguiente">
                            ›
                        </button>

                    </div>

                    {/* Referencias del producto */}
                    <div className="dp-gallery-reference">
                        <span>P/N: {producto.partNumber}</span>
                        <span className="dp-reference-separator">|</span>
                        <span>Cod. Artículo: {producto.sku}</span>
                    </div>

                </div>

                {/* Información del producto */}
                <section className="dp-product-info">
                    <div className="dp-brand">{producto?.marca}</div>

                    <h1 className="dp-product-title">{producto?.nombre}</h1>

                    <div className="dp-rating">
                        <span className="dp-stars" aria-label="Valoración media">★★★★★</span>
                        <strong>{producto?.valoracionMedia}/5</strong>
                        <a href="#opiniones" className="dp-opinions-link">{producto?.numeroOpiniones} opiniones</a>
                    </div>

                    <div className="dp-product-reference">
                        <span>Referencia:</span>
                        <span>{producto?.sku}</span>
                    </div>

                    <div className="dp-highlights">
                        <h2>Lo más destacado</h2>
                        <ul>
                            {(producto?.caracteristicas || []).map(
                                (caracteristica, index) => (
                                    <li key={index}>{caracteristica}</li>
                                )
                            )}
                        </ul>
                    </div>

                </section>

                {/* Panel de precio y compra */}
                <aside className="dp-purchase-card">
                    {producto?.descuento?.porcentaje !== 0 && (
                        <span className="dp-discount">-{producto?.descuento?.porcentaje}%</span>
                    )}

                    <div className="dp-price-container">
                        {producto?.descuento?.porcentaje !== 0 ?
                            <>
                                <span className="dp-current-price text-danger">{(producto?.precio - (producto?.precio * (producto?.descuento?.porcentaje / 100))).toFixed(2)} €</span>
                                <span className="dp-current-price text-decoration-line-through text-secondary">{producto?.precio} €</span>
                            </>
                            :
                            <span className="dp-current-price">{producto?.precio} €</span>
                        }
                    </div>

                    <p className="dp-financing">Financiación disponible</p>

                    <div className="dp-delivery">
                        <p className="dp-delivery-free">Envío gratuito</p>

                        {/* <p>
                            Entrega estimada:
                            <strong> {producto.entregaEstimada}</strong>
                        </p>

                        <p>
                            Vendido y enviado por
                            <strong> {producto.vendedor}</strong>
                        </p> */}
                    </div>
                    <button type="button" className="dp-add-cart">Añadir a la cesta</button>

                    <div className="border border-1 small p-2 mt-4 btn btn-light d-flex justify-content-center" style={{fontSize: 'small'}}>
                        Vendido y enviado por {producto.vendedor}
                    </div>
                </aside>
            </section>

            {/* Navegación entre secciones */}
            <nav className="dp-tabs" aria-label="Información del producto">
                {
                    [
                        {href: '#caracteristicas', label: 'Características'},
                        {href: '#opiniones', label: `Opiniones (${producto?.numeroOpiniones})`},
                        {href: '#preguntas', label: 'Preguntas y respuestas'},
                        {href: '#comparados', label: 'Comparados'},
                        {href: '#sobre-producto', label: 'Sobre el producto'}
                    ].map((tab, pos) => (
                        <a key={pos} href={tab.href} className={pos === 0 ? 'active' : ''}>{tab.label}</a>
                    ))
                }
            </nav>

            {/* Características y especificaciones */}
            <section className="dp-detail-section" id="caracteristicas">
                <h2>Características</h2>

                <div className="dp-specifications">
                    {producto.especificaciones && Object.entries(producto.especificaciones).map(
                        ([comp, especificacion], index) => (
                            <div className="dp-spec-row" key={index}>
                                <span>{comp.charAt(0).toUpperCase() + comp.slice(1)}</span>
                                <strong>{especificacion}</strong>
                            </div>
                        )
                    )}
                </div>
            </section>

            {/* Descripción */}
            <section className="dp-detail-section" id="sobre-producto">
                <h2>Sobre el producto</h2>

                <div className="dp-description">
                    {producto?.descripcion}
                </div>
            </section>

            {/* Opiniones */}
            <section className="dp-detail-section" id="opiniones">
                <h2>
                    Opiniones de los usuarios
                    <span className="dp-section-count">
                        {producto?.numeroOpiniones}
                    </span>
                </h2>

                <div className="dp-placeholder">
                    Aquí se mostrarán las opiniones del producto.
                </div>
            </section>

            {/* Preguntas */}
            <section className="dp-detail-section" id="preguntas">
                <h2>Preguntas y respuestas</h2>

                <div className="dp-placeholder">Aquí se mostrarán las preguntas del producto.</div>
            </section>

            {/* Productos comparados */}
            <section className="dp-detail-section" id="comparados">
                <h2>Productos comparados</h2>

                <div className="dp-placeholder">
                    Aquí se mostrarán los productos comparados.
                </div>
            </section>
        </main>
    );
}

export default DetallesProducto;