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