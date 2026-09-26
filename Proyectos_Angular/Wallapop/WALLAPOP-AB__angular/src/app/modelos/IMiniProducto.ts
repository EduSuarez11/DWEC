export default interface IMiniProducto {
    _id: string;
    idCliente: string;
    nombreCompletoVendedor: string;
    titulo: string;
    descripcion?: string;
    precio: string;
    estado: string;
    categoria: string;
    fotoPortada: string ; 
    pesoEnvio: string;
    visitas: number;
    likes: number;
    fotos?: Array<{ data: string; originalname: string }>; // Array de URLs de las fotos del producto, opcional
}