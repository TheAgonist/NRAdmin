 'use strict';
var record = {
	getRecordDetails: function(req,res,next){
		var outcome = {};
		var getAllRecordsData = function(callback) {
	    req.app.db.models.Record.find({'deleted': false, 'show': true}).sort({ votes: -1 }).exec(function(err, account) {
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
 	getUserRecordDetails: function(req,res,next){
		var outcome = {};
		var getUserRecordsData = function(callback) {
			//console.log(req.session.passport.user);
	    	req.app.db.models.Record.find({'user': req.session.passport.user}).sort({ votes: -1 }).exec(function(err, account) {
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

    	require('async').parallel([getUserRecordsData], asyncFinally);
 	},
 	update: function(req,res,next){
 		var workflow = req.app.utility.workflow(req, res);
 		console.log(req.app);
	    workflow.on('validate', function() {
	      workflow.emit('patchRecord');
	    });

	    workflow.on('patchRecord', function() {
	    	var action = req.route.path;
	    	if(action == "/api/record/upvote"){
		     	var fieldsToSet = {
					votes: req.body.votes+1
		    	};
		    }
		    if(action == "/api/record/delete"){
		    	var fieldsToSet = {
					deleted: true
		    	};
		    }
		    if(action == "/api/record/show"){
		    	if(req.body.show == false){
			    	var fieldsToSet = {
						show: true
			    	};
		    	}else{
		    		var fieldsToSet = {
		    			show: false
		    		};
		    	}
		    }
	    	console.log(fieldsToSet.deleted+" ||||||||||||||||||| "+req.body._id);
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