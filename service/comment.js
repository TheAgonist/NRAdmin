 'use strict';
var record = {
	insert: function(req,res,next){
		//console.log(req.body);
		var setFields = {
			user: req.user.username,
			content: req.body.content,
			song: req.body.song
		}
		req.app.db.models.Comment.create(setFields);
		res.sendStatus(200);
	},
	getAll: function(req,res,next){
		//console.log(req.body);
		req.app.db.models.Comment.find({deleted: false, song: req.body.song}).exec(function(err,comments){
			res.status(200).json(comments);
		});
	}
};
module.exports = record;