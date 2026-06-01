//modulo de codigo para configurar la PIPELINE de express
//exporta una funcion que recibe como parametro el servidor express recibido del modulo principal "server.js"
//a configurar y dentro de la funcion se configuran los modulos MIDDLEWARE que procesan las peticiones http-request
//de los clientes
//modulo para gestionar politicas CORS en express (hacer servidor accesible desde otros dominios)

const cors=require('cors');
const cookiesParser=require('cookie-parser');
const express=require('express');
//objeto de enrutamiento Router de express para gestionar rutas /api/Cliente/...
//exportado desde el modulo endPointsCliente.js y metiendolo en variable objetoRoutingCliente:
const objetoRoutingCliente=require('./config_enrutamiento/endPointsCliente.js'); 
const objetoRoutingTienda=require('./config_enrutamiento/endPointsTienda.js'); 

module.exports=(serverExpress)=>{
    //configurar modulos MIDDLEWARE de express, cada modulo es una funcion javascript con 3 parametros:
    // 1) request (objeto que representa la peticion http que le llega del cliente si es el primer modulo de la pipeline, sino
    //   request es el objeto modificado por el modulo anterior en la pipeline)
    // 2) response (objeto que representa la respuesta http que se le va a enviar al cliente por el modulo actual)
    // 3) next (funcion que se llama para pasar el control al siguiente modulo de la pipeline), 

    // el metodo .use() de express sirve para configurar/añadir un modulo MIDDLEWARE en la pipeline de express
    //el primer parametro es la RUTA (path) en la que se activa el modulo, si no se pone nada se activa en todas las rutas
    //el segundo parametro es la funcion que define el modulo MIDDLEWARE con los 3 parametros mencionados antes
    
    //---funciones middleware para todas las rutas, generalmente de paquetes de terceros (modulos npm)---
    //configurar el 1º modulo middleware cookie-parser para gestionar cookies en express, las cookies se van a almacenar en objeto req.cookies
    //console.log(`el valor de la variable cookieParser es: ${cookiesParser}`);
    serverExpress.use(cookiesParser()); 
    //configurar el 2º modulo middleware express.json() para gestionar peticiones http POST con cuerpo en formato json, se almacena en req.body
    //console.log(`el valor de la variable express.json es: ${express.json}`);
    serverExpress.use(express.json());

    //configurar el 3º modulo middleware express.urlencoded() para gestionar peticiones http GET con variables en url, se almacena en req.query
    //console.log(`el valor de la variable express.urlencoded es: ${express.urlencoded}`);
    serverExpress.use(express.urlencoded({extended:false})); //{extended:true} para que admita objetos complejos en las variables de url
    
    //configurar el 4º modulo middleware cors() para gestionar politicas CORS en express
    //console.log(`el valor de la variable cors es: ${cors}`);
    serverExpress.use(cors());

    //----funciones middleware para rutas personalizadas....
    serverExpress.use('/api/Cliente', objetoRoutingCliente);
    serverExpress.use('/api/Tienda', objetoRoutingTienda);
} 