import mongoose from "mongoose";

const cuentaSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required:true }, //en caso de registro con google, la contraseña se deja vacía, pero el campo es obligatorio para mantener la estructura del esquema
    cuentaActivada: { type: Boolean, required: true, default: false },
    fechaCreacionCuenta: { type: Number, required: true, default: Date.now },
    telefonoContacto: { type: String },
    imagenAvatar: { type: String }
});



const productoAnuncioSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: String, required: true },
    categoria: { type: String, required: true },
    fotos: { type: [{ data: String, mimetype: String, originalname: String }], default: [] },
    fechaPublicacion: { type: Number, required: true, default: Date.now },
    fechaModificacion: { type: Number, required: true, default: Date.now },
    likes: { type: Number, required: true, default: 0 },
    visitas: { type: Number, required: true, default: 0 },
    mensajes: { type: [Object], default: [] },
    pesoEnvio: { type: String, required: true },
    estado: { type: String, required: true },
    estadoVenta: { type: String, required: true, default: 'Disponible' }
});


const ChatSchema = new mongoose.Schema({
    datosComprador:{
        idComprador: { type: String, required: true },
        nombreCompleto: { type: String, required: true },
    },
    datosVendedor:{
        idVendedor: { type: String, required: true },
        nombreCompleto: { type: String, required: true },
    },
    anuncioProducto: {
        _id: { type: String, required: true },
        titulo: { type: String, required: true },
        precio: { type: String, required: true },
        fotoPortada: { type: String, required: true },
        visitas: { type: Number, default: 0 },
        likes: { type: Number, default: 0 }
    },
    mensajes: [
        {
            contenido: { type: String, required: true },
            idEmisor: { type: String, required: true },
            timestamp: { type: Number, required: true },
            checked: { type: Boolean, required: true, default: false },
            tipoMensaje: { type: String, required: true, default: 'texto' } //nuevo campo para diferenciar entre mensajes de texto e imágenes
        }
    ],
    fechaInicioChat: { type: Number, required: true },
    fechaFinChat: { type: Number },
}) 

const clienteSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true },
    cuenta: { type: cuentaSchema, required: true },
    direcciones: { type: [Object], default: [] },
    productosVenta: { type: [productoAnuncioSchema], default: [] },
    productosComprados: { type: [Object], default: [] },
    favoritos: { type: [Object], default: [] },
    valoraciones: { type: [Object], default: [] },
    misChats: { type: [ChatSchema], default: [] },
    misBusquedas: { type: [Object], default: [] },
});

export default mongoose.model("Cliente", clienteSchema, "clientes");