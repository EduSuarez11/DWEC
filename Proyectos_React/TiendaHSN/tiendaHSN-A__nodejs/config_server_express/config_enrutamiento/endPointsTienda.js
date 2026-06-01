const express=require('express');
const objetoRoutingTienda=express.Router();
const mongoose=require('mongoose');

const stripeService=require('../servicios/stripeService');
const paypalService=require('../servicios/paypalService');

objetoRoutingTienda.get('/Categorias',
    async (req,res,next)=>{
        
        //en parametro querystring pathCat voy a pasar el tipo de categorias a recuperar...
        //si vale "principales" recupero las categorias raices con un pathCategoria de un unico digito
        //si no recupero las subcategorias de la categoria cuyo pathCategoria es el que me pasan
        /*
          cliente React ----------------> servidor Nodejs
           LayOut.jsx
           fetch('http://localhost:3000/api/TiendaCategorias ? pathCat=principales')
        */
        try {
            console.log(`parametros pasados por GET desde cliente React: ${JSON.stringify(req.query)}`);
            const pathCat=req.query.pathCat;

            let patronBusqueda=pathCat==='principales' ?  /^\d+$/ : new RegExp(`^${pathCat}-[0-9]+`);

            await mongoose.connect(process.env.URL_MONGODB);
            const categoriasCursor= mongoose.connection
                                            .collection('categorias')
                                            .find(
                                                { pathCategoria: {$regex: patronBusqueda}}
                                            ); //no hace falta el await pq es un puntero a un cursor q contiene realmente los datos...
            const categorias=await categoriasCursor.toArray(); 
            //console.log(`categorias recuperadas: ${JSON.stringify(categorias)}`);
            
            const totalProductos = await mongoose.connection.collection('productos').find().toArray();
            console.log('Productos en total: ', totalProductos)

            res.status(200).send({ codigo:0, mensaje:`categorias recupearadas ok para pathCat: ${pathCat}`, categorias:categorias, totalProductos });

        } catch (error) {
            console.log(`error al obtener categorias: ${error}`);
            res.status(200).send(
                { 
                    codigo:5, 
                    mensaje:`error al obtener categorias: ${error}`,
                     categorias:[]
                });
        }
    })

objetoRoutingTienda.get('/Productos',async (req,res,next)=>{
    try {
        //...pasamos en la query la categoria a seleccionar, parametro pathCat <--- si vale "raices" pues recupero
        //productos de categorias principales, sino los productos de esa categoria...   
        let pathCategoria=req.query.pathCat;
        console.log(`pathCategoria recibida en query: ${pathCategoria}`)
        
        //si categoria es de 2º nivel, recuperamos productos que CONTENGAN el path...si es de 3º nivel, tienen q coincidir exactamente con ese pathCategoria
        let patron=pathCategoria.split('-').length == 2 ? new RegExp(`^${pathCategoria}-`) : new RegExp(`^${pathCategoria}$`);

        await mongoose.connect(process.env.URL_MONGODB);
        let _prodCursor=mongoose.connection.collection('productos').find( { pathCategoria: { $regex: patron } } );
        let _productos=await _prodCursor.toArray();

        console.log(`productosArray recuperados: ${JSON.stringify(_productos)}`);
        res.status(200).send( { codigo: 0, mensaje: 'productos recuperados ok...', productos: _productos } );

    } catch (error) {
        console.log('error recuperar productos  ', error);            
        res.status(200).send({codigo:1, mensaje:'error recuperando productos ...' + error, productos:[] });
    }
})

objetoRoutingTienda.post('/FinalizarCompra',async (req,res,next)=>{
    try {
        //emdpont invocado desde cliente React componente Finalizar.jsx le paso en el body:
        //le paso en el body: datos del cliente: nombre, apellidos, email, pedido
        const { cliente, pedido } = req.body;
        console.log(`datos recibidos en body para finalizar compra: ${JSON.stringify(cliente._id)} --- ${JSON.stringify(pedido.metodoPago)}`);

        switch (pedido.metodoPago.tipo) {
            case 'Tarjeta de Credito/Debito':
                //logica para pago con tarjeta de credito usando el servicio de STRIPE
                //1º comprobamos ANTES DE CREAR CUSTOMER Y" CARD DE STRIPE si ya el cliente los tiene creados con anterioridad
                //si no los tiene creados en su propiedad "", los creamos y almacenamos los IDs en la BBDD
                //si ya los tiene creados, usamos esos IDs para hacer el cargo (CHARGE) en STRIPE
                await mongoose.connect(process.env.URL_MONGODB);
                let existeCustomerStripe=await mongoose.connection
                                                        .collection('clientes').
                                                        findOne(
                                                            { 'cuenta.email': cliente.cuenta.email,
                                                               metodosPago:{ $elemMatch: { tipo: 'Tarjeta de Credito/Debito' } }
                                                             },
                                                            { metodosPago: 1, _id:0 }
                                                        );
                let idCustomerStripe=null;
                let idCardStripe=null;

                if( ! existeCustomerStripe){
                    //ya se ha pagado con tarjeta de credito antes, recuperamos los IDs de customer y card de stripe
                    //extraemos del array metodosPago el objeto con tipo: 'Tarjeta de Credito/Debito'
                    let metodoPagoTarjeta=existeCustomerStripe.metodosPago
                                                              .find( metPago => metPago.tipo==='Tarjeta de Credito/Debito' );
                    idCustomerStripe=metodoPagoTarjeta.detalles.idCustomer;
                    idCardStripe=metodoPagoTarjeta.detalles.idCard;
                } else {
                    //no existe el customer en stripe, lo creamos y almacenamos los IDs en la BBDD
                    //1º paso crear el CUSTOMER en STRIPE
                    idCustomerStripe=await stripeService.Stage1_CreateCustomer(
                        cliente.cuenta.email, 
                        cliente.nombre,
                        cliente.apellidos, 
                        pedido.direccionEnvio
                    );
                    if( idCustomerStripe === null ) throw new Error('No se ha podido crear el Customer en Stripe');
                    
                    //2º paso crear la CARD en STRIPE para ese CUSTOMER
                    idCardStripe=await stripeService.Stage2_CreateCardForCustomer( idCustomerStripe, pedido.metodoPago.detalles );
                    if( idCardStripe === null ) throw new Error('No se ha podido crear la Card en Stripe');

                    //3º paso almacenar los IDs creados en STRIPE en la BBDD dentro de la coleccion "clientes"
                    //hay q meter  en propiedad "metodsPago" que es un array, un nuevo objeto con esta forma:
                    // { tipo: 'Tarjeta de Credito/Debito', detalles: { idCustomer: '....', idCard: '...' } }
                    let resUpdateCliente=await mongoose.connection
                                                            .collection('clientes')
                                                            .updateOne(
                                                                (
                                                                    {
                                                                        'cuenta.email': cliente.cuenta.email
                                                                    },
                                                                    {
                                                                         $push:{ 
                                                                                metodosPago: { 
                                                                                            tipo:'Tarjeta de Credito/Debito', 
                                                                                            detalles:{ 
                                                                                                       idCustomer: idCustomerStripe, 
                                                                                                       idCard: idCardStripe
                                                                                                    }    
                                                                                        } 
                                                                                }
                                                                    }
                                                                
                                                                )
                                                            );

                }
                
                //4º paso crear el CARGO en STRIPE para ese pedido
                pedido._id=new mongoose.Types.ObjectId();

                let resCharge=await stripeService.Stage3_CreateCharge(
                                                idCustomerStripe, 
                                                idCardStripe, 
                                                pedido.total,
                                                pedido._id.toString()
                                            );
                if( resCharge===null) throw new Error('fallo a la hora de cobrar el cargo en Stripe');

                //3º paso si se ha cobrado correctamente, almacenamos el pedido en la BBDD dentro de la coleccion "clientes"
                pedido.FechaPago=new Date(Date.now());
                let updatePedidosCliente=await mongoose.connection
                                                        .collection('clientes')
                                                        .updateOne(
                                                            { 'cuenta.email': cliente.cuenta.email },
                                                            { $push: { pedidos: pedido }}
                                                        );
                console.log(`resultado modificacion prop.pedidos cliente...${JSON.stringify(updatePedidosCliente)}`)

                //4º paso, Generamos factura en pdf y mandamos por email, y damos respuesta al cliente de React
                const codHtmlFactura=`
                <html>
                <head><title>Factura pedido ${pedido._id.toString()}</title></head>
                <body>
                    <div> continuacion se detalla los articulos q has comprado en tu tienda de deportes...</div>
                </body>
                </html>`;

                res.status(200).send( { codigo:0, mensaje:'se ha cobrado ok con la tarjeta en stripe' } )
                break;
            
            case 'PayPal':
                console.log('entrando en logica de pago con PayPal...');
                //logica para pago con PayPal
                pedido._id=new mongoose.Types.ObjectId();

                const ordenPagoPayPal=await paypalService.Stage1_CreateOrderPaypal( cliente._id.toString(), pedido );
                if( ordenPagoPayPal === null ) throw new Error('No se ha podido crear la orden de pago en PayPal');

                //debemos guardar en la bbdd el pedido en la coleccion "pedidos" del cliente, con estado "pendiente de pago"
                //y en metodoPago guardar el ID de la orden de paypal para luego cuando el cliente vuelva desde paypal:
                //{ estado: 'PENDING_PAYMENT', detalles: { tipo: 'PayPal', idOrderPayPal: '....' } }
                pedido.metodoPago={ 
                    tipo: 'PayPal',                      
                    detalles: { estado: 'PENDING', idOrderPayPal: ordenPagoPayPal.id } 
                };
                
                await mongoose.connect(process.env.URL_MONGODB);
                let resUpdatePedidosPayPal=await mongoose.connection
                                                        .collection('clientes')
                                                        .updateOne(
                                                            { 'cuenta.email': cliente.cuenta.email },
                                                            { $push: { pedidos: pedido }}
                                                        );
                //console.log(`resultado modificacion prop.pedidos cliente...${JSON.stringify(resUpdatePedidosPayPal)}`);
                if( resUpdatePedidosPayPal.modifiedCount === 0 ) throw new Error('No se ha podido actualizar el pedido en la base de datos');

                pedido.FechaPago=null; //hasta q no se confirme el pago en paypal no tiene fecha de pago
                //el el objeto ordenPagoPayPal tenemos en la propiedad "links" las urls para redirigir al cliente a paypal a pagar
                //debemos seleccionar la url con rel="approve" para pasarla al cliente React y q este haga la redireccion a paypal
                const urlConexionPayPal = ordenPagoPayPal.links.find(link => link.rel === "approve").href;
                res.status(200).send( 
                                {
                                    codigo:0,
                                    mensaje:'orden de pago de PayPal creada ok',
                                    approveUrl: urlConexionPayPal 
                                }
                );
                break;

            case "Bizum":
                //logica para pago con Bizum
                break;

                

            default:
                break;
        }



    } catch (error) {
        
    }
})

objetoRoutingTienda.get('/PayPalCallback',async (req,res,next)=>{
    //endpoint invocado por paypal una vez el cliente ha pagado o ha cancelado el pago
    //en la querystring recibimos: idCliente, idPedido, y si ha cancelado el pago cancel=true
    try {
        console.log(`querystring recibida en PayPalCallback: ${JSON.stringify(req.query)}`);
        const { idCliente, idPedido, cancel  } = req.query;
        if( cancel && cancel==='true' ) throw new Error('El cliente ha cancelado el pago en PayPal');

        //necesito recuperar el id de la orden de pago de paypal creada en el primer paso, para poder hacer la 2º fase
        //la captura del pago (capture) en paypal con estado "PENDING"
        await mongoose.connect(process.env.URL_MONGODB);
        let pedidosclienteDb=await mongoose.connection
                                        .collection('clientes')
                                        .findOne(
                                            { _id: new mongoose.Types.ObjectId( idCliente ) } ,
                                            { pedidos: 1, _id:0 }
                                        );
        let pedidoPayPalPending=pedidosclienteDb.pedidos.find( pedido => pedido._id.toString()===idPedido 
                                                            && pedido.metodoPago.tipo==='PayPal'
                                                            && pedido.metodoPago.detalles.estado==='PENDING' );
        
        if( ! pedidoPayPalPending ) throw new Error('No se ha podido recuperar el pedido pendiente de pago en PayPal');
        let idOrderPayPal=pedidoPayPalPending.metodoPago.detalles.idOrderPayPal;

        //2º paso hacer la captura del pago en paypal para ese ID de orden de pago
        const resCapturePayPal=await paypalService.Stage2_CapturePaymentForOrderPayPal( idOrderPayPal );
        if( resCapturePayPal === null ) throw new Error('No se ha podido capturar el pago en PayPal');
        
        //3º paso actualizar el pedido en la BBDD, poner estado del metodoPago a "COMPLETED" y FechaPago a la fecha actual
        if (resCapturePayPal.status !== 'COMPLETED') throw new Error(`La captura de la orden de PayPal no se ha completado correctamente, estado actual: ${resCapturePayPal.status}`);
        let updateEstadoPagoResult=await mongoose.connection
                                                .collection('clientes')
                                                .updateOne(
                                            { 
                                              _id: new mongoose.Types.ObjectId(idCliente), 
                                              pedidos:{$elemMatch:{_id:new mongoose.Types.ObjectId(idPedido), 'metodoPago.tipo':'PayPal','metodoPago.detalles.estado':'PENDING'}}
                                            },
                                            {
                                              $set: {
                                                'pedidos.$.metodoPago.detalles.estado': 'COMPLETED',
                                                'pedidos.$.metodoPago.detalles.capturaResult': resCapturePayPal
                                              }
                                            }
                                        );
        //4º redirigir al cliente a una pagina de la tienda donde se le notifique que el pago se ha realizado con exito

        //--1º problema: si DEVUELVO UN JSON al popup de paypal, este no lo va a saber interpretar, te lo muestra tal cual en la pantalla
        //res.status(200).send({ codigo:0, mensaje:'pago en PayPal capturado ok...', detallesCapture: resCapturePayPal });

        //--2º problema, podria redirigir a un componente de la tienda de confirmacion de pago ok, el problema esta que tienes 2 VENTAS ABIERTAS con componentes
        //diferentes de la tienda, en la ventana padre --> componnente Finalizar.jsx y 
        // en la ventana popup de paypal ---> componente FinPedidoOK.jsx
        //res.status(200).redirect(`http://localhost:5173/Pedido/FinPedidoOK?idCliente=${idCliente}&idPedido=${idPedido}&captureOrder=${JSON.stringify(resCapturePayPal)}`);
        
        //--3º solucion mando al popup un script js que obligue a que se cierre el popup y mande un mensaje a la ventana padre con los datos necesarios
        res.status(200).send(
            `   <!DOCTYPE html>
                <html>
                <body>
                    <script>
                        //comunicamos a la ventana padre los datos del pago ok en paypal
                        window.opener.postMessage(
                            {
                                idCliente: '${idCliente}',
                                idPedido: '${idPedido}',
                                captureOrder: ${JSON.stringify(resCapturePayPal)}
                            },
                            '*'
                        );
                        window.close();
                    </script>                
                </body>
                </html>
            `
        )

    } catch (error) {
        console.log('error en PayPalCallback:', error);
        //res.status(200).send({ codigo:1, mensaje:`error en PayPalCallback: ${error}` });
        //res.status(200).redirect(`http://localhost:5173/Pedido/FinPedidoOK?idCliente=${idCliente}&idPedido=${idPedido}&pagoCancelado=true`);
                res.status(200).send(
            `   <!DOCTYPE html>
                <html>
                <body>
                    <script>
                        //comunicamos a la ventana padre los datos del pago ok en paypal
                        window.opener.postMessage(
                            {
                                idCliente: null,
                                idPedido: null,
                                pagoCancelado: true
                            },
                            '*'
                        );
                        window.close();
                    </script>                
                </body>
                </html>
            `
        )
    }
});
module.exports=objetoRoutingTienda;