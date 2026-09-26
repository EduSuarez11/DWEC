interface ICuenta {
    email: string;
    password: string;
    activada: boolean;
    imagenAvatar: string;
    fechaCreacion: number;
}

export default interface ICliente {
    _id: string;
    nombreCompleto: string;
    cuenta: ICuenta;
    direcciones: any[];
    productosVenta: any[];
    productosComprados: any[];
    favoritos: any[];
    valoraciones: any[];
    misChats: IChat[];
    misBusquedas: any[];
}

export interface IProductoAnuncio {
    _id: string;
    titulo: string;
    descripcion: string;
    precio: string;
    categoria: string;
    fotos: Array<{ data: string , mimetype: string, originalname: string }>;
    fechaPublicacion: number;
    fechaModificacion: number;
    likes: number;
    visitas: number;
    mensajes: any[];
    pesoEnvio: string;
    estado: string;
    estadoVenta: string;
}

export interface IChat {
    _id?: string;
    datosVendedor:{
        idVendedor: string;
        nombreCompleto:string;
    },
    datosComprador:{        
        idComprador: string;
        nombreCompleto:string;
    },
    anuncioProducto: {
        _id: string;
        titulo: string;
        precio: string;
        fotoPortada: string;
        visitas?: number;
        likes?: number;
    };
    mensajes: Array<{
        contenido: string;
        idEmisor: string;
        timestamp: number;
        checked:boolean;
        tipoMensaje: string;//'texto' | 'oferta' | 'compra' ;
    }>;
    fechaInicioChat: number;
    fechaFinChat?: number;
}

export interface IProductoAnuncio {
    _id: string;
    titulo: string;
    descripcion: string;
    precio: string;
    categoria: string;
    fotos: Array<{ data: string , mimetype: string, originalname: string }>;
    fechaPublicacion: number;
    fechaModificacion: number;
    likes: number;
    visitas: number;
    mensajes: any[];
    pesoEnvio: string;
    estado: string;
}