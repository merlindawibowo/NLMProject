'use strict'

const express = require('express')
const app = express()

var path = require('path')
var multer = require('multer')
var mongo_data = require('./libs/mongo_data')
var read_mh = require('./libs/read_mh')
var read_abs = require('./libs/read_abs')
var calculate = require('./libs/calculate')

var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

//variable for chart
var sims_abs = []
var col_length_abs = []
var sims_mh = []
var col_length_mh = []

// set the view engine to ejs
app.set('view engine', 'ejs');

const fs = require('fs');
var xmlDir = './uploads/';
var xmlLists = [];
var list_files = []



// home page
app.get('/', function (req, res) {
	//call function get list file
     fs.readdir(xmlDir, function(err, items) {
        var lists = items.filter((data) => {return data.includes('.xml')})
        res.render('pages/upload_doc', {
            xmlLists: lists  
        });
    });
})

//get the list of files
function getFile(xmlDir, callback) {
    var fileType = '.xml',
        files = [], i;
    fs.readdir(xmlDir, function (err, list) {
        for(i=0; i<list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]); 
            }
        }
        callback(err, files);
    });
}

// upload file
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
        //console.log(file)
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
        //mongo_data.create()
        var f = file.fieldname+'-'+Date.now()
        callback(null, f + path.extname(file.originalname))
        setTimeout(()=> {
        	mongo_data.create(f, ()=> {
            console.log(f)
            read_mh.get(f)
            read_abs.get(f)
        	})
        }, 10000)
              
	}
})

app.post('/', function(req, res) {
	var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.xml' ) {
				return callback(res.end('Only xml are allowed'), null)
			}
			callback(null, true)
            fs.readdir(xmlDir, function(err, items) {
                var lists = items.filter((data) => {return data.includes('.xml')})
                res.render('pages/upload_doc', {
                    xmlLists: lists  
                });
            });
		}
	}).single('userFile');
	upload(req, res, function(err) {
		if (err) throw err;
        fs.readdir(xmlDir, function(err, items) {
            var lists = items.filter((data) => {return data.includes('.xml')})
            res.render('pages/upload_doc', {
                xmlLists: lists  
            });
        });
		/*res.render('pages/upload_doc', {
			xmlLists: xmlLists
		})*/

	})
})

//abstract page
app.get('/abs', function (req, res) {
	 calculate.exec('abs', 'userFile-1515743945777' , 2 , (data) => {
	 	sims_abs.push(data.sims)
	 	col_length_abs.push(data.col_length)
        res.render('pages/read_abs', data);
    })
})

//abstract page
app.get('/abs2', function (req, res) {
	 calculate.exec('abs', 'userFile-1515743945777' , 2 , (data) => {
        res.render('pages/read_abs2', data);
    })
})

//abstract page
app.get('/abs3', function (req, res) {
	 calculate.exec('abs', 'userFile-1515743945777' , 2 , (data) => {
        res.render('pages/read_abs3', data);
    })
})

//mesh heading page
app.get('/mh', function (req, res) {
    calculate.exec('mh', 'userFile-1515743945777' , 2 , (data) => {
	 	sims_mh.push(data.sims)
	 	col_length_mh.push(data.col_length)
        res.render('pages/read_mh', data);
    })
    
})
//mesh heading page
app.get('/mh2', function (req, res) {
    calculate.exec('mh', 'userFile-1515743945777' , 2 , (data) => {
        res.render('pages/read_mh', data);
    })
    
})
//mesh heading page
app.get('/mh3', function (req, res) {
    calculate.exec('mh', 'userFile-1515743945777' , 2 , (data) => {
        res.render('pages/read_mh', data);
    })
    
})

//chart page
app.get('/chart', function (req, res) {
    calculate.exec('abs', 'userFile-1515743945777' , 2 , (data) => {
         calculate.exec('mh', 'userFile-1515743945777' , 2 , (data2) => {
            res.render('pages/chart', { 
                sims_abs : data.sims,
                col_length_abs : data.col_length,
                sims_mh : data2.sims,
                col_length_mh : data2.col_length
            });
        })
    })
	
})

app.listen(8000, function () {
	console.log('app listening on port 8000!')
})