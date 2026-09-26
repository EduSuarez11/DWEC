import './ProdsLastSearch.css';

function ProdsLastSearch() {
    return (
            <div className="d-flex flex-column justify-content-start">
                <div className="d-flex flex-row justify-content-start align-items-center m-1 gap-2">
                    <img src="/images/inicio/empty-image.png" alt="ultima busqueda-1" className="img-fluid rounded" style={{height: '100%px', width: '100%'}}/>
                    <div className="d-flex flex-column justify-content-start m-1 gap-2">
                        <img src="/images/inicio/empty-image.png" alt="ultima busqueda-1" className="img-fluid rounded" style={{height: '100px', width: '100px'}}/>
                        <img src="/images/inicio/empty-image.png" alt="ultima busqueda-2" className="img-fluid rounded" style={{height: '100px', width: '100px'}}/>
                    </div>
                </div>

                <span style={{color: '#29363d', fontSize: '1.25rem', lineHeight: '28px', fontWeight: 600}}>Ultima búsqueda</span>
                <span style={{color: '#5c7a89', fontSize: '1rem', lineHeight: '24px'}}> ... texto de la ultima busqueda ...</span>
            </div>        
    );
}
export default ProdsLastSearch;