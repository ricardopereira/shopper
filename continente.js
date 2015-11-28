var osmosis = require('osmosis');
var args = process.argv.slice(1);

console.log('----- CONTINENTE: searching for '+args[1])
osmosis
.get('http://www.continente.pt/pt-pt/public/Pages/searchresults.aspx?k='+args[1])
.find('div.productItem')
.set({
	'title': 'div.title',
	'price': 'input.item_listPrice @value',
	'link': 'div.title @href'
})
.data(function(listing) {
    // do something with listing data
	console.log(listing)
})
.error(console.log)
