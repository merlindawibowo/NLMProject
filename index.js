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
		sims_abs : abstrak.sim_cos(),
		col_length_abs : abstrak.col_length(),
		sims_mh : mh.sim_cos(),
	    col_length_mh : mh.col_length()
	});
})

app.listen(8080, function () {
	console.log('Example app listening on port 8080!')
})