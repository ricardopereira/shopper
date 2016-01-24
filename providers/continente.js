var osmosis = require('osmosis')
var argc = process.argv.length
var args = process.argv.slice(2)

var schema = { 'title': 'div.title',
	'brand': 'div.type',
	'info': 'div.subTitle',
	'price': 'input.item_listPrice @value',
	'hasDiscount': 'input.IsInPromotion @value',
	'discount': 'input.WebDiscountValue @value',
	'link': 'div.title @href'
}

function scrapProducts(keywords, add, done) {
	for (keyword of keywords) {
		osmosis
		.get('http://www.continente.pt/pt-pt/public/Pages/searchresults.aspx?k='+keyword.value+'#/?pl=80')
		.find('div.productItem')
		.set(schema)
		.data(function(data) {
			if (data.hasDiscount === 'true') {
				add(data)
			}
		})
		.done(function() {
			done()
		})
	}
}

function scrapPromotions(keywords, add, done) {
	done()
}

// Command line test: node providers/continente.js gato+esteril
var items = []
if (argc >= 3) {
	console.log('----- CONTINENTE: searching for '+args)
	scrapProducts(args, function(item) {
		items.push(item)
	}, function() {
		console.log(items)
	})
}

exports.getProducts = function(keywords, completion) {
	var items = []
	var count = keywords.length
	scrapProducts(keywords, function(item) {
		items.push(item)
	}, function() {
		count--
		if (count == 0) {
			completion({ title: 'Continente - preços baixos', products: items })			
		}
	})	
}

exports.getPromotions = scrapPromotions