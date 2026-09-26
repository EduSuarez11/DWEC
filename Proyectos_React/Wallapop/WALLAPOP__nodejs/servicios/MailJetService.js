//modulo de codigo para enviar correos usando el servicio API-REST de MAILJET
//https://dev.mailjet.com/email/guides/
//- como mandar un email usando Mailjet v3.1: https://dev.mailjet.com/email/guides/send-api-v31/
const JWTService = require('./JWTService'); //importo el modulo JWTService para generar tokens JWT de activación de cuenta

const plantillaActivacionCuenta = (datosCliente) => {
    const tokenActivacion = JWTService.generarJWT( { email: datosCliente.email, idCliente: datosCliente.idCliente } , { expiresIn: '10min'} ); //genero un token JWT de activación de cuenta con el email del usuario como payload
    const urlActivacion=`http://localhost:3000/api/Cliente/activarCuenta?token=${tokenActivacion}`; //construyo la URL de activación de cuenta que se enviará al cliente por email, incluyendo el token JWT de activación como query param "token"
    return `        
        <h1>Hola ${datosCliente.nombre},</h1>
        <p>Gracias por registrarte en Wallapop. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
        <a href="${urlActivacion}">Activar mi cuenta</a>
        <p>Si no te has registrado en nuestro sitio web, por favor ignora este correo electrónico.</p>
        <p>Saludos,</p>
        <p>El equipo de Wallapop</p>
        <hr>
        <img src="cid:id-logowallapop" alt="Logo de Wallapop" width="200">
    `;
}

module.exports={

    mandarEmail: async function( datosCliente, subject){
        const mensajeHTMLemail = plantillaActivacionCuenta(datosCliente);
        //hago peticion a la API-REST de Mailjet para enviar el email al cliente con el mensaje HTML generado por la plantilla de activación de cuenta
        const cabeceraAuth = Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64'); //creo la cabecera de autenticación en formato Basic Auth codificada en base64 con el API key y secret key de Mailjet
        const cuerpoPeticionAPI={
                "Messages": [
                    {
                        "From": {
                            "Email": "pamaruiz69@gmail.com",
                            "Name": "Wallapop Admin"
                        },
                        "To": [
                            {
                                "Email": datosCliente.email,
                                "Name": datosCliente.nombre
                            }
                        ],
                        "Subject": subject,
                        "HTMLPart": mensajeHTMLemail,
                        "InlineAttachments": [
                            {
                                "ContentType": "image/png",
                                "Filename": "logowallapop.png",
                                "ContentID": "id-logowallapop",
                                "Base64Content": "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"
                            }
                        ]
                    }
                ]            
        };

        const respuestaPetSendEmail=await fetch('https://api.mailjet.com/v3.1/send',
                                                 {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Basic ${cabeceraAuth}` // Reemplaza con tu API key real de MailJet
                                                    },
                                                    body: JSON.stringify(cuerpoPeticionAPI)
                                                });
        const resultadoPetSendEmail = await respuestaPetSendEmail.json();
        console.log("respuesta de la API-REST de Mailjet al enviar email:", resultadoPetSendEmail);
    }
    
}