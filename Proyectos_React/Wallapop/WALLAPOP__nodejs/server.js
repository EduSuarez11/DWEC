//modulo principal de la aplicacion de nodejs, se encarga de levantar el servidor y configurar las rutas
//#region ------------- parametros funcion wrapper inmediata -------------
//para ver la funcion inmediata, ejecuta esto en la consola:
//node -e "const Module=require('module'); console.log(Module.wrapper);"
// console.log("vamos a mostrar los parametros que recibe el modulo de codigo cuando se ejecuta su funcion inmediata");

// console.log("exports es un alias de module.exports: ", exports);
// console.log("require: ", require);
// console.log("module: ", module);
// console.log("__filename: ", __filename);
// console.log("__dirname: ", __dirname);
//#endregion --------------------------------------------------------------
require('dotenv').config() //configuro la carga de las variables de entorno definidas en el fichero .env, para que esten disponibles en process.env.MONGODB_URL y process.env.MONGODB_DB_NAME


const express = require('express');
const configPipeline = require('./config_server_express/config_pipeline.js'); //modulo de codigo para configurar la PIPELINE de express, exporta una funcion que recibe como parametro el servidor express recibido del modulo principal "server.js" a configurar y dentro de la funcion se configuran los modulos MIDDLEWARE que procesan las peticiones http-request de los clientes

const servWeb = express(); //<--- express es una funcion, al ejecutarla devuelve un objeto que representa el servidor web
//console.log("------------------- contenido de la variable servWeb:", servWeb);
//console.log("------------------- valor del metodo listen del objeto servWeb:", servWeb.listen.toString());
configPipeline(servWeb); //ejecuto la funcion exportada por el modulo de codigo para configurar la PIPELINE de express, pasandole como parametro el servidor express creado al ejecutar express() en esta linea, para que se configuren los middlewares y rutas del servidor web express



//--------------- PARA CONFIGURAR EL SERVIDOR DE SOCKET.IO -----------------
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const socket_io_server = require('./config_server_express/config_socket_io_webServer/socket_io_server.js');
//--------------------------------------------------------------------------


const servNode = createServer(servWeb);
socket_io_server(servNode)
//#region --------------- configuracion de eventos y conexiones socket-io de clientes al server ---------------------------



//#endregion --------------------------------------------------------------------------------------------------------------




servNode.listen(3000, (err) => {
  if (err) {
    console.log("Error al levantar el servidor web:", err);
  } else {
    console.log("===> Servidor web levantado en el puerto 3000 <===");
  }
});