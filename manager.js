var https = require('https')
var fs = require('fs')
const StringDecoder = require('string_decoder').StringDecoder

exports.getRemoteFile = function(url, completion) {
	https.get(url, function(res) {
		var decoder = new StringDecoder('utf8')
		var dataUtf8 = ''
		res.on('data', function(chunk) {
	    	dataUtf8 += decoder.write(chunk)
		}).on('end', function() {
			completion(JSON.parse(dataUtf8))
		})
	})
}

exports.getSecrets = function() {
	return JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
}
