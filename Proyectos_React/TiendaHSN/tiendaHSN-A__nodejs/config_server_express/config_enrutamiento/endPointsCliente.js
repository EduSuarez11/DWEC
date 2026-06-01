//modulo de codigo q exporta un objeto de enrutamiento Router de express para gestionar
//las peticiones http que llegan a las rutas que empiezan por /api/Cliente/....
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const objetoRoutingCliente = express.Router(); //objeto de enrutamiento Router de express

objetoRoutingCliente.post('/Registro', async (req, res, next) => {
  try {
    console.log(`peticion HTTP POST recibida desde cliente REACT, con datos en el cuerpo: ${JSON.stringify(req.body)}`);
    //operaciones a realizar:
    //----- 1º insertar datos previa validacion de los mismos (usando mongoose <--- si no lo usas, y usas el driver nativo de mongoDB
    // tienes que hacer las validaciones a mano)
    console.log(`abriendo conexion con servidor MONGODB: ${process.env.URL_MONGODB}`);

    await mongoose.connect(process.env.URL_MONGODB); // Conexión con la bbdd de MongoDB

    // comprobar si ya existe un cliente con el email recibido en la bd...
    let clienteEncontrado = await mongoose.connection.collection('clientes').findOne({ 'cuenta.email': req.body.email });
    if (clienteEncontrado) throw new Error('ya existe un cliente registrado con el email indicado');

    //insert con query mongodb pura, sin esquema-modelo intermediario (porque controlo sintaxis querys mongo)
    switch (req.body.tipoRegistro) {

      case 'cliente':
        let resInsert = await mongoose.connection.collection('clientes').insertOne(
          {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            genero: req.body.genero,
            cuenta: {
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, 10), //<--- Hay q hashear la password!!!! nunca en texto plano!!!!
              cuantaActivada: false,
              imagenAvatar: '',
              fechaCreacionCuenta: Date.now() //<---- numero de ms, siempre NUMERICO!!!
            },
            pedidos: [],
            listaDeseados: [],
            direcciones: [],
            metodosPago: []
          }
        );
        console.log(`el resultado de la insercion de los datos del cliente es: ${JSON.stringify(resInsert)}`);
        if (!resInsert.insertedId) throw new Error('operacion de registro de datos del cliente incorrecta, puede haber error en formato...');
        break;

      case 'empresa':
        //meter datos en coleccion "empresas"

        break;
      default:
        throw new Error('tipo de registro no contemplado en el servidor');

    }


    //----- 2º enviar email al cliente para que active la cuenta (usando mailjet)
    // cliente REACT -------> DATOS SERVICIO NODEJS -----------> SERVICIO MAILJET APIREST
    // (peticion http POST con fetch, tambien se pueden usar otras librerias como axios, superagent, etc)
    // el endpoint de mailjet para el envio de email es: https://api.mailjet.com/v3.1/send
    // por POST
    // mandar cabeceras: Authorization: Basic + base64( public_key:secret_key )
    //                   Content-Type: application/json
    // en el body de la peticion POST, van los datos del email a enviar en formato JSON(from, to, subject, html o text)
    /*
        {
              "Messages":[
                {
                  "From":[
                    {
                      "Email":"pilot@mailjet.com",
                      "Name":"Your Mailjet Pilot"
                    }
                  ],
                  "HTMLPart":"<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!",
                  "Subject":"Your email flight plan!",
                  "TextPart":"Dear passenger, welcome to Mailjet! May the delivery force be with you!",
                  "To":[
                    {
                      "Email":"passenger@mailjet.com",
                      "Name":"Passenger 1"
                    }
                  ]
                }
              ]
          }
    */

    //generamos JWT de duracion brebe para incluirlo en el enlace de activacion de cuenta del email...como medida de seguridad para activar cuenta
    const tokenAccesoActivacion = jwt.sign({ email: req.body.email, idCliente: resInsert._id.toString() }, process.env.FIRMA_JWT_SERVER, { expiresIn: '10min' });

    const enlace_activacion_cuenta = `http://localhost:3000/api/Cliente/ActivarCuenta?email=${req.body.email}&idCliente=${resInsert._id.toString()}&token=${tokenAccesoActivacion}`; //enlace de activacion de cuenta, con el id del cliente recien creado en la bd
    const codBASE64_APIKEYS = Buffer.from(`${process.env.MAILJET_PUBLIC_APIKEY}:${process.env.MAILJET_SECRET_APIKEY}`).toString('base64');
    const bodyEnvioMAILJET = JSON.stringify(
      {
        "Messages": [
          {
            "From": [
              {
                "Email": "pamaruiz69@gmail.com",
                "Name": "Admin de tienda HSN"
              }
            ],
            "HTMLPart": `
                            <div style="text-align:center;">
                              <img src="https://www.hsnstore.com/skin/frontend/default/hsnreborn/images/logoHSNReduced.svg" alt="logo tienda HSN"/>
                            </div>
                            <div>                              
                              <h3>Bienvenido a la tienda HSN</h3>
                              <p>Gracias por registrarte en nuestra tienda de productos alimenticios para deportistas. Aun te queda un último paso para acabar.</p>
                              <p>Por favor, confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:
                                <a href=${enlace_activacion_cuenta}>Activar cuenta</a>
                              </p>

                            </div>
                          `,
            "Subject": "Your email flight plan!",
            "TextPart": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
            "To": [
              {
                "Email": "passenger@mailjet.com",
                "Name": "Passenger 1"
              }
            ]
          }
        ]
      }
    );

    const petEnviMAILJET = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${codBASE64_APIKEYS}`,
        'Content-Type': 'application/json'
      },
      body: bodyEnvioMAILJET

    });
    const bodyRespuetaMAILJET = await petEnviMAILJET.json();
    if (bodyRespuetaMAILJET.Messages[0].Status !== 'success') throw new Error('error en el envio del email de activacion de cuenta del cliente, intantar de nuevo...')

    //----- 3º enviar la respueta al cliente de REACT si todo ok...o si hay algun error, se le informa de ello
    res.status(200).send({ codigo: 0, mensaje: 'datos recibidos correctamente en el servidor' });

  } catch (error) {
    console.log(`error en registro de datos del cliente....: ${error}`);
    res.status(200).send({ codigo: 1, mensaje: `error en registro de datos del cliente....: ${error}` });
  }
})

objetoRoutingCliente.get('/ActivarCuenta', async (req, res, next) => {
  try {
    //en la url de activacion de la cuenta de los clientes se pasan los parametros:  email, idCliente, token
    //para acceder a ellos se usa req.query.nombre_parametro
    console.log(`parametros pasados en la url de activacion de cuenta: ${JSON.stringify(req.query)}`);

    const { email, idCliente, token } = req.query;

    //comprobamos si existen las 3 variables
    if (!email || !idCliente || !token) throw new Error('faltan parametros en la url de activacion de cuenta del cliente');

    //comprobamos validez del token JWT,si ha sido firmado por el servidor y no ha expirado...
    const payload_token = jwt.verify(token, process.env.FIRMA_JWT_SERVER);
    console.log(`payload del token JWT recibido en la peticion de activacion de cuenta: ${JSON.stringify(payload_token)}`);

    //si todo ok, comprobamos que el email del parametro coincide con el email del token, 
    //y el idCliente del parametro coincide con el idCliente del token y si coinciden modificamos el campo cuenta.cuentaActivada a true
    //en la bd de mongodb:
    if (email !== payload_token.email || idCliente !== payload_token.idCliente) throw new Error('los datos del token JWT no coinciden con los parametros de la url de activacion de cuenta del cliente');

    let resUpdate = await mongoose.connection.collection('clientes').updateOne(
      { 'cuenta.email': email, _id: mongoose.Types.ObjectId(idCliente) },
      { $set: { 'cuenta.cuentaActivada': true } }
    );
    //redirigimos al cliente a un componente de REACT que le informe que su cuenta esta activada ok...
    //si no hacemos se le quedara colgado el navegador con una vista en blanco (se quita la vista de su email, 
    // y se queda en blanco esperando respuesta)
    res.status(200).redirect('http://localhost:5173/Cliente/ActivacionCuenta?operacion=success'); //componente REACT que informa que la cuenta se ha activado ok

  } catch (error) {
    console.log(`error en activacion de cuenta del cliente....: ${error}`);
    res.status(200).redirect('http://localhost:5173/Cliente/ActivacionCuenta?operacion=failed'); //componente REACT que informa que la cuenta se ha activado ok

  }
})

objetoRoutingCliente.post('/Login', async (req, res, next) => {
  try {
    //datos recibidos del formulario del componente REACT Login.jsx: email,password <--- req.body
    console.log(`peticion HTTP POST recibida desde cliente REACT, con datos en el cuerpo: ${JSON.stringify(req.body)}`);
    const { email, password } = req.body;

    if (!email || !password) throw new Error('falta email o password en la peticion de login del cliente');
    //validar tambien el formato del email y la password recibidas...usando patrones o expresiones regulares

    // const regexEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
    // const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!regexEmail.test(email)) throw new Error('formato de email incorrecto');
    // if (!regexPassword.test(password)) throw new Error('formato de password incorrecta, al menos 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial');

    //lanzamos query mongodb a coleccion clientes para buscar 1º si existe el email,
    await mongoose.connect(process.env.URL_MONGODB);
    let clienteEncontrado = await mongoose.connection
      .collection('clientes')
      .findOne({ 'cuenta.email': email });
    if (!clienteEncontrado) throw new Error('no existe ningun cliente registrado con el email indicado');

    //si existe, 2º comprobar la password con el hash almacenado en la bd
    if (!bcrypt.compareSync(password, clienteEncontrado.cuenta.password)) throw new Error('password incorrecta');

    //si todo ok, 3º comprobar si la cuenta esta activada
    if (!clienteEncontrado.cuenta.cuentaActivada) {
      //lo suyo seria volver a mandar un email al cliente para que active la cuenta...
      //generamos error y respuesta al cliente REACT
      throw new Error('la cuenta del cliente no esta activada, por favor activela desde el email que le acabamos de enviar');
    }

    //si todo ok, 4º generar un token JWT de sesion de acceso para el cliente y enviarselo en la respuesta
    const tokenSesionUsuario = jwt.sign(
      {
        email: req.body.email,
        idCliente: clienteEncontrado._id
      },
      process.env.FIRMA_JWT_SERVER,
      { expiresIn: '1h' }
    );

    res.status(200).send(
      {
        codigo: 0,
        mensaje: 'login ok',
        token: tokenSesionUsuario,
        datosCliente: clienteEncontrado
      }
    );


  } catch (error) {
    console.log(`error en login de cliente....: ${error}`);
    res.status(200).send({ codigo: 3, mensaje: `email o password incorrectos` });
  }
});



module.exports = objetoRoutingCliente;