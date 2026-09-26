//modulo de codigo para configurar la PIPELINE de express
//exporta una funcion que recibe como parametro el servidor express recibido del modulo principal "server.js"
//a configurar y dentro de la funcion se configuran los modulos MIDDLEWARE que procesan las peticiones http-request
//de los clientes

//#region------------------- configuracion de pipeline de middlewares para el servidor web -------------------
/* cliente ----> http-request -----> servidor web express (mod:server.js)
                    |                       PIPELINE DE MIDDLEWARES(un middleware es una funcion js q recibe como parametros:
                                             request-cliente, response-servidor, funcion-para-pasar-control-a-siguiente-middleware)
                    |                      func-1(req,res,next) ---- func-2(req,res,next) ---- func-3(req,res,next) ----...  func-n(req,res,next)
                        |                       |                                                                                   |
                                            si origina respuesta al cliente                                                 SIEMPRE ORIGINAR RESPUESTA en ultima func.middleware
                                            usando parametro: res(objeto HttpResponse) del servidor web express             (suelen coincidir con los endpoints de la API REST montado sobre un servidor web express)
                                            no manda pet. al siguiente middleware

                                            si no origina respuesta al cliente, manda pet. al siguiente middleware usando el parametro: next()


  para meter esas funciones middleware en la pipeline del servidor web express, se usan metodos:
   .use( opcional-ruta, (req,res,next)=>{.....}) <--- si no esta definida la ruta, la funcion middleware se ejecuta para cualquier peticion 
                                                        http que llegue al servidor web express

    ej:   servWeb.use( (req,res,next)=>{ console.log("middleware 1"); next(); })
    cliente-react:  http://localhost:3000/api/Cliente/Login 
                    http://localhost:3000/api/Cliente/Registro
                    http://localhost:3000/api/Portal/Categorias?pathCat=raices
  
  servWeb.use( (req,res,next)=>{
    console.log("middleware 1: se ejecuta para cualquier peticion http que llegue al servidor web express");
    console.log("==VOY A MODIFICAR EN ESTE MIDDLEWARE el objet Request del serv.web express, añado propiedad .kk con valor 123123==");
    req.kk=123123; //añado propiedad kk al objeto Request del servidor web express, con valor 123123
    next(); 
  });
  
  servWeb.use( "/api/Cliente/Login", (req,res,next)=>{
    console.log("--middleware-2 q se ejecuta solo para /api/Cliente/Login del servidor web express");
    console.log("voy a leer la prop. kk del objet request añadida por middleware-1", req.kk);
    //res.status(200).send("respuesta procesada por MIDDLEWARE en ruta /api/Cliente/Login del servidor web express OK!!!!"); 
    next();
  });
  
  servWeb.use( "/api/Cliente/Login", (req,res,next)=>{
    console.log("--middleware-3 q se ejecuta solo para /api/Cliente/Login del servidor web express");
    console.log("voy a leer la prop. kk del objet request añadida por middleware-1", req.kk);
    //res.status(200).send("respuesta procesada por MIDDLEWARE en ruta /api/Cliente/Login del servidor web express OK!!!!"); 
    next();
  });
  
  servWeb.use( (req,res,next)=>{
    console.log("middleware 4: se ejecuta para cualquier peticion http que llegue al servidor web express");
    console.log("voy a leer la prop. kk del objet request añadida por middleware-1", req.kk);
    //console.log("ESTE MIDDLEWARE NUNCA SE EJECUTARA, PORQUE EL MIDDLEWARE 2 SIEMPRE ORIGINA UNA RESPUESTA AL CLIENTE");
    res.status(200).send("respuesta procesada por MIDDLEWARE-3 del servidor web express OK!!!!");
  });
*/

//#endregion------------------------------------------------------------------------------------------------------

//1º SECCION: funciones middleware para todas las rutas del servidor web express:
//------------------------------------------------------------------------------
// - CORS (permite configurar el servidor web express para que acepte peticiones http desde cualquier cliente perteneciente a otros dominios o redes, como el dominio del cliente react),
// - BODY-PARSER (extrae los datos q van en el body de las pet.http-request crea un objeto y lo mete en req.body), <=== en versiones actuales de express, 
//                                                                                                                      el middleware body-parser ya esta incluido en el propio framework de express
// - COOKIE-PARSER (extrae la cabeceera Cookie de la pet. http-request de los clientes, y la parsea, creando un objeto con las cookies y lo mete en req.cookies del servidor web express)
//    este middleware no lo vamos a usar pq vamos a definir el estado de sesion de los clientes usando tokens JWT, en vez de cookies

const cookieParser=require('cookie-parser'); //modulo para gestionar cookies en express
const cors=require('cors'); //modulo para gestionar politicas CORS en express (hacer servidor accesible desde otros dominios)
//console.log("===> CORS middleware: ", cors.toString());
//console.log("===> cookieParser middleware: ", cookieParser.toString());


const express=require('express');
const jwt=require('jsonwebtoken');

const objetoRoutingCliente=require('./config_enrutamiento/endPointsCliente.js'); 
const objetoRoutingPortal=require('./config_enrutamiento/endPointsPortal.js');

module.exports=(servWeb)=>{

    servWeb.use(cookieParser()); //configuro el servidor web express para que extraiga la cabeceera Cookie de la pet. http-request de los clientes, y la parsea, creando un objeto con las cookies y lo mete en req.cookies del servidor web express
    //console.log("===> cookieParser middleware-1 actuando extrayendo cookies si las hubiera en req.cookie");


    servWeb.use(cors()); //configuro el servidor web express para que acepte peticiones http desde cualquier cliente perteneciente a otros dominios o redes, como el dominio del cliente react
    //console.log("===> CORS middleware-2 actuando, el servidor web express acepta peticiones http desde cualquier cliente perteneciente a otros dominios o redes, como el dominio del cliente react");


    //IMPORTANTE: para evitar error "Payload Too Large Error: request entity too large"
    // por defecto el payload admitido por express.json() es de 100kb, si queremos admitir payloads mas grandes (por ejemplo para subir fotos en el anuncio) hay que configurar el limite de tamaño con la opcion "limit", por ejemplo: express.json({ limit: '10mb' })
    servWeb.use(express.json({ limit: '10mb' })); //configuro el servidor web express para que extraiga los datos q van en el body de las pet.http-request crea un objeto y lo mete en req.body
    //console.log("===> middleware-3 express.json() actuando extrayendo datos del body de las pet.http-request si los hubiera en req.body");

    servWeb.use(express.urlencoded({extended:true})); //configuro el servidor web express para que extraiga los datos q van en la url de las pet.http-request con formato urlencoded, crea un objeto y lo mete en req.query
    //console.log("===> middleware-4 express.urlencoded() actuando extrayendo datos de la url de las pet.http-request con formato urlencoded, crea un objeto y lo mete en req.query");

    //2º SECCION: funciones middleware para RUTAS ESPECIFICAS del servidor web express:
    //---------------------------------------------------------------------------------
    //#region ---- ej. de funciones middleware para rutas especificas del servidor web express, se ejecutan solo para esas rutas ----
    // const midle1=async (req,res,next)=>{ 
    //   //res.status(200).send('--middleware-1 q se ejecuta solo para /api/Cliente/Login del servidor web express');
    //  console.log("--middleware-1 q se ejecuta solo para /api/Cliente/Login del servidor web express");
    //  next();
    // };

    // const midle2=async (req,res,next)=>{
    //   res.status(200).send('--middleware-2 q se ejecuta solo para /api/Cliente/Login del servidor web express');
    // };

    // servWeb.use("/api/Cliente/Login", midle1, midle2,  );
    //#endregion ---------------------------------------------------------------------------------

    servWeb.use('/api/Cliente', objetoRoutingCliente);
    servWeb.use('/api/Portal', objetoRoutingPortal);
}