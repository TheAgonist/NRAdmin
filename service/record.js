'use strict';
var record = {
	getRecordDetails: function(req,res,next){
		var outcome = {};
		var getAllRecordsData = function(callback) {
	      req.app.db.models.Record.find().sort({ votes: -1 }).exec(function(err, account) {
	        if (err) {
	          return callback(err, null);
	        }

	        outcome.account = account;
	        callback(null, 'done');
	      });
	    };
	    var asyncFinally = function(err, results) {
	      if (err) {
	        return next(err);
	      }
	      res.status(200).json(outcome);
	    };

    	require('async').parallel([getAllRecordsData], asyncFinally);
 	},
 	update: function(req,res,next){
 		var workflow = req.app.utility.workflow(req, res);
 		//console.log(req);
	    workflow.on('validate', function() {
	      workflow.emit('patchRecord');
	    });

	    workflow.on('patchRecord', function() {
	    	console.log(req.route.path);
	    	var action = req.route.path;
	    	if(action == "/api/record/upvote"){
		     	var fieldsToSet = {
					votes: req.body.votes+1
		    	};
		    }
	    	console.log(fieldsToSet.votes+" "+req.body._id);
	    	req.app.db.models.Record.findByIdAndUpdate(req.body._id, fieldsToSet, function(err, record) {
		        if (err) {
		        	console.log(err);
		          return workflow.emit('exception', err);
		        }

		        workflow.outcome.record = record;
		        console.log(record.votes);
		        return workflow.emit('response');
	    	});
	    });
	    workflow.emit('validate');
 	}
};
module.exports = record;