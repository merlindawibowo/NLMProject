const express = require('express')
const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.bodyParser({uploadDir:'./uploads'}));

//upload page
app.get('/', function (req, res) {
	res.render('pages/upload_doc', {	
	});
})

app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
})