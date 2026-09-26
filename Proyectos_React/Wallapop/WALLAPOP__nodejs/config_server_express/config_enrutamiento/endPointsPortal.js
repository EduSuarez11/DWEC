//modulo de codigo q exporta un objeto de enrutamiento Router de express para gestionar
//las peticiones http que llegan a las rutas que empiezan por /api/Portal/....

const express=require('express');
const objetoRoutingPortal=express.Router();

const { MongoClient, ObjectId }=require('mongodb');
const clienteMongoDB=new MongoClient(process.env.MONGODB_URL); //creo un cliente de conexion a mongodb usando la url de conexion definida en el fichero .env


objetoRoutingPortal.get("/Categorias", async (req,res,next)=>{
  try {
    const pathCat=req.query.pathCat; //en la url de la peticion a este endpoint viene un query string con el path de la categoria a obtener, por ejemplo: http://localhost:3000/api/Portal/Categorias?pathCat=raices/raicesCuidadas
    console.log("peticion de categorias del portal, con pathCat:", pathCat);

    let _regExpPathCat=pathCat==='principales' ? /^\d+$/ : new RegExp(`^${pathCat}-\\d+$`); 
    console.log("expresion regular para buscar categorias con pathCat:", _regExpPathCat);

    await clienteMongoDB.connect(); //conecto el cliente de conexion a mongodb, a la url de conexion definida en el fichero .env
    const wallapopDB=clienteMongoDB.db(process.env.MONGODB_DB_NAME);
    
    const categoriasCursor=wallapopDB.collection('categorias').find({ pathCategoria: { $regex: _regExpPathCat } });
    const categorias=await categoriasCursor.toArray();
    console.log(`categorias obtenidas de mongodb con pathCat ${pathCat}:`, categorias);

    if (!categorias ) throw new Error("no existen categorias con pathCat: " + pathCat);
    
    res.status(200).send( { codigo: 0, mensaje: "categorias obtenidas correctamente", categorias } );

  } catch (error) {
      console.log("Error en el endpoint de categorias del portal:", error);
      res.status(200).send( { codigo: 6, mensaje: `error en el endpoint de categorias del portal: ${error.message}`, categorias: [] } );
  } 
});

objetoRoutingPortal.post("/GetProductosVenta",async (req,res,next)=>{
    try {
        const filtro=req.body;
        console.log('filtro recibido en GetProductosVenta:', filtro);

        let queryFilter={};
        let selectFields={};
        let conInfoAdicional=false;

        if (filtro.idcliente){
            queryFilter={ _id: { $ne: new ObjectId(filtro.idcliente) } };
            selectFields={ productosVenta: 1 };
        }
        if(filtro.idVendedor && filtro.idProducto){
            queryFilter={ _id: new ObjectId(filtro.idVendedor), 'productosVenta._id': new ObjectId(filtro.idProducto) };
            selectFields={ 'productosVenta.$': 1 };
            conInfoAdicional=true;
        }
        await clienteMongoDB.connect();
        let cursorClientes=await clienteMongoDB.db(process.env.MONGODB_DB_NAME).collection('clientes').find(queryFilter, { projection: selectFields });
        let clientesArray=await cursorClientes.toArray(); //<--- array de objetos: [{ _id:..idcliente.., productosVenta: [ {..anuncio1..}, {..anuncio2..} ] }, { _id:..idcliente2.., productosVenta: [ {..anuncio3..}, {..anuncio4..} ] }]
        console.log('datos recuperados en GetProductosVenta:', clientesArray);

        let productosVenta=clientesArray.reduce((acc, cliente) => {
            if (cliente.productosVenta && cliente.productosVenta.length > 0) {
                const productosConInfoCliente = cliente.productosVenta.map(
                    producto => {
                        const  { _id, titulo, descripcion,precio, estado, categoria, fotos, pesoEnvio, visitas, likes } = producto;
                        return { 
                                _id,
                                titulo,
                                precio,
                                estado,
                                categoria,
                                fotoPortada: fotos && fotos.length > 0 ? fotos[0].data : '', 
                                pesoEnvio,
                                visitas,
                                likes,
                                idCliente: cliente._id,
                                fotos: conInfoAdicional ? fotos : undefined,
                                descripcion: conInfoAdicional ? descripcion : undefined
                             };
                    }
                );
                return acc.concat(productosConInfoCliente);
            }
            return acc;
        }, []);

        console.log('productosVenta recuperados en GetProductosVenta:', productosVenta);
        res.status(200).send({ codigo: 0, mensaje: 'Productos de venta recuperados correctamente', datos:{ productos: productosVenta } });

    } catch (error) {
        console.error('Error al recuperar productos de venta:', error);
        res.status(500).send({ codigo: 1, mensaje: 'Error al recuperar productos de venta' });
    }
});


module.exports=objetoRoutingPortal;