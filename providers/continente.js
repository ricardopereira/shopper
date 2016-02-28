var osmosis = require('osmosis')
var argc = process.argv.length
var args = process.argv.slice(2)

var schema = { 'title': 'div.title',
	'brand': 'div.type',
	'info': 'div.subTitle',
	'originalPrice': 'input.item_listPrice @value',
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
	scrapProductWithLink('http://www.continente.pt/pt-pt/public/Pages/searchresults.aspx?k='+keyword.value+'#/?pl=80'
		, function(item) {
			// e.g.: Kg, Pack
			if (keyword.info && data.info && data.info.toLowerCase().indexOf(keyword.info) < 0) {
				return
			}

			// cost 3,45€ > limit 2,19€
			if (keyword.limit && data.price > keyword.limit) {
				return
			}

			data(item)
		}, done)
}

function scrapProductWithLink(link, add, done) {
	osmosis
	.get(link)
	.find('div.productItem')
	.set(schema)
	.data(function(data) {
		data.originalPrice = parseFloat(data.originalPrice)
		data.price = data.originalPrice
		data.discount = parseFloat(data.discount)

		if (data.discountProcess.toLowerCase().lastIndexOf('loyalty', 0) === 0) {
			data.discountProcess = 'storecard'
		}
		else if (data.discountProcess.toLowerCase().lastIndexOf('superprice', 0) === 0) {
			data.discountProcess = 'superprice'
		}

		if (data.discountType.toLowerCase() == 'percentage') {
			data.price = data.originalPrice - data.originalPrice * (data.discount/100)
		}
		else if (data.discountType.toLowerCase() == 'value') {
			data.price = data.originalPrice - data.discount
		}

		data.price = data.price.toFixed(2)

		if (data.hasDiscount !== 'true') {
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

exports.getPromotions = function(completion) {
	var items = []
	scrapProductWithLink('http://www.continente.pt/stores/continente/pt-pt/public/Pages/homepage.aspx'
		, function(item) { 
			items.push(item) 
		}, function() { 
			completion(items)
		})
}
