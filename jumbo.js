var Xray = require('x-ray');
var x = Xray();
var args = process.argv.slice(1);

console.log('----- JUMBO: searching for '+args[1])
x('http://www.jumbo.pt/Frontoffice/ContentPages/BrochureDetail.aspx?C=FL_8252000&loop=1', {
  title: 'title',
  items: x('.infoProduto', [{
    title: '.titProd',
    price: '.preco'
  }])
})(function(err, obj) {
	console.log(err)
	console.log(obj)
})
