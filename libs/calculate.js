'use strict';

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var async = require('async')

class Calculate{
    exec(type,coll,index_data = 1 , callback){
        var url = type == 'mh' ?  'mongodb://localhost:27017/nlmtst_mh_result' : 'mongodb://localhost:27017/nlmtst_data_result'
        MongoClient.connect(url, function(err, db) {
            async.series([
             function(call) { 
               var collection = db.collection(coll);
               collection.find({}).toArray(function(err, docs) {
                 if (err) throw err
                 
                 call(docs);
              });
              },
           ], function(results){
                var tf = results.map((d)=> {return d.data})
                var tfprob = []
                tf.forEach((tfitem1, index1) => {
                    if (index1 == index_data) {
                    tf.forEach((tfitem2, index2) => {
                            tfprob.push({ first : index1 , second : index2})
                    })
                    }
                })
                var cos_sim_all = []
                tfprob.forEach((item) => {
                    var l1 = tf[item.first].length
                    var l2 = tf[item.second].length
                    var tf1 = tf[item.first]
                    var tf2 = tf[item.second]
                    if ( l1 > l2 ) {
                        var len_avg = l1-l2
                        for (var j=0; j<len_avg; j++) { tf2.push({term : '-', tfdif : 0}) }
                    }
                    else{
                        var len_avg2 = l2-l1
                        for (var k=0; k<len_avg2; k++) { tf1.push({term : '-', tfdif : 0}) }
                    }
                    var tf_sum = []
                    tf1.forEach((item) => {
                        var a = tf2.filter((d) => {
                            return item.term == d.term && item.term != '-' && d.term != '-'
                        })
                        if (a.length > 0) {
                            var b = item.tfdif*a[0].tfdif
                            tf_sum.push(b)
                        }
                    })
                    var sum = tf_sum.length > 0 ? tf_sum.reduce((accumulator, currentValue) => accumulator + currentValue) : 0
                    var A = tf1.map((data, index) => {
                        return Math.pow(data.tfdif, 2)
                    }).reduce((accumulator, currentValue) => accumulator + currentValue)
                    var B = tf2.map((data, index) => {
                        return Math.pow(data.tfdif, 2)
                    }).reduce((accumulator, currentValue) => accumulator + currentValue)
        
                    var cos_sim = sum / (Math.sqrt(A)*Math.sqrt(B))
                    
                    cos_sim_all.push({
                        first : item.first,
                        second : item.second,
                        sim : cos_sim
                    })
                    
                })
    
                var sims = []
                
                tf.forEach((tfitem1, index) => {
                    var r = cos_sim_all.filter((data) => {
                        return data.second == index
                    }).map((data) => {
                        return data.sim
                    })
                    sims[index] = r
                })
                var d = { sims : sims, col_length : tf.length }
                callback(d)
           })
        })
    }
}

module.exports = new Calculate()
