var x = require('x-ray')()
var argc = process.argv.length
var args = process.argv.slice(2)

var schema = { title: 'title',
  items: x('.infoProduto', [{
    title: '.titProd',
    brand: '.titMarca',
	info: '.gr',
    price: '.preco',
    link: '.titProd@href'
  }])
}

function scrapProducts(keywords, add, done) {
	for (keyword of keywords) {
		x('http://www.jumbo.pt/Frontoffice/ContentPages/CatalogSearch.aspx?Q='+keyword.value+'&loop=1', schema)(function(err, obj) {
			for (item of obj.items) {
				item.title = item.title.replace(/\n/g, "").trim()
				item.brand = item.brand.replace(/\n/g, "").trim()
				item.info = item.info.replace(/\n/g, "").trim()
				item.price = item.price.replace(/€/g, "").trim()
				item.price = item.price.replace(/,/g, ".").trim()
				add(item)
			}
			done()
		})		
	}
}

function scrapPromotions(keywords, add, done) {
	done()
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

exports.getProducts = function(keywords, completion) {
	var items = []
	completion({ title: 'Jumbo - preços baixos', products: items })
}

exports.getPromotions = scrapPromotions
