const testFolder = './uploads/';
const fs = require('fs');

var async = require("async");

var asyncTasks = [];

var data = []
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    asyncTasks.push(function(callback){
    	// Call an async function, often a save() to DB
	    files.someAsyncCall(function(){
	      // Async call is done, alert via callback
	      callback();
	    });
	});

	// Execute all async tasks in the asyncTasks array
	async.parallel(asyncTasks, function(){
	  // All tasks are done now
	  console.log("done sync")
	});

  });

})
