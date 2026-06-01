/*
 modulo de codigo q va a exportar un objeto javascript puro con los metodos para gestionar el pago con paypal
 es necesario primero hacer una peticion a paypal para obtener un token de acceso JWT e incluirlo en cada peticion
 a la API-REST de paypal
*/
//objeto simple en memoria para cachear el token JWT de acceso a paypal y su fecha de expiracion
//lo suyo seria usar una base de datos o un sistema de cacheo externo como REDIS (no almacenarlo en bd normales)
let cacheJWTAccessPaypal = {
    token: null,
    expiracion: null
};

async function CrearJWTAccesoPayPal(){
    //...codigo para crear el JWT de acceso a paypal...
    try {
        // comprobar si ya tenemos un token valido en cache
        if (cacheJWTAccessPaypal.token && cacheJWTAccessPaypal.expiracion > Date.now() ) {
            return cacheJWTAccessPaypal.token;
        }
        //si no es valido generamos uno nuevo...
        const peticion = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET).toString("base64")
            },
            body: "grant_type=client_credentials"
        });
        //formato de la respuesta de paypal: https://developer.paypal.com/api/rest/#link-sampleresponse
        //a la solicitud de jwt de acceso
        const datos = await peticion.json();

        if (peticion.ok) {
            cacheJWTAccessPaypal.token = datos.access_token;
            //establecer la expiracion del token 5 minutos antes de la real para evitar problemas y dejar margen de tiempo
            //para pedir uno nuevo ante posible latencia en la red
            cacheJWTAccessPaypal.expiracion = Date.now() + (datos.expires_in - 300) * 1000;
            
            return cacheJWTAccessPaypal.token;
        } else {
            throw new Error("No se pudo crear el JWT de acceso a PayPal");
        }
    } catch (error) {
        console.log("Error al crear el JWT de acceso a PayPal:", error);
        throw new Error("No se pudo crear el JWT de acceso a PayPal");
    }

}

module.exports = {
    Stage1_CreateOrderPaypal: async (idCliente, pedido)=>{
        try {
            //1º paso crear la orden de pago en paypal para el pedido q ha hecho el cliente con idCliente
            //debemos pasar en la peticion el jwt de acceso a paypal en cabecera Authorization: Bearer ....
            //https://developer.paypal.com/docs/api/orders/v2/#orders_create
            const jwtAcceso = await CrearJWTAccesoPayPal();
            
            //...construir el body de la peticion con los datos del pedido...
            const bodyCreateOrder = {
                intent:'CAPTURE',
                purchase_units:[
                    {
                        items: pedido.itemsPedido.map( item => (
                            {
                                name: item.producto.Nombre,
                                quantity: item.cantidad.toString(),
                                unit_amount:{ 
                                    currency_code:'EUR', 
                                    value: (item.producto.Precio * (1-item.producto.Oferta/100)).toFixed(2) 
                                }  
                            }
                        )), //<---- array de items de pedidos a desplegar en la pasarela de paypal cuando se procese el pago
                            //OJO!!! la suma del producto de la cantidad por el valor del precio de cada item debe coincidir con el valor total del pedido
                        amount:{ 
                                    currency_code:'EUR', 
                                    value: pedido.total.toFixed(2),
                                    //desglose del total NO OBLIGATORIO pero recomendable
                                    breakdown:{
                                        item_total: {  currency_code:'EUR',  value: pedido.subtotal.toFixed(2)  }, //<---subtotal
                                        shipping: {  currency_code:'EUR',  value: pedido.gastosEnvio.toFixed(2) }, //<---gastos de envio
                                    }
                                } 
                    }
                ],
                //urls de vuelta de conexion una vez procesado el pago en paypal por el cliente
                //la solucion de la ia es meter estas urls en propiedad application_context
                application_context:{
                    return_url: `http://localhost:3000/api/Tienda/PayPalCallback?idCliente=${idCliente}&idPedido=${pedido._id}`,
                    cancel_url: `http://localhost:3000/api/Tienda/PayPalCallback?idCliente=${idCliente}&idPedido=${pedido._id}&cancel=true`
                }
            }; 

            const petCreateOrder = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwtAcceso
                },
                body: JSON.stringify(bodyCreateOrder)
            });
            const datosCreateOrder = await petCreateOrder.json();
            console.log("Datos de la orden de PayPal:", datosCreateOrder);

            if (! petCreateOrder.ok) throw new Error("No se pudo crear la orden de pago en PayPal");
            
            return datosCreateOrder;

        } catch (error) {
            console.log("Error al crear la orden de pago en PayPal:", error);
            return null;
        }
    },
    
    Stage2_CapturePaymentForOrderPayPal: async (idOrderPayPal)=>{
        try {
            const jwtAcceso = await CrearJWTAccesoPayPal();
            const petCapturePayment = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${idOrderPayPal}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwtAcceso
                }
            });
            const datosCapturePayment = await petCapturePayment.json();
            console.log("Datos de la captura de pago en PayPal:", datosCapturePayment);

            if (! petCapturePayment.ok) throw new Error("No se pudo capturar el pago de la orden en PayPal");

            return datosCapturePayment;

        } catch (error) {
            console.log("Error al capturar el pago de la orden en PayPal:", error);
            return null;
        }
    }
}
