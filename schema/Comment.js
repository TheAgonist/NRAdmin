'use strict';
var dateFormat = require('dateformat');
exports = module.exports = function(app, mongoose) {
  var commentSchema = new mongoose.Schema({
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
      content: { type: String, default: '' },
      user: {type: String, default: ''},
      song: {type: String, default: ''},
      timeCreated: { type: String, default: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT") },
      deleted: {type: Boolean, default: 0} 
  });
  commentSchema.plugin(require('./plugins/pagedFind'));
  commentSchema.index({ user: 1 });
  commentSchema.index({ 'status.id': 1 });
  commentSchema.index({ search: 1 });
  commentSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Comment', commentSchema);
};
