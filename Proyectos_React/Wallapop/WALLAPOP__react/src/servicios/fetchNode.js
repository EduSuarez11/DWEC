//modulo de codigo q exporta un objeto js puro con metodos(funciones) para hacer las llamadas a nuestro
//servidor node, usando la API fetch de JS, y q se usara en los componentes de React para hacer las llamadas a nuestro backend
// NUESTRO SERVIDOR SIEMPRE GENERA RESPUESTA con este formato (haya o no errores): { codigo: ..., mensaje: ..., datos: .... }
const URL_BASE = 'http://localhost:3000/api/';

const fetchNode={
    /*
    LoginEmail: async (email, password, tokenReCAPCTHA)=>{
        const petLoginServer=await fetch( URL_BASE + 'Cliente/LoginEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, tokenReCAPCTHA })
        });
        const resLoginServer = await petLoginServer.json(); //<---- respuesta del servidor node, con formato { codigo: ..., mensaje: ..., datos: .... }
        return resLoginServer;
    },
    Registro: async ( nombreCompleto, email, password )=>{
        const petLoginServer=await fetch( URL_BASE + 'Cliente/Registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreCompleto, email, password })
        });
        const resLoginServer = await petLoginServer.json(); //<---- respuesta del servidor node, con formato { codigo: ..., mensaje: ..., datos: .... }
        return resLoginServer;
    },
    */
    //con un unico metodo...
    LoginRegistro: async ( operacion, datos)=>{
        const petServer=await fetch( URL_BASE + 'Cliente/' + operacion, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resServer = await petServer.json(); //<---- respuesta del servidor node, con formato { codigo: ..., mensaje: ..., datos: .... }
        return resServer;
    },
    LoginGoogle: async () =>{
        const petServer = await fetch( URL_BASE + 'Cliente/LoginGoogle', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const resServer = await petServer.json();
        return resServer;
    },
    PublicarAnuncio: async (formData)=>{
        const petServer = await fetch( URL_BASE + 'Cliente/PublicarAnuncio', {
            method: 'POST',
            body: formData // aqui se envía el FormData con los datos del anuncio y las fotos, y el backend lo procesa con multer para guardar las fotos en el servidor y los datos del anuncio en la base de datos 
        });
        const resServer = await petServer.json();
        return resServer;
    },
    ActualizarDatosCliente: async( operacion, datos )=>{
        const respuestaFetch=await fetch( URL_BASE + `Cliente/ActualizarDatos/${operacion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        const datosRespuesta=await respuestaFetch.json();
        return datosRespuesta;
    },    
}

export const fetchNodePortal={
    getCategorias: async (patchCategoria)=>{
        const petServer = await fetch( URL_BASE + `Portal/Categorias?pathCat=${patchCategoria}`, {
            method: 'GET',
        });
        const resServer = await petServer.json();
        return resServer;
    },
    GetProductosVenta: async (filtro)=>{
        const respuestaFetch=await fetch( URL_BASE + `Portal/GetProductosVenta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtro)
        });
        const datosRespuesta=await respuestaFetch.json();
        return datosRespuesta.datos.productos;
    },
}

export default fetchNode;