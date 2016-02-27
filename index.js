var express = require('express');
var app = express();

// Current providers
var providers = [{ name: 'continente', cache: [] }, { name: 'jumbo', cache: [] }]

app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));

app.get('/promotions/:provider/', function(req, res) {
	var provider = providers.filter(function(obj) {
		if ('name' in obj && typeof(obj.name) === 'string')
			return req.params.provider == obj.name
		else
			return false
	})[0]

	if (provider) {
		res.json(provider.cache)
	}
	else {
		res.json({})
	}
});

function loadCache(providerService, provider) {
	providerService['getPromotions'](function(result) {
		provider.cache = result
	})	
}

// Load first cache
for (provider of providers) {
	var providerService = require('./providers/' + provider.name + '.js')
	loadCache(providerService, provider)
}

app.listen(app.get('port'), function () {
	console.log('Running on port', app.get('port'));
});
