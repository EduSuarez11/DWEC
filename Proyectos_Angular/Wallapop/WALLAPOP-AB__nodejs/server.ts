import "dotenv/config";
import express,{Express} from "express";
import { createServer} from "http";

import config_pipeline from "./config_server_express/config_pipeline";
import config_socketIO_server from "./config_socketIO_webServer/socket_io_server";

//--------------- configuracion del servidor EXPRESS sobre nodejs ----------
const servWeb:Express=express();
config_pipeline(servWeb);

//--------------- configuracion del servidor SOCKET.IO sobre nodejs ----------
const webServerNODE=createServer(servWeb);
config_socketIO_server(webServerNODE);
//_---------------------------------------------------------------------------

webServerNODE.listen(3000, (error?: Error | undefined) => {
    if (error) {
        console.log('Error al iniciar el servidor: ', error.message);
    } else {
        console.log(' ==> Servidor de NodeJS con EXPRESS iniciado en el puerto 3000 <== ');
    }
});