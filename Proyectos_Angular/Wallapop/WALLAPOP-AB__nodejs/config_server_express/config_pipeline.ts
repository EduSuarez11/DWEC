import cors from 'cors';
import express, { Express } from 'express';
import routerCliente from './config_enrutamiento/endPointsCliente';
import routerPortal from './config_enrutamiento/endPointsPortal';

export default function config_pipeline(servWeb:Express):void {    
//configuramos CORS para permitir:
// - solo peticiones de mi cliente Angular que corre en localhost:4200 <---- propiedad "origin" del objeto de opciones de CORS
// - permitir solo metodos GET y POST  <------------------------------------ propiedad "methods" del objeto de opciones de CORS
// - permitir envio de cabeceras de autorizacion con tokens JWT y/o cookies <--- propiedad "credentials"
// - permitir cabeceras personalizadas con refresh token <------------------------- propiedad "allowedHeaders" del objeto de opciones de CORS
servWeb.use(
    cors(
            {
                origin: ['http://localhost:4200'],
                methods: ['GET', 'POST'],
                credentials: true,
                allowedHeaders: ['Authorization', 'X-Refresh-Token', 'Content-Type']
            }
        )
);
servWeb.use(express.json({limit: '10mb'})); //para poder procesar cuerpos de peticiones con JSON de hasta 10mb, necesario para el endpoint de subir anuncio, porque el cliente angular le manda un JSON con los datos del anuncio y las fotos codificadas en base64, lo cual puede superar el limite por defecto de 100kb de express.json()
servWeb.use(express.urlencoded({extended:true}));

    
    servWeb.use('/api/Cliente', routerCliente);
    servWeb.use('/api/Portal', routerPortal);
}