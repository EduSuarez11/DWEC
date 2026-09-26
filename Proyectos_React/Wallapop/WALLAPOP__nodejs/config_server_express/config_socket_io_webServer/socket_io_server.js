const { Server } = require("socket.io");




const memoryStore = new Map(); //<---- coleccion clave-valor para almacenar todos los chats con sus mensajes !!OJO!! en la clave voy a meter idChat-idProducto-idComprador-idVendedor, y en valor array-mensajes

module.exports = (webServNode) => {
    const io = new Server(webServNode, {
        cors: {
            origin: '*', // Permitir solicitudes desde cualquier origen (dominio)
            methods: ['GET', 'POST'] // Permitir solo métodos GET y POST CORS 
        }
    });

    io.on('connection', (socket) => {

        //configuramos la recepcion de datos ante eventos emitidos por clientes, como "nuevoMensaje", ...
        socket.on('nuevoMensaje', async (data) => {
            console.log('Evento "nuevoMensaje" recibido en el servidor de socket.io, datos recibidos:', data);
            const { idChat, contenido, timestamp, idProducto, idEmisor, idVendedor, checked, tipoMensaje } = JSON.parse(data);

            const claveChat = `${idChat}-${idProducto}`; //<--- meto en la clave del mapa el idChat + idProducto para saber a q producto pertenece los mensajes de cada chat...
            //aqui lo q tengo q hacer es:
            //- crear una "sala" para el chat con el cliente comprador y el vendedor (si la sala no esta creada, si esta creada meter el mensaje en la sala correspondiente al chat)

            if (!memoryStore.has(claveChat)) {
                //es el primer mensaje, tengo que:
                // - crear la sala y meter el mensaje en la sala
                memoryStore.set(claveChat, [{ contenido, timestamp, checked, tipoMensaje, idEmisor, idVendedor }]);
                //- emitir un mensaje a todos los clientes conectados para q el vendedor se de por aludido y se una a esta sala y pueda recibir ya los mensajes...
                socket.join(claveChat); //el cliente q envia el mensaje se une a la sala del chat
                io.emit('unirseSalaChat', JSON.stringify({ claveChat, idVendedor })); //emito un mensaje a todos los clientes conectados para q el vendedor se de por aludido y se una a esta sala y pueda recibir ya los mensajes...
            }
        });

        //configuramos la recepcion de solicitud de unirse a una de chat por parte de cliente vendedor, evento 'unirseSalaChat'
        socket.on("unirseSalaChat", (data) => {
            console.log('Evento "unirseSalaChat" recibido en el servidor de socket.io, datos recibidos:', data);
            const { claveChat, idVendedor } = JSON.parse(data);
            if (memoryStore.has(claveChat)) {
                console.log('El cliente se une a la sala del chat:', claveChat);
                socket.join(claveChat);
                const mensajesChat = memoryStore.get(claveChat);
                io.to(claveChat).emit('mensajesChat', JSON.stringify({ claveChat, mensajesChat }));
            }
            // to -- solo llega a los integrantes del chat
        })

    });



}