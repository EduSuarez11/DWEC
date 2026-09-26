//modulo de codigo q exporta un objeto de enrutamiento Router de express para gestionar
//las peticiones http que llegan a las rutas que empiezan por /api/Cliente/....
const express=require('express');
const bcrypt=require('bcrypt');
const { MongoClient, ObjectId }=require('mongodb');
const MailJetService=require('../../servicios/MailJetService'); //<---- esta variable tiene todo el objeto "module.exports" del modulo MailJetService.js
const JWTService=require('../../servicios/JWTService'); //<---- esta variable tiene todo el objeto "module.exports" del modulo JWTService.js


const objetoRoutingCliente=express.Router(); //objeto de enrutamiento Router de express

// console.log('vigencia de jwt predefinida en JWTService:', JWTService.vigenciaMaximaTokens);
// console.log('invocando a meotodo de generacion de token del servicio:', 
//               JWTService.generarJWT( 
//                                       { idCliente:'adsfasfd', emial:'hola@gmail.com'} , //<---1º parametro payload del metodo
//                                       { issuer:'myservidornode'} //<---2º parametro opcionesJWT del metodo, se pueden incluir opciones como issuer, subject, audience, expiresIn, etc. para configurar el token JWT a generar
//                                     ) 
//             );
//console.log("------------------- contenido de la variable express:", express);
const clienteMongoDB=new MongoClient(process.env.MONGODB_URL); //creo un cliente de conexion a mongodb usando la url de conexion definida en el fichero .env


const multer=require('multer');
const storage=multer.memoryStorage();
const middleMulter=multer(
  { 
    storage: storage,
    limits: { 
              fileSize: 5 * 1024 * 1024 , // Limite de tamaño de archivo a 5MB
              limits: 10, // Limite de número de archivos a 10
             }
   }
  ); //configuro multer para que almacene los archivos subidos en memoria, en vez de almacenarlos en el disco del servidor, esto es útil para luego procesar los archivos directamente desde la memoria y subirlos a un servicio de almacenamiento en la nube como Cloudinary, sin necesidad de guardarlos temporalmente en el disco del servidor


objetoRoutingCliente.post('/api/Cliente/PublicarAnuncio', middleMulter.array('fotos'), async (req,res,next)=>{
    try {
       //si quiero interceptar los errores de multer, por ejemplo si se supera el limite de tamaño de archivo o el limite de numero de archivos, tengo que pasarle a multer
       //  una funcion personalizada para manejar los errores, y esa funcion personalizada se la paso como parametro a multer, en vez de usar middleMulter.array('fotos')
       //  directamente como middleware, uso middleMulter.array('fotos')(req,res, (err)=>{...}) y en esa funcion personalizada puedo manejar los errores de multer, por ejemplo:
        // middleMulter.array('fotos')(req,res, (err)=>{
        //     if(err){
        //         console.log('Error en multer al procesar las fotos:', err);
        //         return res.status(400).send({ codigo: 1, mensaje: 'Error al procesar las fotos: ' + err.message });
        //     }
        // segun la doc.oficial mejor invocar la funcion middleware de multer dentro del propio endpoint, para poder manejar los errores de multer de forma personalizada, y 
        // asi evitar que multer envie una respuesta de error por defecto al cliente sin pasar por nuestro control, lo que nos permite enviar una respuesta de errorç
        //  personalizada  (segun doc.oficial):
        //
        // const multer = require('multer')
        // const upload = multer().single('avatar')

        // app.post('/profile', function (req, res) {
        //   upload(req, res, function (err) {
        //     if (err instanceof multer.MulterError) {
        //       .... A Multer error occurred when uploading.
        //     } else if (err) {
        //       .... An unknown error occurred when uploading.
        //     }

        //     // Everything went fine.
        //   })
        // })        
        console.log('req.body recibido en PublicarAnuncio:', req.body);
        console.log('req.files recibido en PublicarAnuncio:', req.files);
        
        const { idCliente, datosAnuncio } = req.body;
        const anuncioSinFotos = JSON.parse(datosAnuncio);
        const fotos = req.files; // Array de archivos de fotos

        if (!idCliente || !datosAnuncio) throw new Error('Faltan datos obligatorios: idCliente o datosAnuncio');
        
        await clienteMongoDB.connect(); 
        //no puedo generar ObjectId a partir de un string como idCliente usando: new MongoClient.ObjectId(idCliente) porque MongoClient no tiene la clase ObjectId, 
        // sino que la clase ObjectId esta en el modulo mongodb, por lo que tengo que importar la clase ObjectId del modulo mongodb y usarla para generar 
        // el ObjectId a partir del string idCliente, quedaria asi:

        const cliente=await clienteMongoDB.db(process.env.MONGODB_DB_NAME).collection('clientes').findOne({ _id: new ObjectId(idCliente) });
        if (!cliente) throw new Error('Cliente no encontrado con idCliente: ' + idCliente);

        const nuevoAnuncio={
          _id: new ObjectId(), //genero un nuevo ObjectId para el anuncio
          ...anuncioSinFotos,
          estado: 'activo', //<--- puede valer vendido, eliminado, pendiente de revision, etc....
          likes:0,
          visitas:0,
          fechaPublicacion: Date.now(),
          fechaModificacion: Date.now(),
          mensajes:[],
          fotos: fotos.map( 
                foto => ({
                        data: `data:${foto.mimetype};base64,${foto.buffer.toString('base64')}`,
                        originalname: foto.originalname,
                        mimetype: foto.mimetype,
                        size: foto.size
                      }) 
              ) //convierto cada foto del array de fotos subidas en un objeto con la info de la foto y el contenido de la foto codificado en base64, para poder almacenarlo en mongodb directamente como parte del anuncio, sin necesidad de subir las fotos a un servicio de almacenamiento en la nube como Cloudinary, aunque esta no es la mejor practica para almacenar fotos en una aplicacion real, lo ideal seria subir las fotos a un servicio de almacenamiento en la nube y almacenar solo la url de cada foto en el anuncio, pero para simplificar el ejemplo y no tener que configurar un servicio de almacenamiento en la nube, vamos a almacenar las fotos directamente en mongodb codificadas en base64
        };
        
        //lo suyo seria antes de insertar el anuncio en el array de productosVenta del cliente, comprobar si ya existe un anuncio igual o similar:
        // - mismo titulo y descripcion
        //- mismas fotos (comparando el contenido de las fotos codificado en base64, o el nommbre de las fotos, o el hash de las fotos, etc...)
        // - etc... para evitar anuncios duplicados o muy similares, pero por simplicidad no vamos a hacer esa comprobacion en este ejemplo
        const updateCliente=await clienteMongoDB.db(process.env.MONGODB_DB_NAME)
                                              .collection('clientes')
                                              .findOneAndUpdate(
                                                          { _id: new ObjectId(idCliente) },
                                                          { $push: { productosVenta: nuevoAnuncio } }
                                                        );
        if (!updateCliente) throw new Error('Error al publicar el anuncio, no se ha podido actualizar el cliente con el nuevo anuncio');
        res.status(200).send({ codigo: 0, mensaje: 'Anuncio publicado correctamente', datos: { anuncio: nuevoAnuncio } });

    } catch (error) {
        console.log('Error al publicar anuncio:', error);
        res.status(200).send({ codigo: 1, mensaje: 'Error al publicar anuncio' });
    }
});
    


objetoRoutingCliente.use('/LoginEmail', async (req, resp, next) => {
    try {
        // Recibo en el req.body el email  la password y el token de ReCaptcha

        //#region ---- verificamos el token  de reCAPTCHA para asegurarnos de que la petición de login no es realizada por un bot, sino por un usuario humano.
        // Para ello, hacemos una petición al servicio de verificación de reCAPTCHA de Google, pasando el token recibido desde el cliente y la clave secreta del sitio (definida en el fichero .env)
        //  como parámetros. 
        console.log("datos recibidos en el req.body para login: ", req.body);
        
        const bodyPeticionVerificacionRecaptcha = {
          "event": {
            "token": req.body.tokenReCAPCTHA, //token de reCAPTCHA recibido desde el cliente en el req.body
            "siteKey": process.env.GOOGLE_RECAPTCHA_SITE_KEY, //clave de recaptcha
            "userAgent": req.headers['user-agent'],
            "userIpAddress": req.ip,
            "ja3": "JA3",
            "expectedAction": "login",
          }
        }
        const urlVerificacionRecaptcha = `https://recaptchaenterprise.googleapis.com/v1/projects/wallapop-488618/assessments?key=${process.env.GOOGLE_API_KEY}`;
        const petGoogleRecaptcha = await fetch(
                                                urlVerificacionRecaptcha,
                                                 {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json'},
                                                  body: JSON.stringify(bodyPeticionVerificacionRecaptcha)
                                                }
                                            );
        const resGoogleRecaptcha = await petGoogleRecaptcha.json();
        //interpretacion de resultados: https://docs.cloud.google.com/recaptcha/docs/interpret-assessment-website?hl=es_419
        //en propiedad "tokenProperties" existe prop. valid que indica si el token de reCAPTCHA es válido o no
        //en propiedad "riskAnalysis" existe prop. score que indica el nivel de riesgo de la petición, siendo 0.0 la puntuación de riesgo más alta (probabilidad de ser un bot)
        // y 1.0 la puntuación de riesgo más baja (probabilidad de ser un usuario humano)
        
        console.log("respuesta de google a la verificacion de reCAPTCHA: ", resGoogleRecaptcha);
        // if ( ! resGoogleRecaptcha.tokenProperties.valid || resGoogleRecaptcha.riskAnalysis.score < 0.5 ) {
        //   throw new Error('Verificación de reCAPTCHA fallida, la petición podría ser realizada por un bot');

        // }
        // Si la verificación es exitosa, el servicio de Google nos devolverá una respuesta indicando que el token es válido y que la petición proviene de un usuario humano.
        // Si la verificación falla, significa que el token no es válido o que la petición podría ser realizada por un bot, y en ese caso se lanzará un error indicando que la verificación de reCAPTCHA ha fallado.


        //#endregion --------------------------------------------------------------

        await clienteMongoDB.connect(); //conecto el cliente de conexion a mongodb, a la url de conexion definida en el fichero .env
        const wallapopDB = clienteMongoDB.db(process.env.MONGODB_DB_NAME);
        
        // const clientes=await wallapopDB.collection('clientes').find().toArray();
        // console.log('Clientes registrados en la coleccion clientes de mongodb:', clientes);

        const existeCiente = await wallapopDB.collection('clientes').findOne({ 'cuenta.email': req.body.email});

        if (!existeCiente) throw new Error('Login invalido, email incorrecto');

        if (!existeCiente.cuenta.cuentaActivada) throw new Error('Debes activar la cuenta')
        // Mandar un correo a la cuenta de usuario con un nuevo token de activacion

        if (!bcrypt.compareSync(req.body.password, existeCiente.cuenta.password)) throw new Error('Password incorrecta, login incorrecto');

        const accessToken = JWTService.generarJWT({ email:existeCiente.cuenta.emaiL, idCliente: existeCiente._id }, { expiresIn: '1h' })
        const refreshToken = JWTService.generarJWT({ email: existeCiente.cuenta.email, idCliente: existeCiente._id }, { expiresIn: '24h' })

        
        resp.status(200).send({ codigo: 0, mensaje: 'Login ok', datos: { datosCliente: existeCiente, accessToken, refreshToken } })

    } catch (error) {
        console.log('Error en el login: ', error);
        resp.status(200).send({ codigo: 1, mensaje: 'Error en login' });
    }

}) 


objetoRoutingCliente.use("/Registro", async (req,res, next)=>{
  try {
    //en req.body vienen los datos del cliente a registrar mandados desde REACT...{ nombre: '...', email:'...', password:'...' }


    //1º contectarme a mongodb a la coleccion clientes
    await clienteMongoDB.connect(); //conecto el cliente de conexion a mongodb, a la url de conexion definida en el fichero .env
    const wallapopDB=clienteMongoDB.db(process.env.MONGODB_DB_NAME);

    //2º insertar el nuevo cliente con los datos que vienen en req.body OJO!!! comprobar q el email no este ya dado de alta
    const existeCiente=await wallapopDB.collection('clientes').findOne({ 'cuenta.email': req.body.email });
    if (existeCiente) throw new Error("ya existe un cliente registrado con ese email");

    const resInsert=await wallapopDB
                    .collection('clientes')
                    .insertOne(
                       {
                        nombreCompleto: req.body.nombre,
                        cuenta: {
                          email: req.body.email,
                          password: bcrypt.hashSync(req.body.password, 10), //<---- no almacenar la contraseña en texto plano!!!
                          activada: false,
                          fechaCreacionCuenta: Date.now(),
                          imagenAvatar:''
                        },
                        direcciones:[],
                        productosVenta:[],
                        productosComprados:[],
                        favoritos:[],
                        valoraciones:[],
                       } 
                      );
      console.log("resultado del insert en coleccion CLIENTES:", resInsert);
    
    //3º si todo ok mandar correo de activacion de cuenta, con un token JWT de activacion firmado por nuestro server y de duracion corta
    if ( ! resInsert.acknowledged) throw new Error("error al insertar el nuevo cliente en la coleccion clientes de mongodb");
    await MailJetService.mandarEmail( 
                                      { nombre: req.body.nombre, email: req.body.email, idCliente: resInsert.insertedId }, 
                                      "Activación de cuenta Wallapop"
                                     ); //genero un token JWT de activacion firmado por nuestro server y de duracion corta, con el email del cliente a activar como payload, y se lo paso al metodo de envio de correo de activacion de cuenta del servicio MailJetService para que lo incluya en el enlace de activacion del correo

    //4º mandar respuesta al cliente con codigo 0 y mensaje de exito

    res.status(200).send( { codigo: 0, mensaje: "registro de cliente realizado con exito" } );

  } catch (error) {
    console.log("Error en el Registro de datos del cliente:", error);
    res.status(200).send( { codigo: 1, mensaje: `error en el registro de los datos del cliente: ${error.message}` } );
  }

}); 


objetoRoutingCliente.post("/ActualizarDatos/:operacion", async (req,res,next)=>{
        try{
            const operacion=req.params.operacion;
            const body=req.body || {};
            
            console.log(`POST /api/Cliente/ActualizarDatos/${operacion} -> body: ${JSON.stringify(body)}`);
            
            switch( operacion ){
                case 'DatosPersonales':
                    //Actualizar datos personales del cliente
                    break;

                case 'AddChat':
                    // Lógica para añadir un nuevo chat (deberia añadirselo tb al vendedor si no lo tienen ya)
                    await clienteMongoDB.connect();
                    
                    var _idNewChat=new ObjectId(); //generamos un nuevo _id para el chat, aunque realmente el id del chat lo genera el cliente de react con un UUID, pero aqui lo generamos para tenerlo en el formato correcto de ObjectId de mongodb y evitar problemas de formato al insertarlo en la coleccion de clientes
                    const resUpdateMisChats=await clienteMongoDB.db(process.env.MONGODB_DB_NAME)
                                                                .collection('clientes')
                                                                .updateOne(
                                                                        { _id: new ObjectId(body.idComprador) },
                                                                        { $push: { misChats: { 
                                                                                                _id: _idNewChat,
                                                                                                ...body,
                                                                                                idComprador: new ObjectId(body.idComprador), 
                                                                                                idVendedor: new ObjectId(body.idVendedor),
                                                                                                anuncioProducto: {
                                                                                                    ...body.anuncioProducto,
                                                                                                    id: new ObjectId(body.anuncioProducto.id)
                                                                                                }
                                                                                            }
                                                                                    }
                                                                        } //cierro $push
                                                                ); //cierro updateOne
                    if( resUpdateMisChats.modifiedCount === 0 ) throw new Error('No se ha añadido el nuevo chat al cliente');
                    break;
            }
            
            return res.status(200).send( { codigo:0, mensaje:`Operacion ${operacion} realizada correctamente`, datos: { idChat: _idNewChat } } );
        
        } catch(err){
            console.error('Error en ActualizarDatos:', err);
            return res.status(200).send({ codigo:5, mensaje:'Error del servidor en ActualizarDatos' });

        } finally {
            await clienteMongoDB.close();
        }   
    }
)
//#region ----------------- LOGIN CON GOOGLE mediante OAUTH 2.0 ---------------------------
//para solicitar a google la URL de autentificacion para el usuario, necesito oAuth2
//instalo paquete googleapis: npm install googleapis --save

const { google } = require('googleapis');
//cliente de oAuth2 que nuestro servidor de nodejs va a usar para solicitar a google cualquier info relacionada con el proceso de autenticacion de los usuarios con sus cuentas de google
const oauth2Client = new google.auth.OAuth2(
                            process.env.GOOGLE_OATUH2_CLIENT_ID,
                            process.env.GOOGLE_OATUH2_CLIENT_SECRET,
                            'http://localhost:3000/api/Cliente/GoogleCallback'
                    );

objetoRoutingCliente.use("/LoginGoogle", async (req,res,next)=>{
  try {
    //uso cliente de oAuth para solicitar a google la URL de autentificacion para el usuario, con los scopes(info q el usuario permite rescatar y dar a nuestro sefvidor nodejs) 
    // necesarios para obtener al menos su email y su perfil basico
    const scopes=[
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/user.addresses.read',
      'https://www.googleapis.com/auth/user.gender.read'

    ];
    const urlGoogle=oauth2Client.generateAuthUrl({
      access_type: 'offline', //necesario para obtener refresh token y poder solicitar nuevos access tokens a google cuando el access token inicial expire
      scope: scopes,
    });
    console.log("URL de autentificacion con google generada por el cliente de oAuth2:", urlGoogle);
    res.status(200).send( { codigo: 0, mensaje: "URL de autentificacion con google generada correctamente", datos: { urlGoogle } } );

  } catch (error) {
    console.log("Error en el login con Google:", error);
    res.status(200).send( { codigo: 4, mensaje: `error en el login con Google: ${error.message}` } ); 
  }
});

objetoRoutingCliente.use("/GoogleCallback", async (req,res,next)=>{
  try {
    //endpoint q invoca el servidor de google cuando el usuario ha metido sus creds. bien, y ha dado el ok para compartir su info con nuestra aplicacion. En la url va un codigo que deberemos intercambiar
    //por tokens de acceso y refresh de la API de google
    console.log("toda la url de callback de google:", req.url);
    console.log("callback de google invocado, en la url viene un codigo que debemos intercambiar por tokens de acceso y refresh de la API de google:", req.query);

    const { code } = req.query; //extraigo el codigo de la url de callback de google, que viene en el query string de la url
    const { tokens } = await oauth2Client.getToken(code);
    console.log("tokens de acceso y refresh obtenidos de google tras intercambiar el codigo del callback por tokens:", tokens);

    //usando esos tokens de acceso y refresh obtenidos de google gracias al codigo de acceso, puedo ya solicitar informacion del perfil del usuario (siempre q se haya autorizado con los scopes necesarios)
    //  a la api: PEOPLE-API de google
    //configuro el cliente de oAuth2 con los tokens de acceso y refresh obtenidos de google, para que los incluya en las peticiones a la API de google y asi poder obtener info del perfil del usuario
    oauth2Client.setCredentials(tokens); 
    const peopleApi = google.people({ version: 'v1', auth: oauth2Client });

    //https://developers.google.com/people/api/rest/v1/people/get?apix_params=%7B%22resourceName%22%3A%22people%2Fme%22%2C%22personFields%22%3A%22emailAddresses%2Cgenders%2Cphotos%22%7D
    const userInfo= await peopleApi.people.get(
      {
      resourceName: 'people/me', 
      personFields: 'emailAddresses,genders,names,photos'
      }
  );

    console.log("info del perfil del usuario obtenida de google mediante la PEOPLE-API:", userInfo.data);
    const emailUsuarioGoogle = userInfo.data.emailAddresses && userInfo.data.emailAddresses.length > 0 ? userInfo.data.emailAddresses[0].value : null;
    const nombreUsuarioGoogle = userInfo.data.names && userInfo.data.names.length > 0 ? userInfo.data.names[0].givenName : null;
    const generoUsuarioGoogle = userInfo.data.genders && userInfo.data.genders.length > 0 ? userInfo.data.genders[0].value : null;
    const fotoUsuarioGoogle = userInfo.data.photos && userInfo.data.photos.length > 0 ? userInfo.data.photos[0].url : null;

    res.status(200).send( { codigo: 0, mensaje: "Login con Google correcto, info del perfil del usuario obtenida de google mediante la PEOPLE-API", datos: { userInfo:{ email: emailUsuarioGoogle, nombre: nombreUsuarioGoogle, genero: generoUsuarioGoogle, foto: fotoUsuarioGoogle } } } );
    
  } catch (error) {
    console.log("Error en el callback de Google:", error);
    res.status(200).send( { codigo: 5, mensaje: `error en el callback de Google: ${error.message}` } ); 
  }
});
//#endregion ------------------------------------------------------------------------------

º
module.exports=objetoRoutingCliente;