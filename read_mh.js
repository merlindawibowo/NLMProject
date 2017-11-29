var Server = require("mongo-sync").Server;
var server = new Server('127.0.0.1');
var Fiber = require('fibers')

'use strict'
const fs 	=  require('fs')
const natural = require('natural')
var stem = require('stem-porter')
const stemmer = natural.PorterStemmer
const conjuction_list = fs.readFileSync('conjuction.txt', 'utf8').split("\n")
const regex_rm_punctuaction = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g
const regex_rm_conjuction = new RegExp("(\\s+)("+conjuction_list.join("|")+")(\\s+)", "gi")

const express = require('express')
const app = express()

Fiber(function() {
  // set up goes here ...
  var all_string_mh = []
  var mh_all = []

  // mesh heading descriptor name
  server.db("nlmtst").getCollection("medline").find({"MedlineCitation.MeshHeadingList" : {$exists: true}}).forEach(function(result) {
    var mh = result.MedlineCitation.MeshHeadingList;
    var desc_fix = mh.MeshHeading.map((data) => {
      return (typeof(data) == 'string') ? data : data.DescriptorName.attrtext 
    }).join("\n")

    // stopwords, stemming and puctuation
    var removed_conjuction = desc_fix.replace(regex_rm_conjuction," ")
	var text_array  = removed_conjuction.replace(/(\s)?\d\s+/g, ' ').replace(/\n+/g,' ').split(" ").filter((d) => {
		return d != '' && conjuction_list.indexOf(d.toLowerCase()) < 1
	})

    // merge array
	for (var i=0; i<text_array.length; i++) {
		all_string_mh.push(text_array[i])
	}

   })

  console.log(all_string_mh)
}).run();


	
