var Promise = require("bluebird")
var xray = require('x-ray')()
var argc = process.argv.length
var args = process.argv.slice(2)

var schemaArticle = {
	title: '.titProd',
    brand: '.titMarca',
	info: '.gr',
    price: '.preco',
    link: '.titProd@href'
}

function schemaList(classname) {
	return { 
		items: xray(classname, [schemaArticle]) 
	}
}

function scrapProducts(keywords, add, done) {
	for (keyword of keywords) {
		scrapProductsWithLink('.infoProduto', 'http://www.jumbo.pt/Frontoffice/ContentPages/CatalogSearch.aspx?Q='+keyword, add, done)
	}
}

function scrapProductsWithLink(classname, link, add) {

	return new Promise(function(resolve, reject) {
		xray(link, schemaList(classname))(function(err, obj) {
			for (item of obj.items) {
				item.title = item.title.replace(/\n/g, "").trim()
				item.brand = item.brand.replace(/\n/g, "").trim()
				item.info = item.info.replace(/\n/g, "").trim()
				item.price = item.price.replace(/€/g, "").trim()
				item.price = item.price.replace(/,/g, ".").trim()
				add(item)
			}
			if (err) {
				reject(err);
			} else {
				resolve()
			}
		})
	});
}

function scrapProductWithLink(link, limit, add, done) {
	xray(link, schemaArticle)(function(err, item) {
		item.title = item.title.replace(/\n/g, "").trim()
		item.brand = item.brand.replace(/\n/g, "").trim()
		item.info = item.info.replace(/\n/g, "").trim()
		item.price = item.price.replace(/€/g, "").trim()
		item.price = item.price.replace(/,/g, ".").trim()
		item.link = link

		if (parseFloat(item.price) < limit) {
			add(item)
		}
		done()
	})
}

function scrapProductsFromLinks(links, add, done) {
	for (item of links) {
		scrapProductWithLink(item.link, item.limit, add, done)
	}
}

// Command line test: node providers/jumbo.js esteril
var items = []
if (argc >= 3) {
	console.log('----- JUMBO: searching for '+args)
	scrapProducts(args, function(item) {
		items.push(item)
	}, function() {
		console.log(items)
	})
}

exports.getProductsByKeywords = function(keywords, completion) {
	var items = []
	completion({ title: 'Jumbo - preços baixos', products: items })
}

exports.getProductsByLinks = function(links, completion) {
	var items = []
	var count = links.length
	scrapProductsFromLinks(links, function(item) {
		items.push(item)
	}, function() {
		count--
		if (count == 0) {
			completion({ title: 'Jumbo - artigos em conta', products: items })
		}
	})
}

exports.getPromotions = function(completion) {
	var items = []
	scrapProductsWithLink('.prodHp', 'http://www.jumbo.pt/Frontoffice/ContentPages/JumboNetWelcome.aspx', function(item) { items.push(item) })
		.then(function() {
			return scrapProductsWithLink('.prodTema', 'http://www.jumbo.pt/Frontoffice/ContentPages/JumboNetWelcome.aspx', function(item) { items.push(item) })
		})
		.then(function(){
			completion(items)
		})
}
