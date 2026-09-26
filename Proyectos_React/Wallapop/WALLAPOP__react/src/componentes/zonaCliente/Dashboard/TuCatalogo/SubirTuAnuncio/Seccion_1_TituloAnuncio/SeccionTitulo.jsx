import './SeccionTitulo.css'

function SeccionTitulo({anuncio,setAnuncio, setShowFotos}) {
    console.log('valor del state del padre...',anuncio);

    return (
            <section className="secciones mt-4">
                <h1 className='titulo-1'>Informacion del producto</h1>
                <h2 className='textInfo'>¿Qué vendes? Proporciona toda la información relevante</h2>

                <div>
                    <div className="form-floating">
                        <input type="text" className="form-control" id="floatingInput" placeholder="Resumen del producto" maxLength={50} onInput={(ev) => setAnuncio({ ...anuncio, titulo: ev.target.value })} />
                        <label htmlFor="floatingInput">Resumen del producto</label>
                    </div>

                    <div className="contador">
                        <span className="miniTexto">Ejemplo: Sofá de dos plazas de cuero rojo marca Cozy. Buen estado.</span>
                        <span>{anuncio.titulo.length}/50</span>
                    </div>
                </div>
                <button className="botonContinuar align-self-end" disabled={anuncio.titulo.length === 0} onClick={() => setShowFotos(true)} >Continuar</button>
            </section>
    )
}
export default SeccionTitulo;