var manager = require('./manager.js')

var secrets = manager.getSecrets()
var mailer = require('./mailer.js')(secrets)

// Current providers
var providers = ['continente', 'jumbo']

// Keywords
manager.getRemoteFile(secrets['keywords_url'], function(json) {
	var keywords = json
	start(keywords, providers)
})

function start(keywords, providers) {
	for (file of providers) {
		// Dynamic provider
		var provider = require('./providers/'+file+'.js')

		provider['getProducts'](keywords, function(result) {
			console.log(result.title)
			console.log(result.products)

			if (result.products.length > 0) {
				mailer.emailProducts(result)
			}
		})
	}
}
