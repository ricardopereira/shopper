var fmanager = require('./filemanager.js')

var secrets = manager.getSecrets()
var mailer = require('./mailer.js')(secrets)

// Current providers
var providers = ['continente', 'jumbo']

// Keywords
fmanager.getRemoteFile(secrets['keywords_url'], function(json) {
	var keywords = json
	checkProductsByKeywords(keywords, providers)
})

// Links
fmanager.getRemoteFile(secrets['links_url'], function(json) {
	var links = json
	checkProductsByLinks(links, providers)
})

function checkProductsByKeywords(keywords, providers) {
	for (file of providers) {
		// Dynamic provider
		var provider = require('./providers/'+file+'.js')

		provider['getProductsByKeywords'](keywords, function(result) {
			console.log(result.title)
			console.log(result.products)

			if (result.products.length > 0) {
				mailer.emailProducts(result)
			}
		})
	}
}

function checkProductsByLinks(links, providers) {
	var provider = require('./providers/'+'jumbo'+'.js')
	var links = links['jumbo']

	provider['getProductsByLinks'](links, function(result) {
		console.log(result.title)
		console.log(result.products)

		if (result.products.length > 0) {
			mailer.emailProducts(result)
		}
	})
}
