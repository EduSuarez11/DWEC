import express, { Request, Response,NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import Cliente from '../../modelos/modelos_ORM/Cliente';
import jwtService from '../../servicios/JWTService';
import extractJWTfromHeaders from '../../custom_middlewares/extractJWTfromHeaders';

//-------------------- configuracion de multer para extraccion de ficheros mandados por clientes angular --------------------
// si no detecta errores de num.ficheros mandados o de tamaño maximo, multer añade propiedad "files" al objeto req de tipo Request,
import multer from "multer";
const multerMiddleware=multer(
    {
        storage: multer.memoryStorage(),
        limits: {
            files: 10, // Limitar a 10 archivos por solicitud
            fileSize: 5 * 1024 * 1024 // Limitar a 5 MB por archivo
        }
    }
);
// --------------------------------------------------------------------------------------------------------------------------


const routerCliente = express.Router();

//#region ----------------------- ENDPOINTS ZONA CLIENTE --------------------------------------------------------
routerCliente.post('/ActualizarDatos/:operacion', async (req:Request, res:Response, next:NextFunction) => {
        try{
            const operacion=req.params.operacion;
            const body=req.body || {};
            
            console.log(`POST /ActualizarDatos/${operacion} -> body:`,body);
            
            switch( operacion ){
                case 'DatosPersonales':
                    //Actualizar datos personales del cliente

                    break;

                case 'AddChat':
                    // Lógica para añadir un nuevo chat (deberia añadirselo tb al vendedor si no lo tienen ya)
                    // Conectar solo si no estamos conectados (readyState === 1 significa conectado)
                    if (mongoose.connection.readyState !== 1) {
                        console.log('No hay conexión activa a la base de datos, estableciendo nueva conexión...');
                        await mongoose.connect(process.env.MONGODB_URL as string, { dbName: process.env.MONGODB_DB_NAME! });
                    }

                    const _idNewChat = new mongoose.Types.ObjectId(); //generamos un nuevo _id para el chat

                    // Usar el modelo Mongoose para respetar esquemas y obtener el documento actualizado
                    const resUpdateComprador = await Cliente.findOneAndUpdate(
                        { _id: new mongoose.Types.ObjectId(body.datosComprador.idComprador) },
                        { $push: { misChats: {
                                                _id: _idNewChat,
                                                ...body,
                                                datosComprador:{
                                                    idComprador: new mongoose.Types.ObjectId(body.datosComprador.idComprador),
                                                    nombreCompleto: body.nombreCompletoComprador
                                                },
                                                datosVendedor:{
                                                    idVendedor: new mongoose.Types.ObjectId(body.datosVendedor.idVendedor),
                                                    nombreCompleto: body.nombreCompletoVendedor
                                                },
                                                anuncioProducto: {
                                                    ...body.anuncioProducto,
                                                    _id: new mongoose.Types.ObjectId(body.anuncioProducto._id)
                                                }                                            }
                                        }
                        },
                        { returnDocument: 'after' }
                    );
                    console.log('Resultado de findOneAndUpdate para añadir nuevo chat al comprador:', resUpdateComprador);
                    if( !resUpdateComprador ) throw new Error('No se ha encontrado el cliente comprador para añadir el nuevo chat');

                    // const resUpdateMisChats=await Cliente.updateOne(
                    //                                                 { _id: new mongoose.Types.ObjectId(body.idComprador) },
                    //                                                 { $push: { misChats: { 
                    //                                                                         _id: _idNewChat,
                    //                                                                         ...body,
                    //                                                                         idComprador: new mongoose.Types.ObjectId(body.idComprador), 
                    //                                                                         idVendedor: new mongoose.Types.ObjectId(body.idVendedor),
                    //                                                                         anuncioProducto: {
                    //                                                                             ...body.anuncioProducto,
                    //                                                                             id: new mongoose.Types.ObjectId(body.anuncioProducto.id)
                    //                                                                         }
                    //                                                                     }
                    //                                                             }
                    //                                                 } //cierro $push
                    //                                             ); //cierro updateOne
                    // console.log('Resultado de updateOne para añadir nuevo chat al cliente:', resUpdateMisChats);
                    // if( resUpdateMisChats.modifiedCount === 0 ) throw new Error('No se ha añadido el nuevo chat al cliente');
                    return res.status(200).send( { codigo:0, mensaje:`Operacion ${operacion} realizada correctamente`, datos: { idChat: _idNewChat } } );

                    break;
            }
            
        
        } catch(err){
            console.error('Error en ActualizarDatos:', err);
            return res.status(200).send({ codigo:5, mensaje:'Error del servidor en ActualizarDatos' });
        } finally {
            mongoose.connection.close();
        }
});

routerCliente.post("/Login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, tokenReCAPTCHA } = req.body;
        console.log('===> Login: email:', email, 'password:', password, 'tokenReCAPTCHA:', tokenReCAPTCHA);
        
        //#region ---- verificamos el token  de reCAPTCHA para asegurarnos de que la petición de login no es realizada por un bot, sino por un usuario humano.
        // Para ello, hacemos una petición al servicio de verificación de reCAPTCHA de Google, pasando el token recibido desde el cliente y la clave secreta del sitio (definida en el fichero .env)
        //  como parámetros. 
        
        // const bodyPeticionVerificacionRecaptcha = {
        //   "event": {
        //     "token": tokenReCAPTCHA, //token de reCAPTCHA recibido desde el cliente en el req.body
        //     "expectedAction": "LOGIN",
        //     "siteKey": process.env.GOOGLE_RECAPTCHA_SITE_KEY, //clave de recaptcha
        //   }
        // }
        // const urlVerificacionRecaptcha = `https://recaptchaenterprise.googleapis.com/v1/projects/wallapop-488618/assessments?key=${process.env.GOOGLE_API_KEY}`;
        // const petGoogleRecaptcha = await fetch(
        //                                         urlVerificacionRecaptcha,
        //                                          {
        //                                           method: 'POST',
        //                                           headers: { 'Content-Type': 'application/json'},
        //                                           body: JSON.stringify(bodyPeticionVerificacionRecaptcha)
        //                                         }
        //                                     );
        // const resGoogleRecaptcha = await petGoogleRecaptcha.json();

        //interpretacion de resultados: https://docs.cloud.google.com/recaptcha/docs/interpret-assessment-website?hl=es_419
        //en propiedad "tokenProperties" existe prop. valid que indica si el token de reCAPTCHA es válido o no
        //en propiedad "riskAnalysis" existe prop. score que indica el nivel de riesgo de la petición, siendo 0.0 la puntuación de riesgo más alta (probabilidad de ser un bot)
        // y 1.0 la puntuación de riesgo más baja (probabilidad de ser un usuario humano)
        
        // console.log("respuesta de google a la verificacion de reCAPTCHA: ", resGoogleRecaptcha);
        // if ( ! resGoogleRecaptcha.tokenProperties.valid || resGoogleRecaptcha.riskAnalysis.score < 0.5 ) {
        //   //throw new Error('Verificación de reCAPTCHA fallida, la petición podría ser realizada por un bot');
        // }

        // Si la verificación es exitosa, el servicio de Google nos devolverá una respuesta indicando que el token es válido y que la petición proviene de un usuario humano.
        // Si la verificación falla, significa que el token no es válido o que la petición podría ser realizada por un bot, y en ese caso se lanzará un error indicando que la verificación de reCAPTCHA ha fallado.


        //#endregion --------------------------------------------------------------
        
        await mongoose.connect(process.env.MONGODB_URL as string);
        
        const cliente = await Cliente.findOne({ "cuenta.email": email }).exec();
        if (!cliente) throw new Error("Usuario no encontrado con ese Email");

        const passwordMatch = await bcrypt.compare(password, cliente!.cuenta!.password);
        if (!passwordMatch) throw new Error("Contraseña incorrecta");

        const accessToken:string= jwtService.generarJWT({ id: cliente._id.toString(), email: cliente.cuenta!.email }, { expiresIn: 60*60});
        const refreshToken:string= jwtService.generarJWT({ id: cliente._id.toString(), email: cliente.cuenta!.email }, { expiresIn: 3*60*60 });

        console.log('===> Login exitoso datos a mandar a angular:', { cliente, accessToken, refreshToken });
        res.status(200).send({ codigo: 0, mensaje: "Login exitoso", datos: { cliente, accessToken, refreshToken } });

    } catch (error) {
        console.log('===> error en Login...', error);
        res.status(200).send({ codigo: 1, mensaje: `Error en Login: ${error}`});
    } finally {
        await mongoose.connection.close();
    }
});

routerCliente.post("/ComprobarEmail", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        console.log('===> ComprobarEmail: email:', email);
        await mongoose.connect(process.env.MONGODB_URL as string);
        
        const cliente = await Cliente.findOne({ "cuenta.email": email }).exec();
        if (!cliente) throw new Error("Usuario no encontrado con ese Email");

        console.log('===> ComprobarEmail exitoso datos a mandar a angular:', { cliente });
        res.status(200).send({ codigo: 0, mensaje: "Email encontrado" }); 

    } catch (error) {
        console.log('===> error en ComprobarEmail...', error);
        res.status(200).send({ codigo: 1, mensaje: `Error en ComprobarEmail: ${error}`});
    } finally {
        await mongoose.connection.close();
    }
});

routerCliente.post("/SubirAnuncio",
                extractJWTfromHeaders, //<-------------------------------------------- 1º funcionm middleware q extrae tokens de acceso, sino existen respuesta de error directa....
                 multerMiddleware.array('fotos'),  // <------------------------------- 2º funcion middleware para extraer las fotos mandadas por cliente angular en campo "fotos" del Multipart/form-data
                 async (req: Request, res: Response, next: NextFunction) => { // <---- 3º funcion middleware q procesa la info y almacena en BD
                        try {
                            console.log('===> SubirAnuncio: datos recibidos en el cuerpo de la petición:', req.body);
                            console.log('===> SubirAnuncio: archivos recibidos en la petición (extraidos por multer y añadidos al objeto req):', req.files);
                            console.log('===> SubirAnuncio: datos del cliente autenticado extraidos del accessToken por el middleware extractJWTfromHeaders y añadidos al objeto req:', (req as any).accessPayLoad, (req as any).nuevoAccessToken);

                            //aqui iria la lógica para procesar los datos recibidos, almacenar el nuevo anuncio en la base de datos, etc...
                            const datosAnuncio = JSON.parse(req.body.datos);
                            const { id, email } = (req as any).accessPayLoad; //datos del cliente autenticado extraidos del accessToken por el middleware extractJWTfromHeaders y añadidos al objeto req

                            if( id !== datosAnuncio.idCliente) throw new Error('El id del cliente autenticado en el token no coincide con el idCliente asociado al anuncio recibido en el cuerpo de la petición, posible manipulación de datos');
                            if(! datosAnuncio) throw new Error('No se han recibido los datos del anuncio en el cuerpo de la petición o no tienen el formato correcto');

                            const nuevoAnuncio:any={
                                _id: new mongoose.Types.ObjectId(),
                                ...datosAnuncio,
                                estadoVenta:'Disponible', //<---- campo con valores posibles: "Disponible", "Reservado", "Vendido","Borrador",....
                                fechaPublicacion: Date.now(),
                                fechaModificacion: Date.now(),
                                likes:0,
                                visitas:0,
                                mensajes:[],
                                fotos: (req.files as Express.Multer.File[]).map( file => ({
                                    data: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                                    originalName: file.originalname,
                                    mimetype: file.mimetype,
                                }))
                            };
                            //mejo objeto nuevoAnuncio en el documento del cliente con id recibido del token, añadiendolo a la prop. q es un array "productosVenta"
                            await mongoose.connect(process.env.MONGODB_URL as string);

                            const clienteUpdated=await Cliente.findByIdAndUpdate(
                                { _id: new mongoose.Types.ObjectId(id) },
                                { $push: { productosVenta: nuevoAnuncio } },
                                { returnDocument: 'after' }
                            );

                            console.log('===> SubirAnuncio: cliente actualizado con nuevo anuncio añadido a su array de productosVenta:', clienteUpdated);
                            if (!clienteUpdated) throw new Error('No se ha podido actualizar el cliente con el nuevo anuncio, posible error en la base de datos');

                            //al cliente de angular mando: nuevo anuncio, y el posible nuevo accessToken refrescado si hubiese caducado
                            res.status(200).send(
                                { codigo: 0, 
                                  mensaje: "Anuncio subido exitosamente", 
                                  datos: { 
                                    anuncio: nuevoAnuncio,
                                    nuevoAccessToken: (req as any).nuevoAccessToken 
                                    } 
                                }
                            );    
                        } catch (error) {
                            console.log('===> error en SubirAnuncio...', error);
                            res.status(200).send({ codigo: 1, mensaje: `Error en SubirAnuncio: ${error}`});
                        } finally {
                            await mongoose.connection.close();
                        }
});

//#region ----------------------- LOGIN CON GOOGLE usando OAuth 2.0 ----------------------------------
// para poder hacer uso de las apis de google (ya sea mediante clave API de servicio o clave de cliente oAuth2) necesito instalar paquete "googleapis" de google, que es el cliente oficial de google para hacer peticiones a sus apis desde nodejs.
// npm install googleapis --save <--------- no es necesaario instalar los tipos pq la libreria los incluye de forma nativa, al estar hecha en TypeScript
import { google, Auth, Common } from "googleapis";


//cliente de oAuth2 que nuestro servidor de nodejs va a usar para solicitar a google cualquier info relacionada con el proceso de autenticacion de los usuarios con sus cuentas de google
const oauth2Client: Auth.OAuth2Client = new google.auth.OAuth2(
                            process.env.GOOGLE_OATUH2_CLIENT_ID,
                            process.env.GOOGLE_OATUH2_CLIENT_SECRET,
                            'http://localhost:3000/GoogleCallback'
                    );

routerCliente.get("/LoginGoogle", async (req: Request, res: Response, next: NextFunction) => {
    try {
        //uso cliente de oAuth para solicitar a google la URL de autentificacion para el usuario, con los scopes(info q el usuario permite rescatar y dar a nuestro sefvidor nodejs) 
        // necesarios para obtener al menos su email y su perfil basico (scopes de PEOPLE API: https://developers.google.com/people/api/rest/v1/people/get#authorization-scopes)
        const scopes=[
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/user.addresses.read',
                'https://www.googleapis.com/auth/user.gender.read'
        ];
        const urlGoogle:string=oauth2Client.generateAuthUrl(
                                                            { 
                                                                access_type: 'offline', //necesario para obtener refresh token y poder solicitar nuevos access tokens a google cuando el access token inicial expire
                                                                scope: scopes,
                                                            }
                                                        );
        console.log("URL de autentificacion con google generada por el cliente de oAuth2:", urlGoogle);
        res.status(200).send( { codigo: 0, mensaje: "URL de autentificacion con google generada correctamente", datos: { urlGoogle } } );
                      
        
    } catch (error) {
        console.log('===> error en LoginGoogle...', error);
        res.status(200).send({ codigo: 1, mensaje: `Error en LoginGoogle: ${error}`});
    }
});

routerCliente.get("/GoogleCallback", async (req: Request, res: Response, next: NextFunction) => {
    try {
        //en url va parametro "code" que es el codigo de autorizacion que google nos devuelve tras el proceso de autentificacion del usuario en google, y que nuestro cliente de oAuth2
        //  puede intercambiar por un access token y un refresh token para poder solicitar a google la informacion del perfil del usuario autenticado invocando a PEOPLE API.
        const code=req.query.code;
        console.log('===> GoogleCallback: code de autorizacion recibido en el callback de google:', code);
        
        const { tokens }= await oauth2Client.getToken(code as string);
        console.log('===> GoogleCallback: tokens recibidos para acceder a APIS habilitadas en proyecto Wallapop, en nuestro caso People API:', tokens);

        oauth2Client.setCredentials(tokens);
        
        const peopleService=google.people({ version: 'v1', auth: oauth2Client });
        const resPeopleAPI= await peopleService.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,genders,names,photos,addresses' //<--- NO METER ESPACIOS ENTRE LOS CAMPOS de "personFields", SI NO, GOOGLE DEVUELVE ERROR DE BAD REQUEST, PORQUE ESPERA LOS CAMPOS SEPARADOS POR COMAS SIN ESPACIOS, EJEMPLO: 'emailAddresses,g
        });
        console.log('===> GoogleCallback: respuesta de People API con la informacion del perfil del usuario autenticado:', resPeopleAPI.data);
        // si devuelvo un JSON directamente el popup me lo pinta: res.status(200).send({ codigo: 0, mensaje: "Login con Google exitoso", datos: { perfilGoogle: resPeopleAPI.data } });
        // tengo q indicar al popup que mande a la venta padre los datos recuperados de People API, para ello uso "window.opener.postMessage" para enviar un mensaje a la ventana padre (componente LoginOAuth)
        //  con la informacion del perfil del usuario autenticado, y luego cierro el popup con "window.close()"

        //nos creamos un objeto Cliente con la informacion del perfil del usuario autenticado con Google, para luego almacenarlo en la base de datos de clientes de nuestra aplicacion, y asi tenerlo registrado como cliente que se ha autenticado con Google, y poder asociarle posteriormente productos a la venta o a la compra, valoraciones, etc...
        const nuevoClienteGoogle = new Cliente({
            nombreCompleto: resPeopleAPI.data.names ? resPeopleAPI.data.names[0]!.displayName : 'Sin nombre',
            cuenta: {
                email: resPeopleAPI.data.emailAddresses ? resPeopleAPI.data.emailAddresses[0]!.value : 'sin_email@example.com',
                password: '', //no tenemos contraseña porque el login se hace con Google, pero el campo es requerido en el esquema de Mongoose, asi que lo dejamos vacio o con un valor por defecto
                activada: true, //la cuenta ya se considera activada porque el usuario se ha autenticado con Google
                imagenAvatar: resPeopleAPI.data.photos ? resPeopleAPI.data.photos[0]!.url : '',
            },
            direcciones: [],
            productosVenta: [],
            productosCompra: [],
            valoraciones: [],
            favoritos: [],
        });
        //debemos generar tokens de autenticacion JWT para el nuevo cliente autenticado con Google, para que el cliente Angular pueda almacenarlos en su StorageGlobal y enviarlos en las cabeceras de las peticiones posteriores a nuestro servidor de nodejs, para que este pueda validar que el cliente esta autenticado y autorizado para realizar las acciones que requieran autenticacion.
        const accessToken:string= jwtService.generarJWT({ id: nuevoClienteGoogle._id.toString(), email: nuevoClienteGoogle.cuenta!.email }, { expiresIn: 60*60});
        const refreshToken:string= jwtService.generarJWT({ id: nuevoClienteGoogle._id.toString(), email: nuevoClienteGoogle.cuenta!.email }, { expiresIn: 3*60*60 });

        res.status(200).send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage(${JSON.stringify({ codigo: 0, mensaje: "Login con Google exitoso", datos: { perfilGoogle: nuevoClienteGoogle, tokens: { accessToken, refreshToken } } })}, "*");
                        window.close();
                    </script>
                </body>
            </html>
            `);

    } catch (error) {
        console.log('===> error en GoogleCallback...', error);
        //res.status(200).send({ codigo: 1, mensaje: `Error en GoogleCallback: ${error}`});
        res.status(200).send(`
            <html>
                <body>
                    <script>
                        window.opener.postMessage(${JSON.stringify({ codigo: 1, mensaje: "Login con Google fallido"})}, "*");
                        window.close();
                    </script>
                </body>
            </html>
            `);        
    } finally {
        await mongoose.connection.close();
        }
});
//#endregion -----------------------------------------------------------------------------------------


//endregion -------------------------------------------------------------------------------------------------------


export default routerCliente;