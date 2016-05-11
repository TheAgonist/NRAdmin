 'use strict';
var record = {

	find: function (req, res, next) {
	    req.query.name = req.query.name ? req.query.name : '';
	    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	    req.query.sort = req.query.sort ? req.query.sort : '-votes';

	    var filters = {};
	    if (req.query.name) {
	      filters.name = new RegExp('^.*?' + req.query.name + '.*$', 'i');
	    }
	    //console.log(req.route.path)
	    if(req.route.path == '/api/record/records'){
	    	//console.log("noupppp");
	    	filters.show = true;
	    }
	    if(req.route.path == '/api/record/user'){
	    	filters.user = req.user.username;
	    }
	    if(req.route.path == '/api/record/generated'){
	    	filters.generated = true;
	    }
	    //console.log(filters.user);
	    filters.deleted = false;
	    req.app.db.models.Record.pagedFind({
	      filters: filters,
	      keys: 'votes name show showName user voters',
	      limit: req.query.limit,
	      page: req.query.page,
	      sort: req.query.sort
	    }, function (err, results) {
	      if (err) {
	        return next(err);
	      }
	      results.filters = req.query;
	      res.status(200).json(results);
	    });
	},
 	update: function(req,res,next){
 		var workflow = req.app.utility.workflow(req, res);
 		//console.log("right place right time");

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
			    	var fieldsToSet = {
						show: req.body.show
			    	};
		    }
	    	console.log(fieldsToSet.deleted+" ||||||||||||||||||| "+req.body._id);
	    	req.app.db.models.Record.findByIdAndUpdate(req.body._id, fieldsToSet, function(err, record) {
		        if (err) {
		        	console.log(err);
		          return workflow.emit('exception', err);
		        }

		        if(action == "/api/record/upvote"){
			     	record.voters.push(req.user.username);
			     	req.app.db.models.Record.findByIdAndUpdate(req.body._id, {voters: record.voters}, function(err,record){
			     		console.log(err);
			     	});
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