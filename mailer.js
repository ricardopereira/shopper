var manager = require('./manager.js')

module.exports = function(secrets) {
    var module = {}

    var mailgun = require('mailgun-js')({apiKey: secrets['mailgun_api_key'], domain: secrets['mailgun_domain']})

    function sendProducts(config, input) {
		var message = 'Promoções\n\n'
		for (item of input.products) {
			message += item.title+'\n'+
			  item.brand+'\n'+
			  item.info+'\n'+
			  item.price+'€\n'+
			  item.link+'\n'
			  if (item.discount) {
				  message += item.discount+' - '+item.discountType+' -> '+item.discountProcess.toUpperCase()+'\n'+
				  	'Final price: '+item.priceFinal+'\n'
			  }
			  message += '\n'
		}
		message += '\nImplemented by Ricardo Pereira'

		var data = {
		  from: 'Do not reply <postmaster@'+secrets["mailgun_domain"]+'>',
		  to: config['mail_recipients'],
		  subject: 'Shopper: '+input.title,
		  text: message
		};

		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	}

    module.emailProducts = function(input) {
		manager.getRemoteFile(secrets['config_url'], function(json) {
			var config = json
			sendProducts(config, input)
		})
	}

    return module
}
