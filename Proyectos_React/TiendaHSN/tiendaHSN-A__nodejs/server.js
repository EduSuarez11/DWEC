require('dotenv').config(); //<--- leer fichero .env y crear variables de entorno con contenido sensible

//configurar servidor web express...
const express=require('express');
const configPipeline=require('./config_server_express/config_pipeline.js'); //<--- en esta variable se almacena la funcion que se exporta en el modulo config_pipeline.js

const serverExpress=express();
//configuracion de la PIPELINE de express (conjunto de modulos que procensan las peticiones http-request de los clientes)
configPipeline(serverExpress);

serverExpress.listen(
    3000,
    (error)=>{
        if(error) { 
            console.log(`error al iniciar el servidor: ${error}`);
        } else {
            console.log(`servidor web express iniciado en el puerto 3000`);
        }
    }
);

