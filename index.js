'use strict'
const fs 	=  require('fs')
const natural = require('natural')
var stem = require('stem-porter')
const stemmer = natural.PorterStemmer
const conjuction_list = fs.readFileSync('conjuction.txt', 'utf8').split("\n")
const texts = fs.readFileSync('input.txt', 'utf8').split("=====")
const regex_rm_punctuaction = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g
const regex_rm_conjuction = new RegExp("(\\s+)("+conjuction_list.join("|")+")(\\s+)", "gi")

var similarity = require( 'compute-cosine-similarity' );

var all_string = [];


texts.forEach((data) => {

	var removed_conjuction = data.replace(regex_rm_conjuction," ")
	var text_array  = removed_conjuction.replace(/(\s)?\d\s+/g, ' ').replace(/\n+/g,' ').split(" ").filter((d) => {
		return d != '' && conjuction_list.indexOf(d.toLowerCase()) < 1
	}).map((d) => {
		var reg = new RegExp(/\d/,'gi')
		var rm_punctuaction = d.replace(regex_rm_punctuaction,'')
		return reg.test(d) ?  d : stemmer.stem(rm_punctuaction)
	})
	
	// merge array
	for (var i=0; i<text_array.length; i++) {
		all_string.push(text_array[i])
	}

})

// Term Frequency
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();

texts.forEach((data) => {
	tfidf.addDocument(data)

})

all_string.forEach((as) => {	
	tfidf.tfidfs(as, function(i, measure) {
    // console.log(i + '. ' + as + ' = ' + measure)
	})

})

var tf1 = []
var tf2 = []
var tf3 = []
// TF 0
tfidf.listTerms(0 /*document index*/).forEach(function(item) {
    console.log(item.term + ': ' + Math.round(item.tfidf))
    tf1.push(Math.round(item.tfidf))
});
console.log('----------------------------------')

// TF 2
tfidf.listTerms(1 /*document index*/).forEach(function(item) {
    console.log(item.term + ': ' + Math.round(item.tfidf))
    tf2.push(Math.round(item.tfidf))
});
console.log('----------------------------------')

// TF 3
tfidf.listTerms(2 /*document index*/).forEach(function(item) {
    console.log(item.term + ': ' + Math.round(item.tfidf))
    tf3.push(Math.round(item.tfidf))
});
console.log('----------------------------------')

// cosine similarity
console.log('Cosine similarity TF1 and TF2 ')
var l1 = tf1.length
var l2 = tf2.length
var l3 = tf3.length
if ( l1 > l2 ) {
	var len_avg = l1-l2
	for (var j=0; j<len_avg; j++) {
		tf2.push('0')
	}
}
else{
	var len_avg2 = l2-l1
	for (var k=0; k<len_avg2; k++) {
		tf1.push('0')
	}
}

var sum = 0
for(var l=0; l< tf1.length; l++) {
    sum += tf1[l]*tf2[l]
}

var cos_sim = 0
var sum_tf1 = 0
var sum_tf2 = 0

for(var l=0; l< tf1.length; l++) {
    sum_tf1 += tf1[l]*tf1[l]
}

for(var l=0; l< tf2.length; l++) {
    sum_tf2 += tf2[l]*tf2[l]
}

cos_sim = sum / (Math.sqrt(sum_tf1)*Math.sqrt(sum_tf2))

console.log(cos_sim)

console.log('Cosine similarity TF2 and TF3 ')
if ( l2 > l3 ) {
	var len_avg3 = l2-l3
	for (var j=0; j<len_avg; j++) {
		tf3.push('0')
	}
}
else{
	var len_avg4 = l2-l1
	for (var k=0; k<len_avg2; k++) {
		tf2.push('0')
	}
}

var sum2 = 0
for(var l=0; l< tf2.length; l++) {
    sum2 += tf1[l]*tf2[l]
}

var cos_sim2 = 0
var sum_tf3 = 0

for(var l=0; l< tf2.length; l++) {
    sum_tf2 += tf2[l]*tf2[l]
}

for(var l=0; l< tf3.length; l++) {
    sum_tf3 += tf3[l]*tf3[l]
}

cos_sim2 = sum2 / (Math.sqrt(sum_tf2)*Math.sqrt(sum_tf3))

console.log(cos_sim2)