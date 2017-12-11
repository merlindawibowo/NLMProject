const express = require('express')
const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs');

var abstrak = require('./read_data.js')
var mh = require('./read_mh.js')

// home page
app.get('/', function (req, res) {
	res.render('pages/index', {	
	});
})

//abstract page
app.get('/abs', function (req, res) {
	res.render('pages/read_data', {	
		  	sims : abstrak.sim_cos(),
		    col_length : abstrak.col_length()
	});
})

//mesh heading page
app.get('/mh', function (req, res) {
	res.render('pages/read_mh', { 
	    sims : mh.sim_cos(),
	    col_length : mh.col_length()
	});
})

//chart page
app.get('/chart', function (req, res) {
	res.render('pages/chart', { 
	});
})

app.listen(8080, function () {
	console.log('Example app listening on port 8080!')
})