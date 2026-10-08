// #region ------------------------------------ MODULO PRINCIPAL DE ENTRADA A NODEJS ------------------------------------

/*  express funciona mediante la secuenciacion de una serie de modulos middleware (en nodejs son funciones JS)
    que se ejecutan en orden de declaracion

    |----------------------------------- PIPELINE O MIDDLEWARE STACK -----------------------------------|
    pet.cliente ----> func.middleware-1(req, res, next) --- next() ---> func2...
                                             ||
                                    en objeto "req" ---> HTTP-REQUEST
                                    del cliente la puede modificar
                                    en objeto "res" ---> HTTP-RESPONSE 
    para configurar el pipeline de express se emplean metodos de la clase Application de express, como por ejemplo:
        .use(['/ruta',] function(req, res, next) {...} ) ---> registra una funcion middleware que se ejecuta para todas las peticiones que hagan
                                                              los clientes SINO SE ESPECIFICA UNA RUTA

        .get('/ruta', function(req, res, next) {...} ) ---> registra una funcion middleware que se ejecuta para todas las peticiones GET que hagan los clientes a la ruta especificada
        .post('/ruta', function(req, res, next) {...} ) ---> registra una funcion middleware que se ejecuta para todas las peticiones POST que hagan los clientes a la ruta especificada
        ...

        REGLAS CONFIG PIPELINE EXPRESS
        ------------------------------
        - Poner las funciones middleware que se ejecutan para todas las rutas al principio de la configuracion
        (pq suelen modificar el objeto "req" del cliente y le añaden propiedades que luego pueden ser usadas por las demas funciones
        middleware) NUNCA GENERAN RESPUESTA
        - Poner las funciones middleware que se ejecutan para rutas especificas al final de la configuracion, especificando el metodo HTTP
        por el cual se accede a la ruta (get, post, etc). Estas funciones SI GENERAN RESPUESTA

*/
require('dotenv').config(); // <--- la funcion .config() lee el fichero .env y mete en objeto "process.env" las variables
// definidas como variables de entorno del sistema operativo, para que puedan ser usadas en cualquier
// parte del codigo de nodejs

const express = require("express"); // el modulo express exporta una funcion que asignamos a variable
const cookieParser = require("cookie-parser"); // <--- el modulo "cookie-parser" exporta una funcion que asignamos a variable "cookieParser"
const cors = require('cors');
const mongodb = require('mongodb'); // <--- el modulo "mongodb" exporta un objeto que asignamos a variable "mongodb" que expone props.
const clienteConexionMongoDB = new mongodb.MongoClient(process.env.MONGODB_URL); // <--- en atlas la cadena conexion varia: mongodb+srv//<usuario>:<password>@<cluster>
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
//console.log(`Valor de la variable express ${express}`);

// que al ejecutarla nos devuelve in objeto Application de Express: https://expressjs.com/en/5x/api/application/
// que es un servidor web que podemos configurar y ejecutar para atender peticiones HTTP.
// para lo cual se usa el metodo .listen()

const server = express();
// ---------------------------------------------- CONFIG PIPELINE: middleware-stack de express ----------------------------------------------
// server.use(function (req, res, next) {
//     console.log(`Peticion entrante: ${req.method} ${req.url}`);
//     next();
//     //res.status(200).send("Hola cliente... he recibido tu peticion y te devuelvo esta respuesta desde el servidor web en nodejs");
// });

server.use(express.json()); // <--- 1º funcion middleware, lo que hace es meter en prop. "req.body" del objeto HTTP-REQUEST
// del cliente, los datos del cuerpo de la peticion HTPP si es un JSON alido, para que luego pueda ser
// usado por los demas middlewares.

server.use(express.urlencoded({ extended: true })) // <--- 2º funcion middleware. extrae las variables del querystring de la URL
// crear un objeto JS: {variable_Query: valor, ...} y lo mete en prop. "req.query"

server.use(cookieParser()); // <--- 3º funcion middleware, extrae las cookies de la cabecera Cookies del HTTP-REQUEST del cliente 
// crea un objeto JS: {nombreCookie: valor, ...} y lo mete en prop. "req.cookies"

server.use(cors()) // <--- 4º funcion middleware, habilita CORS.

server.get("/api/Tienda/Categorias", async function (req, res, next) {
    try {
        console.log(`Peticion entrante: ${req.method} ${req.url}`);
        // 1º paso: conectarme a la BD, usando un cliente de conexion a MongoDB: mongodb <--- driver nativo para nodejs de mongodb
        await clienteConexionMongoDB.connect();

        // 2º paso: ejecutar la consulta a la BD de MongoDB para recuperar las categorias de productos (en principio solo
        // quiero las principales o raices, es decir, las que no tienen padre por encima) 
        // <--- query: db['PcComponentes'].categorias.find({ tipo: '...' }) <=== resultado: array de objetos a devolver al cliente en variable _categorias
        let _categorias = await clienteConexionMongoDB.db(process.env.MONGODB_DBNAME)
            .collection('categorias')
            .find({
                pathCat: { $regex: /^\d+$/ }
            })
            .toArray();

        console.log('Categorias recup: ', _categorias);

        // 3º paso: devolver la respuesta al cliente con el resultado de la operacion contra la BD
        res.status(200).send(
            {
                codigo: 0, // <---- codigo de resultado de la operacion contra la bd, si es 0 OK, en caso contrario sera un error
                mensaje: 'categorias recuperadas correctamente',
                categorias: _categorias
            }
        );
    } catch (error) {
        console.log(`Error al recuperar las categorias de la BD: ${error}`);
        res.status(200).send({ codigo: 1, mensaje: error.message, categorias: [] });
    }
});


server.post('/api/Cliente/Login', async function (req, res, next) {
    try {
        // en req.body la funcion middleware express.json() ha metido el objeto {email: '...', password: '...'}
        // para procesarlo en este endpoint
        const { email, password } = req.body;

        // 1º paso: conectarme a la bbdd y comprobar si existe un usuario con ese email
        await clienteConexionMongoDB.connect();

        const usuario = await clienteConexionMongoDB.db(process.env.MONGODB_DBNAME)
            .collection('clientes')
            .findOne({ "cuenta.email": email })

        if (!clienteExiste) throw new Error("No existe un usuario con ese email")
        // 2º paso: si existe, comprobar si el hash que tiene almacenado coincide con el hash de la password que me ha enviado
        // SI NO ---> error de password incorrecta
        if (!bcrypt.compareSync(password, usuario.cuenta.password)) throw new Error("Contraseña incorrecta");


        // 3º paso: crear JWT con los datos del usuario que me interesen preservar en la sesion y
        // enviarselo al cliente (se podria usar una cookie)
        const token = jwt.sign({ email, _id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.status(200).send({ codigo: 0, mensaje: "Login ok", token });
    } catch (error) {
        res.status(200).send({ codigo: 2, mensaje: error.message, token: null });
    }
});


server.post('/api/Cliente/Registro', async function (req, res, next) {
    try {
        //en req.body la funcion middleware express.json() ha metido el objeto { nombre: '....', email: '...', password: '...'}
        //para procesarlo en este endpoint
        const { nombre, email, password } = req.body;

        //1º paso: contectarme a la BD y comprobar si ya existe un usuario con ese email, si existe --> error
        await clienteConexionMongoDB.connect();

        const _clienteExiste = await clienteConexionMongoDB.db(process.env.MONGODB_DBNAME)
            .collection('clientes')
            .findOne({ 'cuenta.emaail': email });
        if (_clienteExiste) throw new Error('Ya existe un usuario con ese email');

        //2º paso: si no existe, hashear la password con brcrypt.hashSync() y almacenar datos en coleccion "clientes"  de la BD
        const _resultadoInsert = await clienteConexionMongoDB.db(process.env.MONGODB_DBNAME)
            .collection('clientes')
            .insertOne(
                {
                    nombre: nombre,
                    apellidos: '',
                    cuenta: {
                        email: email,
                        password: bcrypt.hashSync(password, 10), //<--- hash de la password con 10 rondas de sal
                        activada: false,
                        telefono: ''
                    },
                    direcciones: [],
                    listaFavoritos: [],
                    pedidos: []
                }
            );
        console.log('Resultado de la insercion en la BD: ', _resultadoInsert);
        if (!_resultadoInsert.insertedId) throw new Error('No se ha podido insertar el cliente en la BD');

        //3º paso: generar un JWT de uso unico (caducidad muy breve) y mandarlo por email al cliente para que 
        //         confirme su registro, para ello se puede usar un servicio de envio de emails como nodemailer, sendgrid, etc

        /*
                        ENVIO DE EMAILS CON MAILJET USANDO SU API-REST
                        https://dev.mailjet.com/openapi/openapi-mailjet/send-emails/postsendv3
            necesario:
                - crear cuenta en mailjet.com y obtener claves publicas y privadas para usar su API-REST
                - mandar cada vez q hagas peticion a endpoint de mailjet una cabecera de autentificacion HTTP-BASIC
                  con este formato: 
                       Authorization: Basic <base64(publicKey:privateKey)>
                - url o endpoint a invocar por POST: https://api.mailjet.com/v3/send
                - en body de la peticion POST hay q enviar un JSON  con este formato
                  (añadir cabecera Content-Type: application/json):

                  {
                    "FromEmail":"pilot@mailjet.com", <------ email de registro en mailjet.com
                    "FromName":"Your Mailjet Pilot", <----- nombre de registro en mailjet.com 
                    "Recipients":[
                        {
                        "Email":"passenger@mailjet.com", <---- email del cliente q esta registrando 
                        "Name":"Passenger 1" <---------------- nombre del cliente
                        }
                    ],
                    "Subject":"Your email flight plan!", <---- asunto del email
                    "Html-part":"<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!"
                    }
        */

        const _codeBase64MailjetKeys = Buffer.from(`${process.env.MAILJET_PUBLIC_KEY}: ${process.env.MAILJET_SECRET_KEY}`).toString('base64');

        const _tokenActivacion = jwt.sign({ email: email, _id: _resultadoInsert.insertedId }, process.env.JWT_SECRET, { expiresIn: '10m' })

        const bodyEmail = {
            "FromEmail": "eduardo.suarez1@educa.madrid.org", //<------ email de registro en mailjet.com
            "FromName": "Administrador de PcComponentes", //<----- nombre de registro en mailjet.com 
            "Recipients": [
                {
                    "Email": email, //<---- email del cliente q esta registrando 
                    "Name": nombre //<---------------- nombre del cliente
                }
            ],
            "Subject": "Bienvenido a PcComponentes. confirma tu registro", // asunto del email
            "Html-part": `
            <div>
                <h1>Bienvenido a PcComponentes, ${nombre}</h1>
            </div>
            <div>
                <p>Gracias por registrarte en PcComponentes. Tu cuenta ha sido creada correctamente.</p>
                <p>Para activar tu cuenta, por favor haz clic en el siguiente enalce:</p>
                <p>Enlace: <a href="http://localhost:3000/api/Cliente/ActivarCuenta?token=${_tokenActivacion}&email=${email}&idCliente=${_resultadoInsert.insertedId.toString()}">activar cuenta</a></p>
            </div>
            `
        };

        const _peticionMailjet = await fetch('https://api.mailjet.com/v3/send',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${_codeBase64MailjetKeys}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyEmail)
            }
        );
        console.log('Resultado de la peticion a Mailjet: ', _peticionMailjet); // codigo respuesta, cabeceras respuesta, body, respuesta

        if (_peticionMailjet.status !== 201) throw new Error(`Error al enviar email de activacion de cuenta al email: ${email}`);

        //4º paso: generar respuesta al cliente con el resultado de la operacion registro para q revise su bandeja de entrada
        //        y confirme su registro con el link q le hemos enviado por email
        res.status(200).send({ codigo: 0, mensaje: 'Cliente registrado correctamente, revisa tu bandeja de entrada para confirmar tu cuenta' });
    } catch (error) {
        console.log(`Error al registrar cliente en la BD: ${error}`);
        res.status(200).send({ codigo: 1, mensaje: `Error al registrar cliente en la BD: ${error}` });
    }
})

server.get(
    '/api/Cliente/ActivarCuenta',
    async function (req, res, next) {
        try {
            //en el querystring de la solicitud por get vienen estos datos:
            // http://localhost:3000/api/Cliente/ActivarCuenta  ? token=.... & email=.... & idCliente=....
            // el middleware express.urlencoded() lo lee y lo mete en "req.query" como un objeto js: 
            // { token: '...', email: '...', idCliente: '...' }
            const { token, email, idCliente } = req.query;

            //1º paso: comprobar q el token es valido y no ha caducado, para ello usamos jsonwebtoken.verify()
            const verifyToken =  jwt.verify(token, process.env.JWT_SECRET);

            if (!verifyToken) throw new Error("El token no es valido");

            //2º paso: si el token es valido, extraer su payload y comprobar q los claims q lleva de email e idCliente
            //         coinciden con los q vienen en el querystring, si no coinciden --> error
            if (verifyToken.idCliente !== idCliente || verifyToken.email !== email) throw new Error('El token no coincide');

            //3º paso: si coinciden, conectarme a la BD y actualizar el campo "cuenta.activada" del cliente a true
            await clienteConexionMongoDB.connect();

            const clienteActualizado = await clienteConexionMongoDB.db(process.env.MONGODB_DBNAME)
                .collection('clientes')
                .updateOne(
                    { _id: new mongodb.ObjectId(idCliente) },
                    { $set: { 'cuenta.activada': true } }
                );
            
            if (clienteActualizado.modifiedCount !== 1) throw new Error('No se pudo actualizar el usuario');

            //4º paso: generar respuesta al cliente con el resultado de la operacion activacion de cuenta
            res.status(200).send({ codigo: 0, mensaje: 'Cuenta activada', datos });
        } catch (error) {
            console.log(`Error al activar cuenta de cliente: ${error}`);
            res.status(200).send({ codigo: 3, mensaje: `Error al activar cuenta de cliente: ${error}` });
        }
    }
)


server.listen(
    3000, // puerto de escucha del servidor web, en nodejs suele ser 3000
    (error) => {
        if (error) {
            console.log("Error al iniciar el servidor web: ", error);
        } else {
            console.log("---- Servidor web a la escucha en el puerto 3000 ----");
        }
    }
);

// #endreguion -----------------------------------------------