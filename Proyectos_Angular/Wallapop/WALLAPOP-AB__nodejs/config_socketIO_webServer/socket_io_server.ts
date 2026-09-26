import { Server } from "socket.io";
import mongoose from "mongoose";
import Cliente from "../modelos/modelos_ORM/Cliente";

const memoryStore=new Map<string, any>();
/*
    coleccion clave-valor para almacenar los datos de los chats entre clientes:
    - clave: id del chat entre comprador-vendedor (<=== creado cuando el cliente comprador, en vista Producto pulsa boton "Chat")
    - valor: objeto con la siguiente estructura:
    {
        idChat: string, //id del chat entre comprador-vendedor
        datosComprador: { idComprador: string, nombreCompleto: string },
        datosVendedor: { idVendedor: string, nombreCompleto: string },
        anuncioProducto: { _id: string, titulo: string, precio: number, fotoPortada: string, ... },
        mensajes: [ { contenido:string, timestamp: number, idEmisor: string, checked: boolean , tipoMensaje: 'texto'... }, ... ],
        fechaInicioChat: number,
        fechaFinChat: number    }
*/


//#region -------------------- conjunto de funciones para dar persistencia a datos de chats en mongodb -------------------------------
type MensajeChat = {
    contenido: string;
    timestamp: number;
    idEmisor: string;
    checked: boolean;
    tipoMensaje: 'texto' | 'imagen' | 'archivo';
};

async function __almacenarMensajeEnChat(idChat:string, mensaje: MensajeChat){
    try {
        await mongoose.connect(process.env.MONGODB_URL as string, { dbName: process.env.MONGODB_DB_NAME! });
        const resUpdateCliente=await Cliente.updateMany(
            { "misChats._idChat": new mongoose.Types.ObjectId(idChat) }, //filtro para encontrar clientes que tienen el chat dentro del array misChats 
            //el operardor $ funciona en un updateOne, en un updateMany no...pq tengo q actualizar muchos documentos...necesito arrayFilters para identificar el elemento del array a cambiar en cada objeto cliente
            //{ $push: { "misChats.$.mensajes": mensaje } } //operador $ para hacer push del nuevo mensaje en el array mensajes del chat encontrado
            { $push: { "misChats.$[chat].mensajes": mensaje } }, //operador $ para hacer push del nuevo mensaje en el array mensajes del chat encontrado
            { arrayFilters: [ { "chat._idChat": new mongoose.Types.ObjectId(idChat) } ] } //filtro para identificar el elemento del array misChats a actualizar en cada documento cliente
        );
        console.log("Resultado de la actualización del cliente con nuevo mensaje en chat: ", resUpdateCliente);
        if (resUpdateCliente.modifiedCount === 0) throw new Error("No se ha actualizado ningún documento cliente con el nuevo mensaje en chat. Revisar que el idChat es correcto y que existe un cliente con ese chat en su array misChats.");     
    

    } catch (error) {
        console.log("Error al almacenar mensaje en chat: ", error instanceof Error ? error.message : error);
    
    } finally {
        await mongoose.disconnect();
    }
}



async function __crearChatEnClienteVendedor(idChat:string, idVendedor:string){
    try {
         await mongoose.connect(process.env.MONGODB_URL as string, { dbName: process.env.MONGODB_DB_NAME! });
         const resUpdateVendedor=await Cliente.updateOne(
            { _id: new mongoose.Types.ObjectId(idVendedor) }, //filtro para encontrar el cliente vendedor al que hay que añadirle el nuevo chat en su array misChats
            { $push: { misChats: { _id: new mongoose.Types.ObjectId(idChat), ...memoryStore.get(idChat) } } } //operador $ para hacer push del nuevo chat (con idChat y array mensajes vacío) en el array misChats del cliente vendedor encontrado
         );
        console.log("Resultado de la actualización del cliente vendedor con nuevo chat: ", resUpdateVendedor);
        if (resUpdateVendedor.modifiedCount === 0) throw new Error("No se ha actualizado ningún documento cliente vendedor con el nuevo chat. Revisar que el idVendedor es correcto y que existe un cliente con ese id en la colección de clientes.");
    
    } catch (error) {
        console.log("Error al crear chat en cliente vendedor: ", error instanceof Error ? error.message : error);
    }

}

//#endregion -------------------------------------------------------------------------------------------------------------------------

export default function config_socketIO_server(webServerNODE:any):void {
    const io=new Server(webServerNODE,{
        cors:{
            origin: "*",//["http://localhost:4200", "http://localhost:5137"],
            methods:["GET","POST"] //metodos HTTP permitidos por protocolo WS
        }
    });


    io.on("connection",(socket)=>{
        console.log("Nuevo cliente conectado: ", socket.id);
    
        //#region ------------------ configuramos la recepcion de mensajes desde clientes angular definiendo eventos personalizados ------------------
        
        socket.on("nuevoMensaje",async (data:any) =>{
            const _data=JSON.parse(data);
            console.log("Mensaje recibido del cliente: ", _data);
            /*este evento se dispara en 2 situaciones:
                1º) cuando el cliente comprador, en vista Producto, pulsa boton "Chat" para iniciar un nuevo chat con el vendedor del producto <=== 1º mensaje del chat
                    (se identifica pq en el mapa no existe una entrada con clave mandada en los datos por el comprador)
                    
                    en data => idChat, datosComprador, datosVendedor, anuncioProducto, mensaje, anuncioProducto, fechaInicioChat,fechaFinChat
                                       
                2º) cuando el cliente comprador o vendedor envia un nuevo mensaje dentro de un chat ya iniciado (intercambio de mensajes entre comprador-vendedor) 
                    (se identifica pq en el mapa ya existe una entrada con clave mandada en los datos por el comprador o vendedor)

                    en data => idChat, mensaje
            */
           if ( ! memoryStore.has(_data.idChat)){
                //CASO 1º) => se inicia un nuevo chat entre comprador-vendedor
                const { idChat, datosComprador, datosVendedor, anuncioProducto, mensaje, fechaInicioChat, fechaFinChat }=_data;
                memoryStore.set(
                                    idChat, 
                                    { 
                                        idChat,
                                        datosComprador,
                                        datosVendedor,
                                        anuncioProducto,
                                        mensajes: [mensaje],
                                        fechaInicioChat, 
                                        fechaFinChat
                                     }
                                );
            
                socket.join(idChat);//el cliente comprador se une a una sala de socket.io con nombre=idChat 
                //doy persistencia en mongoDB almacenando el mensaje en el chat <===== para evitar esta espera, lo suyo es mandarlo a un servicio emisor/consumidor (rabbitMQ, kafka...) y que un microservicio se encargue de almacenar el mensaje en mongoDB, pero para esta practica lo hacemos directamente aqui)
                await __almacenarMensajeEnChat(idChat, mensaje);

                //emito evento a todos los clientes conectados para q el cliente vendedor se de por aludido y se una a la sala de socket.io con nombre=idChat para ese chat comprador-vendedor
                io.emit("unirseSalaChat", JSON.stringify({ idChat, datosComprador, datosVendedor, anuncioProducto, fechaInicioChat, fechaFinChat, primerMensaje: mensaje })); //emito a todos los clientes conectados, pero solo el cliente vendedor al que va dirigido el mensaje se unirá a la sala de socket.io con nombre=idChat para ese chat comprador-vendedor

            } else {
                //CASO 2º) => se intercambia un nuevo mensaje entre comprador-vendedor dentro de un chat ya iniciado
                const { idChat, mensaje }=_data;
                
                const chat=memoryStore.get(idChat);
                chat.mensajes.push(mensaje);

                await __almacenarMensajeEnChat(idChat, mensaje);

                //emito evento SOLO al otro miembro del chat (si el emisor es el comprador, se lo mando al vendedor y viceversa) para que se actualice la vista del chat en tiempo real con el nuevo mensaje recibido
                socket.to(idChat).emit("mensajeEnChat", JSON.stringify({ idChat, mensaje }));             
            }

        }); //cierrer de socket.on("nuevoMensaje")


        
        socket.on("unirseSalaChat", async (data:any)=>{
            console.log("Cliente Vendedor quiere unirse a sala de chat: ", data);
            
            //este evento lo emite el cliente vendedor con: data ---> idChat, idVendedor para unirse a la sala creada por el cliente comprador...
            const { idChat, idVendedor }=JSON.parse(data);
            
            socket.join(idChat);
            //necesito almacenar en la bd de mongodb todos los datos del chat en CLIENTE VENDEDOR
            await __crearChatEnClienteVendedor(idChat, idVendedor);

        }); //cierre de socket.on("unirseSalaChat")

        //#endregion ----------------------------------------------------------------------------------------------------------------------------------
    
    }); //cierre de io.on("connection")
}