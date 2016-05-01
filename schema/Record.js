'use strict';

exports = module.exports = function(app, mongoose) {
  var recordSchema = new mongoose.Schema({
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
      name: { type: String, default: '' },
      user: {type: String, default: ''},
      show: {type: Number, default: 0},
      votes: {type: Number, default: 0},
      deleted: {type: Boolean, default: 0}
  });
  recordSchema.plugin(require('./plugins/pagedFind'));
  recordSchema.index({ user: 1 });
  recordSchema.index({ 'status.id': 1 });
  recordSchema.index({ search: 1 });
  recordSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Record', recordSchema);
};
