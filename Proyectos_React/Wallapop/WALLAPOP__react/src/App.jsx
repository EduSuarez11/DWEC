//componente raiz de la aplicacion donde defino las rutas 
//la funcion "createBrowserRouter": https://reactrouter.com/api/data-routers/createBrowserRouter  en la api: https://api.reactrouter.com/v7/functions/react-router.createBrowserRouter.html
// admite como parametros:
//- un array de objetos RouteObject con las rutas y los componentes a renderizar (tb puedes especificar rutas anidadas, loaders, actions, middlewares, ...)
//     objeto RouteObject: la api: https://api.reactrouter.com/v7/types/react-router.BaseRouteObject.html en la doc con ejemplos:https://reactrouter.com/start/data/route-object
// - un objeto de opciones con configuraciones adicionales (opcional): DOMRouterOpts
//
//la funcion createBrowserRouter devuelve un objeto DataRouter que se pasa como prop. al componente RouterProvider para que se encargue de renderizar los componentes correspondientes a cada ruta 
// y gestionar la navegación entre ellas.

import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import Lauyout from "./componentes/zonaPortal/Layout/Layout";
// import Header from './componentes/zonaPortal/Layout/Header/Header';
// import Footer from './componentes/zonaPortal/Layout/Footer/Footer';
import Registro from './componentes/zonaCliente/Registro/Registro';
import Login from './componentes/zonaCliente/Login/Login';
import LoginEmail from './componentes/zonaCliente/Login/LoginEmail';
import { fetchNodePortal } from "./servicios/fetchNode";
import TuCatalogo from "./componentes/zonaCliente/Dashboard/TuCatalogo/TuCatalogo";
import Dashboard from "./componentes/zonaCliente/Dashboard/Dashboard";

import useGlobalState from "./zustandGlobalState/globalState";
import { useCheckAccessTokenValidate, useCheckUserData } from "./Route_middlewares/middlewares";
import Inicio from "./componentes/zonaPortal/Inicio/Inicio";
import Producto from "./componentes/zonaPortal/AnuncioProducto/Producto";
import Buzon from "./componentes/zonaCliente/Dashboard/Buzon/Buzon";

function App() {

  const { datosCliente, tokens } = useGlobalState(); //usamos el metodo getState del store de Zustand para acceder a los datosCliente sin necesidad de usar el hook useGlobalState, que solo se puede usar dentro de componentes funcionales de React...esta funcion checkUserData se ejecuta antes de cargar el componente Dashboard, por lo que no podemos usar el hook useGlobalState dentro de esta funcion, pero si podemos usar el metodo getState del store para acceder a los datosCliente y comprobar si hay datos de usuario o no.
  
  //#region ------- funciones middleware objetos route ------------
  function checkUserData( { request,params,context }, next ) {
      //funcion para comprobar si en storage hay datos de usuario, sino los hubiera redirigimos al login...

      console.log('Datos cliente en middleware checkUserData: ', datosCliente);
      if(!datosCliente) {
          throw redirect('/Cliente/Login'); //si no hay datosCliente, redirigimos a Login
      }
      next(); //si hay datosCliente, continuamos con siguiente funcion del middleware o con la carga del componente Dashboard 
  }

  function checkAccessTokenValidate( { request,params,context }, next ) {
    //funcion para comprobar si el accessToken del usuario es valido, sino lo es redirigimos al login...(como si no exisitiese el refreshtoken para renovar el accessToken)
    // esta funcion se podria ejecutar despues de checkUserData, ya que si no hay datosCliente, no tiene sentido comprobar el accessToken...
    console.log('Tokens en middleware checkAccessTokenValidate: ', tokens);
  }
  //#endregion ----------------------------------------------------



  const routerObjects=createBrowserRouter(
    [
      {
        Component: Lauyout,
        loader: async ( loaderFunctArgs )=>{
          //objeto parametro de la funcion LoaderFunction: https://api.reactrouter.com/v7/interfaces/react-router.LoaderFunctionArgs.html
          //tiene como props:     context: Context; params: Params; request: Request; unstable_pattern: string; unstable_url: URL;
          //ejemplo de loader para recuperar las categorias desde el backend y pasarlas al componente Header a traves del hook useLoaderData
          console.log('loader de ruta / ejecutado con argumentos:', loaderFunctArgs);
          
          const url = new URL(loaderFunctArgs.request.url);
          console.log('url del loader de ruta /:', url);

          const respuesta = await fetchNodePortal.getCategorias(url.searchParams.get('pathCat')||'principales'); //devuelve un array con las categorias, que se recupera en el componente Header con el hook useLoaderData() y se muestra en el navbar
          return respuesta.categorias;
        },
        children:[
          { path: '/', Component: Inicio }, //ruta raiz, se podria poner un componente de bienvenida o algo asi, o directamente redirigir a /Cliente/Login si no hay datosCliente en storage, o a /Cliente/Dashboard si ya hay datosCliente en storage...pero mejor dejar la ruta raiz para el componente de inicio o bienvenida, y que desde ahi el usuario pueda navegar a las diferentes secciones de la app segun sus intereses y necesidades...ademas de que asi tenemos una ruta raiz con su propio componente, que es lo mas normal en una app, y no una redireccion directa a otra ruta...ademas de que asi podemos mostrar un mensaje de bienvenida o algo asi en la ruta raiz, para hacerla mas atractiva y amigable para el usuario...ademas de que asi tenemos una ruta raiz con su propio componente, que es lo mas normal en una app, y no una redireccion directa a otra ruta...ademas de que asi podemos mostrar un mensaje de bienvenida o algo asi en la ruta raiz, para hacerla mas atractiva y amigable para el usuario...
          {  path: '/Producto/:idCliente/:id',
            Component: Producto, 
            loader: async ({request, params}) => { 
                return await fetchNodePortal.GetProductosVenta({ idVendedor: params.idCliente, idProducto: params.id}) 
              } 
          },          
          {
            path:'Cliente',
            children:[
              { path:'Registro', Component: Registro}, // lazy:  () => import('./componentes/zonaCliente/Registro/Registro') 
              { path:'Login',   Component: Login }, //lazy:  () => import('./componentes/zonaCliente/Login/Login')
              { path:'LoginEmail', Component: LoginEmail}, //lazy:  () => import('./componentes/zonaCliente/Login/LoginEmail')
              { path:'Dashboard',
                Component:  Dashboard,
                //middleware: [useCheckUserData(), useCheckAccessTokenValidate() ], //aqui se podria poner un middleware para proteger la ruta y que solo puedan acceder los usuarios autenticados...pero mejor hacerlo con un loader que verifique si el usuario esta autenticado antes de cargar el componente Dashboard
                //middleware: [checkUserData, checkAccessTokenValidate ], //aqui se podria poner un middleware para proteger la ruta y que solo puedan acceder los usuarios autenticados...pero mejor hacerlo con un loader que verifique si el usuario esta autenticado antes de cargar el componente Dashboard
                children:[
                  { path:'Compras', lazy:  () => import('./componentes/zonaCliente/Dashboard/Compras/Compras') }, //Component: Compras
                  { path:'Ventas', lazy:  () => import('./componentes/zonaCliente/Dashboard/Ventas/Ventas') }, //Component: Ventas
                  { path:'TuCatalogo/:operacion', 
                    Component: TuCatalogo, 
                  //mejor hacerlo con useMemo en el componente TuCatalogo, para evitar que se vuelva a cargar la categoria cada vez que se renderiza el componente, o con sist.de cache basado en dataStrategy de react-router, ya que con la estrategia de cacheo personalizada,
                  //  solo se cargaria la categoria la primera vez que se accede a la ruta, y las siguientes veces se obtendria de la caché, pero lo ideal seria usar useMemo para memorizar el resultado de la carga de la categoria y evitar llamadas
                  //  innecesarias al backend incluso con la caché, ademas de que asi tendriamos mas control sobre cuando se vuelve a cargar la categoria, por ejemplo, si el usuario cambia la categoria seleccionada en el select,
                  //  podríamos invalidar la cache y volver a cargar la categoria con el nuevo pathCategoria seleccionado por el usuario.                    
                    loader: async ( { request, params } ) => {
                       const petCatsPpales=await fetchNodePortal.getCategorias('principales');
                       return petCatsPpales.categorias;
                     },
                  } ,
                  { path:'Buzon/:idChat?', Component: Buzon}, //Component: Buzon
                  { path:'Favoritos', lazy:  () => import('./componentes/zonaCliente/Dashboard/Favoritos/Favoritos') } //Component: Favoritos
                ]
              }
            ]
          }
        ]
      }




    ]
  );



  return (
    <RouterProvider router={routerObjects}>
      {/* metemos todo esto en un componente layout mejor...
       <div className="container-fluid">
        
        <div className="row">
          <div className="col">
            <Header />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Outlet />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Footer />
          </div>
        </div>

      </div> */}
    </RouterProvider>

  )
}

export default App
