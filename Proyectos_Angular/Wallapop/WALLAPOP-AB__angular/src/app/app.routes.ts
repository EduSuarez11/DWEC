import { Routes } from '@angular/router';
import { Dashboard } from './componentes/zonaCliente/Dashboard/dashboard';
import { authControlGuard } from './guards/auth-control-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/Portal/Inicio', pathMatch: 'full' },
    { path:'Cliente', 
      children:[
        { path:'LoginEmail', loadComponent: () => import('./componentes/zonaCliente/Login/LoginEmail/LoginEmailSignalForm/login-email-signal-form').then(m => m.LoginEmailSignalForm) },
        { path:'Login', loadComponent: () => import('./componentes/zonaCliente/Login/LoginOAuth/login-oauth') .then(m => m.LoginOAuth) },
        { path:'Registro', loadComponent: () => import('./componentes/zonaCliente/Registro/registro') .then(m => m.Registro) },
        { path:'Dashboard', 
          component: Dashboard,
          canActivate: [ authControlGuard ], //protegemos las rutas del dashboard con el guard de control de autenticacion, solo se podran acceder si el cliente esta autenticado, sino se redirigirá al login
          children:[
                { path:'Compras', loadComponent: () => import('./componentes/zonaCliente/Dashboard/Compras/compras').then(m => m.Compras) },
                { path:'Ventas', loadComponent: () => import('./componentes/zonaCliente/Dashboard/Ventas/ventas').then(m => m.Ventas) },
                { path:'Buzon', loadComponent: () => import('./componentes/zonaCliente/Dashboard/Buzon/buzon').then(m => m.Buzon) },
                { path:'Buzon/:idChat', loadComponent: () => import('./componentes/zonaCliente/Dashboard/Buzon/buzon').then(m => m.Buzon) },
                { path:'TuCatalogo/:id', loadComponent: () => import('./componentes/zonaCliente/Dashboard/TuCatalogo/tu-catalogo').then(m => m.TuCatalogo) },
              ]
            }

      ]
    },
    {
        path:'Portal',
        children:[
            { path:'Inicio', loadComponent: () => import('./componentes/zonaPortal/Inicio/inicio').then(m => m.Inicio) },
            { path: 'Producto/:idCliente/:idProducto', loadComponent: () => import('./componentes/zonaPortal/AnuncioProducto/producto').then(m => m.Producto) }            
        ]
    }
];
