var osmosis = require('osmosis')
var argc = process.argv.length
var args = process.argv.slice(2)

var schema = { 'title': 'div.title',
	'brand': 'div.type',
	'info': 'div.subTitle',
	'price': 'input.item_listPrice @value',
	'hasDiscount': 'input.IsInPromotion @value',
	'discount': 'input.RetekDiscountValue @value',
	'discountProcess': 'input.RetekDiscountIcon @value', //LoyaltyStandardIcon, SuperPriceIcon
	'discountType': 'input.RetekDiscountType @value', //Percentage, Value
	'link': 'div.title @href'
}

function stringStartsWith(string, prefix) {
    return string.slice(0, prefix.length) == prefix
}

function scrapProduct(keyword, add, done) {
	osmosis
	.get('http://www.continente.pt/pt-pt/public/Pages/searchresults.aspx?k='+keyword.value+'#/?pl=80')
	.find('div.productItem')
	.set(schema)
	.data(function(data) {
		data.price = parseFloat(data.price)
		data.priceFinal = data.price
		data.discount = parseFloat(data.discount)

		if (data.discountProcess.toLowerCase().lastIndexOf('loyalty', 0) === 0) {
			data.discountProcess = 'storecard'
		}
		else if (data.discountProcess.toLowerCase().lastIndexOf('superprice', 0) === 0) {
			data.discountProcess = 'superprice'
		}

		if (data.discountType.toLowerCase() == 'percentage') {
			data.priceFinal = data.price - data.price * (data.discount/100)
		}
		else if (data.discountType.toLowerCase() == 'value') {
			data.priceFinal = data.price - data.discount
		}

		if (data.hasDiscount !== 'true') {
			return
		}

		// e.g.: Kg, Pack
		if (keyword.info && data.info && data.info.toLowerCase().indexOf(keyword.info) < 0) {
			return
		}

		// cost 3,45€ > limit 2,19€
		if (keyword.limit && data.priceFinal > keyword.limit) {
			return
		}

		add(data)
	})
	.done(function() {
		done()
	})
}

function scrapProducts(keywords, add, done) {
	for (keyword of keywords) {
		scrapProduct(keyword, add, done)
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

exports.getProductsByKeywords = function(keywords, completion) {
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

exports.getProductsByLinks = function(links, completion) {
	completion({ title: 'Continente - artigos em conta', products: [] })
}

exports.getPromotions = scrapPromotions
