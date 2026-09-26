import express, { Request, Response,NextFunction } from 'express';
import mongoose from 'mongoose';
import Categoria from '../../modelos/modelos_ORM/Categoria';
import Cliente from '../../modelos/modelos_ORM/Cliente';
import IMiniProducto from '../../modelos/IMiniProducto';

const routerPortal = express.Router();

//#region ----------------------- ENDPOINTS ZONA PORTAL -----------------------------------------------------------
routerPortal.get('/Categorias', async (req:Request, res:Response, next:NextFunction) => {
        try {
            //...pasamos en la query la categoria a seleccionar, parametro pathCat <--- si vale "raices" pues recupero
            //categorias principales, sino las subcategorias de esa categoria...

            let pathCategoria=req.query.pathCat;
            console.log(`pathCategoria recibido en query: ${pathCategoria}`);

            
            let _regex:RegExp=pathCategoria==="principales" ? /^\d+$/ : new RegExp(`^${pathCategoria}-\\d+`); 
            
            await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017', { dbName: process.env.MONGODB_DB_NAME! });
            let _catsCursor=await Categoria.find({ pathCategoria: { $regex: _regex } }).sort({ pathCategoria: 1 }).cursor();
            let _cats=await _catsCursor.toArray();
            //console.log(`categoriasArray recuperadas: ${JSON.stringify(_cats)}`);

            res.status(200).send( { codigo: 0, mensaje: 'categorias recuperadas ok...', datos: { categorias: _cats } } ); 

        } catch (error) {
            console.log('error recuperar categorias  ', error);            
            res.status(200).send({codigo:1, mensaje:'error recuperando categorias ...' + error, datos: { categorias: [] } });
            
        } finally {
            await mongoose.connection.close();
        }
});

routerPortal.post('/GetProductosVenta', async (req:Request, res:Response, next:NextFunction) => {
    try {
        //...pasamos en la query el filtro a aplicar, por ejemplo un string a buscar en el titulo o descripcion del producto, o un id de categoria para recuperar solo productos de esa categoria...
        let filtro=req.body;
        console.log(`filtro recibido en req.body: ${JSON.stringify(filtro)}`);

        let queryFilter={};
        let selectFields={};
        let conInfoAdicional=false;        
        
        //si el filtro viene con idCliente, quiero todos los productos en venta q no pertenecen a ese cliente (para mostrarselos en el inicio y que pueda comprar)
        if ( filtro.idCliente ) {
            queryFilter={ _id: { $ne: new mongoose.Types.ObjectId(filtro.idCliente) } };
            selectFields={ productosVenta: 1, nombreCompleto: 1 };
        }
        if(filtro.idVendedor && filtro.idProducto){
            queryFilter={ _id: new mongoose.Types.ObjectId(filtro.idVendedor), 'productosVenta._id': new mongoose.Types.ObjectId(filtro.idProducto) };
            selectFields={ 'productosVenta.$': 1, nombreCompleto: 1 };
            conInfoAdicional=true;
        }        
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017', { dbName: process.env.MONGODB_DB_NAME! });

        const datosClientsWithProducts=await Cliente.find( queryFilter, selectFields ).lean(); //lean() para obtener objetos JavaScript simples en lugar de documentos Mongoose, lo que mejora el rendimiento al no incluir métodos y propiedades adicionales de Mongoose
        console.log('datosClientsWithProducts recuperados:' , datosClientsWithProducts);

        const _prodsMap=datosClientsWithProducts.reduce(
            (acc: IMiniProducto[], cliente) => {
                        const productosVenta = cliente.productosVenta || [];
                        const productosConIdCliente:IMiniProducto[] = productosVenta.map(
                            (producto:any) => {        
                                            const  { _id, titulo, descripcion,precio, estado, categoria, fotos, pesoEnvio, visitas, likes } = producto;
                                            return {
                                                _id: _id.toString(),
                                                idCliente: cliente._id.toString(),
                                                nombreCompletoVendedor: cliente.nombreCompleto,
                                                titulo,
                                                precio,
                                                estado,
                                                categoria,
                                                fotoPortada: fotos && fotos[0] ? fotos[0].data! : '',
                                                pesoEnvio,
                                                visitas,
                                                likes,
                                                fotos: conInfoAdicional ? fotos : undefined,
                                                descripcion: conInfoAdicional ? descripcion : undefined                                                
                                            };
                                        }
                        );
                    return acc.concat(productosConIdCliente);
            }, [] as IMiniProducto[]);

        res.status(200).send({codigo:0, mensaje:'productos recuperados ok...', datos: { productos: _prodsMap } });

    } catch (error) {
        console.log('error recuperar productos venta  ', error);            
        res.status(200).send({codigo:1, mensaje:'error recuperando productos venta ...' + error, datos: { productos: [] } });
    } finally {
        await mongoose.connection.close();
    }
});
//#endregion -----------------------------------------------------------------------------------------------------------



export default routerPortal;