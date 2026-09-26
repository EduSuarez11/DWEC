import './SeccionInformacionProducto.css'

function SeccionInformacionProducto({anuncio, setAnuncio}) {
    return (
       <section className="secciones">
            <span className="titulo-1">Información del producto</span>
            <div className="d-flex flex-column gap-3">
                <div className="form-floating">
                    <input type="text" maxLength={50} className="form-control" id="floatingInput" value={anuncio.titulo} onInput={(ev)=> setAnuncio({...anuncio, titulo: ev.target.value }) }/>
                    <label htmlFor="floatingInput">Titulo*</label>
                </div>                
                <div className="form-floating">
                    <textarea className="form-control" style={{minHeight: '100px'}} maxLength={640} wrap="soft" rows="4" placeholder="Descripción del producto" onInput={(ev)=> setAnuncio({...anuncio, descripcion: ev.target.value }) }></textarea>
                    <label htmlFor="floatingTextarea">Descripción*</label>
                </div>
                <div className="d-flex d-row justify-content-between aling-items-center gap-3">
                    <div className="form-floating">
                        <select className="form-select" id="floatingSelectGrid" onChange={(ev) => setAnuncio({...anuncio, estado: ev.target.value }) }>
                            <option value="" disabled defaultValue={''}>Selecciona un estado</option>
                            {
                                [
                                    { value: 'nuevo', label: 'Nuevo (Nunca se ha usado)' },
                                    { value: 'como-nuevo', label: 'Como nuevo (En perfectas condiciones)' },
                                    { value: 'en-buen-estado', label: 'En buen estado (Bastante usado, pero bien conservado)' },
                                    { value: 'en-condiciones-aceptables', label: 'En condiciones aceptables (Con evidentes signos de desgaste)' },
                                    { value: 'lo-ha-dado-todo', label: 'Lo ha dado todo (Puede tener defectos y toque repararlo)' },
                                ].map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))
                            }
                        </select>
                        <label htmlFor="floatingSelectGrid">Estado*</label>
                    </div>
                    <div className="form-floating">
                        <input type="number" className="form-control" id="floatingInputPrecio" placeholder="Precio*" onInput={(ev)=> setAnuncio({...anuncio, precio: ev.target.value }) }/>
                        <label htmlFor="floatingInputPrecio">Precio*</label>
                    </div>
                </div>
            </div>
            <div className="d-flex d-row justify-content-start">
                <img src="/images/dashboard/subetuanuncio/candado.png" alt="Información adicional" style={{width:'24px', height:'24px'}}/>
                <span style={{fontSize:'0.875rem', lineHeight:'20px', color:'#a3b8c1', paddingLeft:'16px', paddingRight:'16px'}}>Añadir más unidades.</span>
                <a href="#" style={{fontSize:'0.875rem',fontWeight:'700' ,lineHeight:'20px', color:'#038673'}}>Saber más</a>
            </div>
        </section>
    )
}
export default SeccionInformacionProducto;