var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/nlmtst';
var fs = require('fs')
var XmlStream = require('xml-stream');

class MongoData{
    create(name, callback){
        var stream = fs.createReadStream(`./uploads/${name}.xml`);
        var xml = new XmlStream(stream);
        xml.collect('MeshHeading');
        xml.collect('Author');
        xml.collect('AbstractText');
        xml.collect('PublicationType');
        xml.collect('Chemical');
        xml.collect('PubMedPubDate');
        xml.collect('subitem');
        xml.on('endElement: PubmedArticle', function(item) {
            var json = JSON.stringify(item)
            json = json.replace(/\"\$/gi, "\"attr");  
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var myobj = JSON.parse(json)
                db.collection(name).insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    console.log("inserted successfully");
                    db.close();
                });
            });
        })
        xml.on('end', function () {
            console.log('ended')
			callback()
		});

		xml.on('error', function (err) {
            if (err) throw err;
            
		});
    }
}

module.exports = new MongoData()

