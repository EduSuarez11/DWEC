import {io, Socket} from 'socket.io-client';

console.log('Importando modulo socketIOService.js, valor de io:', io.toString(), 'y valor de Socket:', Socket);

export default {
    //<--- la ejecucion de la funcion io() de socket.io-client devuelve un objeto Socket, que representa la conexión del cliente 
    // con el servidor de socket.io, y se puede usar para enviar y recibir mensajes entre el cliente y el servidor 
    // a través de eventos personalizados definidos por el desarrollador, lo que permite una comunicación bidireccional 
    // en tiempo real entre ambos.
    conectServer: io('http://localhost:3000'), 

    // esta configuracion fuerza a usar solo el transporte websocket, evitando que socket.io intente usar otros transportes 
    // como polling, lo que puede mejorar el rendimiento y la estabilidad de la conexión en algunos casos, 
    // especialmente en aplicaciones en tiempo real donde se requiere una comunicación bidireccional eficiente 
    // entre el cliente y el servidor.
    //conectServer: io('http://localhost:3000', { transports: ['websocket'] }),
    sendMessage: function(nombreEvento, datos) {
        console.log('Enviando mensaje al servidor de socket.io con nombreEvento:', nombreEvento, 'y datos:', datos);
        this.conectServer.emit(nombreEvento, datos); 
    },

    getMessage: function(nombreEvento, funcionHandler)  {
        if (this.conectServer.hasListeners())
        console.log('Configurando recepción de mensajes del servidor de socket.io para el evento:', nombreEvento, 'con funcion handler:', funcionHandler);
        this.conectServer.on(nombreEvento, funcionHandler);
    }
}