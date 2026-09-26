import './MostrarAnuncios.css';
import useGlobalState from '../../../../../zustandGlobalState/globalState';
import MiniAnuncio from './MiniAnuncio/MiniAnuncio';

function MostrarAnuncios(){
    const { datosCliente } = useGlobalState();

    return(
        <div class="container-fluid">
            <div className="row">
                <h2>Tus productos</h2>
                <p>Aquí podrás subir productos, gestionar los que ya tienes y destacarlos para venderlos antes.</p>
            </div>
            <div className="row mt-3">
                {
                    datosCliente.productosVenta.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                        {
                            datosCliente.productosVenta.map( 
                                    producto => (
                                                <MiniAnuncio key={producto._id} producto={producto} />
                                ) //cierre return del map
                             ) //cierre del map
                        }
                        </div>
                    )
                    : 
                    <p> No tienes productos en venta. </p>
                }
            </div>
        </div>
    )
}
export default MostrarAnuncios;