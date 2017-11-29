
'use strict'
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var async = require('async')
var url = 'mongodb://localhost:27017/nlmtst';
const fs 	=  require('fs')
const natural = require('natural')
var stem = require('stem-porter')
const stemmer = natural.PorterStemmer
const conjuction_list = fs.readFileSync('conjuction.txt', 'utf8').split("\n")
const regex_rm_punctuaction = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g
const regex_rm_conjuction = new RegExp("(\\s+)("+conjuction_list.join("|")+")(\\s+)", "gi")

const express = require('express')
const app = express()

MongoClient.connect(url, function(err, db) {
   async.series([
    function(call) { 
    	var collection = db.collection('medline');
    	console.log('...loading...')
    	collection.find({"MedlineCitation.Article.Abstract" : {$exists: true}}).toArray(function(err, docs) {
		    if (err) throw err
		    //console.log(docs)
		    call(docs);
		 });
     },
  ], function(results){
  		db.close();
  		var all_string = []
  		var abs_all = []
  		results.forEach(function(result) {
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
			all_string.push(...text_array)
			abs_all.push(abstrak_fix)
		})

	  	// Term Frequency
		var TfIdf = natural.TfIdf;
		var tfidf = new TfIdf();

		abs_all.forEach((dataa) => {
			tfidf.addDocument(dataa)
		})

		all_string.forEach((as) => {	
			tfidf.tfidfs(as, function(i, measure) {
			})
		})

		var tf 	= new Array()
		abs_all.forEach((data, index) => {
			var array = []
			tfidf.listTerms(index).forEach(function(item) {
		    	array.push(Math.round(item.tfidf))
			})
			tf.push(array)
		})
		//console.log(tf)
		var tfprob = []
		tf.forEach((tfitem1, index1) => {
			tf.forEach((tfitem2, index2) => {
				if (index1 != index2) {
					tfprob.push({ first : index1 , second : index2})
				}
			})
		})

		tfprob.forEach((item) => {
			console.log('Cosine similarity TF'+(item.first+1)+' and TF'+(item.second+1))
			var l1 = tf[item.first].length
			var l2 = tf[item.second].length
			var tf1 = tf[item.first]
			var tf2 = tf[item.second]
			if ( l1 > l2 ) {
				var len_avg = l1-l2
				for (var j=0; j<len_avg; j++) { tf2.push(0) }
			}
			else{
				var len_avg2 = l2-l1
				for (var k=0; k<len_avg2; k++) { tf1.push(0) }
			}
			var sum = tf1.map((data,index) => {
				return data * tf2[index]
			}).reduce((accumulator, currentValue) => accumulator + currentValue)
			var A = tf1.map((data, index) => {
				return Math.pow(data, 2)
			}).reduce((accumulator, currentValue) => accumulator + currentValue)
			var B = tf2.map((data, index) => {
				return Math.pow(data, 2)
			}).reduce((accumulator, currentValue) => accumulator + currentValue)

			var cos_sim = sum / (Math.sqrt(A)*Math.sqrt(B))
			console.log(cos_sim)
		})
		
	})
});



	
