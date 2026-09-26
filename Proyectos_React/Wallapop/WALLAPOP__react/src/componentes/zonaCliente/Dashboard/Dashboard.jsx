import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import useGlobalState from "../../../zustandGlobalState/globalState";

function Dashboard() {
  
const navigate = useNavigate();
//#region -------------- CODIGO IMPORTANTE: ESTA RUTA DEBE SER PROTEGIDA, SOLO PARA USUARIOS AUTENTICADOS...mejor hacerlo con loader/middleware -----------------
//   const { datosCliente } = useGlobalState();

//   useEffect( () => {
//     console.log('Datos cliente en Dashboard: ', datosCliente);
//     if(!datosCliente) navigate('/Cliente/Login'); //si no hay datosCliente, redirigimos a Login

//   }, [datosCliente, navigate] );
//#endregion ----------------------------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="container mt-4 mb-4">
        <div className="row">
            <div className="col-2">
                {/*navbar lateral con las opciones de Dashboard: Compras, Ventas, TuCatalogo, Buzon y Favoritos... */}
                <ul className="list-group list-group-flush">
                    {
                        [
                            { "titulo": "Compras", "path": "/images/dashboard/layout/compras.png"},
                            { "titulo": "Ventas", "path": "/images/dashboard/layout/ventas.png" },
                            { "titulo": "Tu Catalogo/published", "path": "/images/dashboard/layout/tucatalogo.png" },
                            { "titulo": "Buzón", "path": "/images/dashboard/layout/buzon.png" },
                            { "titulo": "Favoritos", "path": "/images/dashboard/layout/favoritos.png" },
                            { "titulo": "Estadísticas", "path": "/images/dashboard/layout/estadisticas.png" },
                            { "titulo": "Wallapop PRO", "path": "/images/dashboard/layout/wallapoppro.png" },
                            { "titulo": "Monedero", "path": "/images/dashboard/layout/monedero.png" },
                            { "titulo": "Tu impacto positivo", "path": "/images/dashboard/layout/tuimpactopositivo.png" },
                            { "titulo": "Ayuda", "path": "/images/dashboard/layout/ayuda.png" },
                            { "titulo": "Consultas en curso", "path": "/images/dashboard/layout/consultasencurso.png"  }
                        ].map( (opcion,index) =>
                            <li key={index} className="list-group-item" onClick={ ()=> navigate(`/Cliente/Dashboard/${opcion.titulo.replace(' ','')}`) } style={{cursor:'pointer'}}>
                                <div className="d-flex flex-row align-items-center">
                                    <img src={opcion.path} alt={opcion.titulo} className="me-3" width="30" height="30" />
                                    <span className="mb-0">{opcion.titulo.includes('Tu Catalogo') ? opcion.titulo.split('/')[0] : opcion.titulo }</span> 
                                </div>
                            </li>
                        )
                    }
                </ul>                
            </div>
            
            <div className="col-10">
                <Outlet /> {/*-- el Outlet es el espacio donde se renderizaran los componentes de las rutas hijas de Dashboard, en este caso: Compras, Ventas, TuCatalogo, Buzon y Favoritos --*/}
            </div>            
        </div>

    </div>
  )
}
export default Dashboard;