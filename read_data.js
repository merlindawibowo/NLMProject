var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/nlmtst';

'use strict'
const fs 	=  require('fs')
const natural = require('natural')
var stem = require('stem-porter')
const stemmer = natural.PorterStemmer
const conjuction_list = fs.readFileSync('conjuction.txt', 'utf8').split("\n")
const regex_rm_punctuaction = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g
const regex_rm_conjuction = new RegExp("(\\s+)("+conjuction_list.join("|")+")(\\s+)", "gi")

var all_string = []

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection("medline").find({"MedlineCitation.Article.Abstract" : {$exists: true}}).forEach(function(result) {
    var abstrak = result.MedlineCitation.Article.Abstract;
    var abstrak_fix = abstrak.AbstractText.map((data) => {
      return (typeof(data) == 'string') ? data : data.attrtext
    }).join("\n")
    
    // stopwords, stemming and puctuation
    var removed_conjuction = abstrak_fix.replace(regex_rm_conjuction," ")
	var text_array  = removed_conjuction.replace(/(\s)?\d\s+/g, ' ').replace(/\n+/g,' ').split(" ").filter((d) => {
		return d != '' && conjuction_list.indexOf(d.toLowerCase()) < 1
	}).map((d) => {
		var reg = new RegExp(/\d/,'gi')
		var rm_punctuaction = d.replace(regex_rm_punctuaction,'')
		return reg.test(d) ?  d : stemmer.stem(rm_punctuaction)
	})

	// term frequency
	for (var i=0; i<text_array.length; i++) {
		all_string.push(text_array[i])
	}

  })

})

console.log(all_string)



	
