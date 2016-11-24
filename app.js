const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAACTvllG9yQBAIReHQgmIsvLtQnpes5G6MrCFwftggOSklVZCqFyJOr0NM3tWkZBdrG16tF0hqM5IkigLEuKhr6wFx1ScsSZAPIwP0w1TeuhBOwC7ZAYrmZATD5zhSLGZA1ecYU2l166X8bUWx9ZCugC70752w016h6XW1NPOwoUQZDZD';

var app = express()

app.use(bodyParser.json())

var PORT = process.env.PORT || 3000;

app.listen(PORT,function(){
	console.log('Server listen localhost:3000')
})

app.get('/',function(req, res){
	res.send('Abriendo el puerto desde mi pc Local con http://ngrok.com')
})

app.get('/webhook',function(req, res){
	if(req.query['hub.verify_token'] === 'hello_token'){
		res.send(req.query['hub.challenge'])
	}else{
		res.send('Tu no tienes que entrar aqui')
	}
})

app.post('/webhook',function(req, res){
	var data = req.body
	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
            console.log(pageEntry.messaging);
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){					
					getMessage(messagingEvent)
				}
			})
		})
	}
	res.sendStatus(200)
})

function getMessage(event){
	var senderID = event.sender.id
	var messageText = event.message.text

	evaluarMensaje(senderID, messageText)
}

function evaluarMensaje(senderID, messageText){
	var mensaje = '';
	messageText = messageText.toLowerCase();
	if(isContain(messageText,'ayuda')){
		//mensaje = 'Por el momento no te puedo ayudar :(';
		mensaje = 'Claro que puedo ayudarte, yo me encargaré de encontrar a tu mascota, pero ahora estoy aprendiendo, discúlpame :) .'
	}else if(isContain(messageText,'info')){
		mensaje = 'Hola que tal nuestro numero de telefono es: 68047892\n mi correo es: alexeis.carrillo@gmail.com'
	}else if(isContain(messageText,'perro')){
		enviarMensajeImagen(senderID)
	}else if(isContain(messageText,'perfil')){
		enviarMensajeTemplate(senderID)
	}else if(isContain(messageText,'clima') || isContain(messageText,'temperatura')){
		getClima(function(_temperatura){
			enviarMensajeTexto(senderID, getMessageCLima(_temperatura))
		})
	}else if((isContain(messageText,'quien') || isContain(messageText,'quién')) && (isContain(messageText,'alex') || isContain(messageText,'crea')) ){
		mensaje = 'Alexeis es mi creador, el es una persona que le gusta innovar.';
	}else if((isContain(messageText,'quien') || isContain(messageText,'quién')) && isContain(messageText,'ilse')){
		mensaje = 'Ilse es el amor de su vida, ella es muy especial en su vida, el me dijo que piensa en ella a cada momento.';
	}else if((isContain(messageText,'quien') || isContain(messageText,'quién')) && (isContain(messageText,'amor') || isContain(messageText,'enam'))){
		mensaje = 'Alexeis está enamorado de Ilse, ella es muy especial en su vida, el me dijo que piensa en ella a cada momento.';
	}else if((isContain(messageText,'como') || isContain(messageText,'que' )|| isContain(messageText,'cual')) && (isContain(messageText,'tu') || isContain(messageText,'quien') || isContain(messageText,'nombre'))){
		mensaje = 'Aún no tengo un nombre, puedes preguntarle a Alexeis el es mi creador.';
	}else if((isContain(messageText,'que')) && (isContain(messageText,'getpet'))){
		mensaje = 'GetPet es una aplicación movil que te permite rastrear a tu mascota mediante codigos QR.';
	}else if(isContain(messageText,'que') && isContain(messageText,'yvaganet')){
		//mensaje = 'Yvaganet es una empresa que se dedica a la innovación deberías seguirlos. Su página es la siguiente:\n https://www.yvaganet.com \nTambién los puedes seguir en facebook:\n https://www.facebook.com/yvaganetBolivia';
		enviarMensajeTemplate(senderID);
	}else if((isContain(messageText,'hola'))){
		mensaje = 'Hola necesitas consultarme algo?';
	}	
	else{
		//mensaje = 'solo se repetir las cosas T_T '+ messageText
		mensaje = 'Disculpame aún no se la respuesta de tu consulta("'+ messageText + '") T_T ';
	}

	enviarMensajeTexto(senderID, mensaje);
}

function enviarMensajeTemplate(senderID){
	var messageData = {
		recipient: {
			id : senderID
		},
		message: {
			attachment :{
				type: "template",
				payload: {
					template_type: 'generic',
					elements: [elementTemplate(),elementTemplate(),elementTemplate(),elementTemplate()]
				}
			}
		}
	}

	callSendAPI(messageData)
}

function elementTemplate(){
	return {
		title: "Yvaganet",
		subtitle: "Es una empresa de desarrollo de software, uno de sus cofundadores es Alexeis Carrillo.",
		item_url: "http://www.yvaganet.com",
		image_url: "https://lh6.googleusercontent.com/-ex4DY_l3ZZ4/AAAAAAAAAAI/AAAAAAAAAJk/MthYG1vpwjk/photo.jpg",
		buttons: [
			buttonTemplate('Yvaganet','https://www.facebook.com/yvaganetBolivia/'),
			buttonTemplate('GetPet','https://www.facebook.com/GetPetApp/')
		]
	}
}

function buttonTemplate(title,url){
	return {
		type: 'web_url',
		url: url,
		title: title
	}
}

//enviar imagen

function enviarMensajeImagen(senderID){
	var messageData = {
		recipient : {
			id: senderID
		},
		message:{
			attachment:{
				type: "image",
				payload: {
					url: 'https://s-media-cache-ak0.pinimg.com/564x/ef/e8/ee/efe8ee7e20537c7af84eaaf88ccc7302.jpg'
				}

			}
		}
	}

	callSendAPI(messageData)
}
//enviar texto plano
function enviarMensajeTexto(senderID, mensaje){
	var messageData = {
		recipient : {
			id: senderID
		},
		message: {
			text: mensaje
		}
	}

	callSendAPI(messageData)
}

//formatear el texto de regreso al cliente

function getMessageCLima(temperatura){
	if(temperatura > 30){
		return "Nos encontramos a " + temperatura +". Hay demasiado calor, comprate una gaseosa :V"
	}else{
		return "Nos encontramos a " + temperatura +" es un bonito dia para salir"
	}
}

//enviar texto en temperatura
function getClima(callback){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=-12.046374&lng=-77.042793&username=eduardo_gpg',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data)
				var temperatura = response.weatherObservation.temperature
				callback(temperatura)
			}else{
				callback(15) //temperatura por defecto
			}
		})
}

function callSendAPI(messageData){
	//api de facebook
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	},function(error, response, data){
		if(error)
			console.log('No es posible enviar el mensaje')
		else
			console.log('Mensaje enviado')
	})
}

function isContain(texto, word){
	if(typeof texto=='undefined' || texto.lenght<=0) return false
	return texto.indexOf(word) > -1
}