'use strict'
var config = require('./config.json')
var mysql = require('mysql');
 
var connection = mysql.createConnection({
    host: config.db.mysql.host,
    user: config.db.mysql.user,
    password: config.db.mysql.password,
    database: config.db.mysql.db,
    debug: false,
});
 
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var async = require('async')
var url = 'mongodb://localhost:27017/nlmtst';
var url_result = 'mongodb://localhost:27017/nlmtst_mh_result';
const fs  =  require('fs')
const natural = require('natural')
var stem = require('stem-porter')
const stemmer = natural.PorterStemmer
const conjuction_list = fs.readFileSync('conjuction.txt', 'utf8').split("\n")
const regex_rm_punctuaction = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g
const regex_rm_conjuction = new RegExp("(\\s+)("+conjuction_list.join("|")+")(\\s+)", "gi")


var start = new Date();
var hrstart = process.hrtime();
class ReadMH {
    get(coll){
        MongoClient.connect(url, function(err, db) {
            async.series([
             function(call) { 
               var collection = db.collection(coll);
               console.log('...loading mesh heading...')
               collection.find({"MedlineCitation.MeshHeadingList" : {$exists: true}}).toArray(function(err, docs) {
                 if (err) throw err
                 call(docs);
              });
              },
           ], function(results){
               db.close();
               var all_string = []
               var mh_all = []
               results.forEach(function(result) {
                 var mh = result.MedlineCitation.MeshHeadingList;
                 var mh_fix = mh.MeshHeading.map((data) => {
                   return (typeof(data) == 'string') ? data : data.DescriptorName.attrtext
                 }).join("\n")
                 // stopwords, stemming and puctuation
                 var removed_conjuction = mh_fix.replace(regex_rm_conjuction," ")
               var text_array  = removed_conjuction.replace(/(\s)?\d\s+/g, ' ').replace(/\n+/g,' ').split(" ").filter((d) => {
                 return d != '' && conjuction_list.indexOf(d.toLowerCase()) < 1
               }).map((d) => {
                 var reg = new RegExp(/\d/,'gi')
                 var rm_punctuaction = d.replace(regex_rm_punctuaction,'')
                 return reg.test(d) ?  d : stemmer.stem(rm_punctuaction)
               })
               all_string.push(...text_array)
               mh_all.push(mh_fix)
             })
         
               // Term Frequency
             var TfIdf = natural.TfIdf;
             var tfidf = new TfIdf();
         
             mh_all.forEach((dataa) => {
               tfidf.addDocument(dataa)
             })
         
             all_string.forEach((as) => {  
               tfidf.tfidfs(as, function(i, measure) {
               })
             })
         
             var tf  = new Array()
             mh_all.forEach((data, index) => {
               var array = []
               tfidf.listTerms(index).forEach(function(item) {
                    array.push({ name : coll, term : item.term , tfdif : Math.round(item.tfidf) })
               })
               //tf.push(array)
               MongoClient.connect(url_result, function(err, db) {
                if (err) throw err;
                
                db.collection(coll).insertOne({mh_index : index , data : array }, function(err, res) {
                  if (err) throw err;
                  console.log("inserted successfully mh");
                  db.close();
                });	
              });
            })

            var end = new Date() - start,
            hrend = process.hrtime(hrstart);
            
            console.info("Execution time Mesh Heading: %dms", end);
            console.info("Execution time Mesh Heading(hr): %ds %dms", hrend[0], hrend[1]/1000000);
             
           })
         });
         
    }
}

module.exports = new ReadMH()
