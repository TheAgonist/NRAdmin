'use strict';

exports = module.exports = function(app, mongoose) {
  var recordSchema = new mongoose.Schema({
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
      name: { type: String, default: '' },
      showName: { type: String, default: '' },
      user: {type: String, default: ''},
      show: {type: Boolean, default: false},
      votes: {type: Number, default: 0},
      generated: {type: Boolean, default: false},
      voters: [String],
      deleted: {type: Boolean, default: false}
  });
  recordSchema.plugin(require('./plugins/pagedFind'));
  recordSchema.index({ user: 1 });
  recordSchema.index({ 'status.id': 1 });
  recordSchema.index({ search: 1 });
  recordSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Record', recordSchema);
};
