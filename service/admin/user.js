'use strict';

// public api
var user = {
  find: function (req, res, next) {
    req.query.username = req.query.username ? req.query.username : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';
    req.query.isActive = req.query.isActive ? req.query.isActive : '';
    req.query.roles = req.query.roles ? req.query.roles : '';

    var filters = {};
    if (req.query.username) {
      filters.username = new RegExp('^.*?' + req.query.username + '.*$', 'i');
    }

    filters.deleted = false;

    if (req.query.roles && req.query.roles === 'admin') {
      filters['roles.admin'] = {$exists: true};
    }

    if (req.query.roles && req.query.roles === 'account') {
      filters['roles.account'] = {$exists: true};
    }

    req.app.db.models.User.pagedFind({
      filters: filters,
      keys: 'username email',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
    }, function (err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      if (!req.body.username) {
        workflow.outcome.errors.push('Please enter a username.');
        return workflow.emit('response');
      }

      if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
        workflow.outcome.errors.push('only use letters, numbers, -, _');
        return workflow.emit('response');
      }

      workflow.emit('duplicateUsernameCheck');
    });

    workflow.on('duplicateUsernameCheck', function () {
      req.app.db.models.User.findOne({username: req.body.username}, function (err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errors.push('That username is already taken.');
          return workflow.emit('response');
        }

        workflow.emit('createUser');
      });
    });

    workflow.on('createUser', function () {
      var fieldsToSet = {
        username: req.body.username,
        search: [
          req.body.username
        ]
      };
      req.app.db.models.User.create(fieldsToSet, function (err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = user;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  read: function(req, res, next){
    req.app.db.models.User.findById(req.params.id).populate('roles.admin', 'name.full').populate('roles.account', 'name.full').exec(function(err, user) {
      if (err) {
        return next(err);
      }
      res.status(200).json(user);
    });
  },

  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);
    var fieldsToSet = {
      deleted: true
    };
    req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, record) {
      if (err) {
        console.log(err);
        return workflow.emit('exception', err);
      }

      workflow.outcome.record = record;
      return workflow.emit('response');
    });
      workflow.emit('validate');
  },

  password: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.newPassword) {
        workflow.outcome.errfor.newPassword = 'required';
      }

      if (!req.body.confirm) {
        workflow.outcome.errfor.confirm = 'required';
      }

      if (req.body.newPassword !== req.body.confirm) {
        workflow.outcome.errors.push('Passwords do not match.');
      }

      if (workflow.hasErrors()) {
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
      req.app.db.models.User.encryptPassword(req.body.newPassword, function(err, hash) {
        if (err) {
          return workflow.emit('exception', err);
        }

        var fieldsToSet = { password: hash };
        var options = { new: true };
        req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('roles.admin roles.account', 'name.full', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.user = user;
            workflow.outcome.newPassword = '';
            workflow.outcome.confirm = '';
            workflow.emit('response');
          });
        });
      });
    });

    workflow.emit('validate');
  },

  linkAdmin: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not link users to admins.');
        return workflow.emit('response');
      }

      if (!req.body.newAdminId) {
        workflow.outcome.errfor.newAdminId = 'required';
        return workflow.emit('response');
      }

      workflow.emit('verifyAdmin');
    });

    workflow.on('verifyAdmin', function(callback) {
      req.app.db.models.Admin.findById(req.body.newAdminId).exec(function(err, admin) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!admin) {
          workflow.outcome.errors.push('Admin not found.');
          return workflow.emit('response');
        }

        if (admin.user.id && admin.user.id !== req.params.id) {
          workflow.outcome.errors.push('Admin is already linked to a different user.');
          return workflow.emit('response');
        }

        workflow.admin = admin;
        workflow.emit('duplicateLinkCheck');
      });
    });

    workflow.on('duplicateLinkCheck', function(callback) {
      req.app.db.models.User.findOne({ 'roles.admin': req.body.newAdminId, _id: {$ne: req.params.id} }).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errors.push('Another user is already linked to that admin.');
          return workflow.emit('response');
        }

        workflow.emit('patchUser');
      });
    });

    workflow.on('patchUser', function(callback) {
      req.app.db.models.User.findById(req.params.id).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        user.roles.admin = req.body.newAdminId;
        user.save(function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('roles.admin roles.account', 'name.full', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.user = user;
            workflow.emit('patchAdmin');
          });
        });
      });
    });

    workflow.on('patchAdmin', function() {
      workflow.admin.user = { id: req.params.id, name: workflow.outcome.user.username };
      workflow.admin.save(function(err, admin) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  unlinkAdmin: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not unlink users from admins.');
        return workflow.emit('response');
      }

      if (req.user._id + '' === req.params.id) {
        workflow.outcome.errors.push('You may not unlink yourself from admin.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
      req.app.db.models.User.findById(req.params.id).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!user) {
          workflow.outcome.errors.push('User was not found.');
          return workflow.emit('response');
        }

        var adminId = user.roles.admin;
        user.roles.admin = null;
        user.save(function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('roles.admin roles.account', 'name.full', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.user = user;
            workflow.emit('patchAdmin', adminId);
          });
        });
      });
    });

    workflow.on('patchAdmin', function(id) {
      req.app.db.models.Admin.findById(id).exec(function(err, admin) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!admin) {
          workflow.outcome.errors.push('Admin was not found.');
          return workflow.emit('response');
        }

        admin.user = undefined;
        admin.save(function(err, admin) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response');
        });
      });
    });

    workflow.emit('validate');
  },

  linkAccount: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not link users to accounts.');
        return workflow.emit('response');
      }

      if (!req.body.newAccountId) {
        workflow.outcome.errfor.newAccountId = 'required';
        return workflow.emit('response');
      }

      workflow.emit('verifyAccount');
    });

    workflow.on('verifyAccount', function(callback) {
      req.app.db.models.Account.findById(req.body.newAccountId).exec(function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!account) {
          workflow.outcome.errors.push('Account not found.');
          return workflow.emit('response');
        }

        if (account.user.id && account.user.id !== req.params.id) {
          workflow.outcome.errors.push('Account is already linked to a different user.');
          return workflow.emit('response');
        }

        workflow.account = account;
        workflow.emit('duplicateLinkCheck');
      });
    });

    workflow.on('duplicateLinkCheck', function(callback) {
      req.app.db.models.User.findOne({ 'roles.account': req.body.newAccountId, _id: {$ne: req.params.id} }).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (user) {
          workflow.outcome.errors.push('Another user is already linked to that account.');
          return workflow.emit('response');
        }

        workflow.emit('patchUser');
      });
    });

    workflow.on('patchUser', function(callback) {
      req.app.db.models.User.findById(req.params.id).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        user.roles.account = req.body.newAccountId;
        user.save(function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('roles.admin roles.account', 'name.full', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.user = user;
            workflow.emit('patchAccount');
          });
        });
      });
    });

    workflow.on('patchAccount', function() {
      workflow.account.user = { id: req.params.id, name: workflow.outcome.user.username };
      workflow.account.save(function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  unlinkAccount: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not unlink users from accounts.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
      req.app.db.models.User.findById(req.params.id).exec(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!user) {
          workflow.outcome.errors.push('User was not found.');
          return workflow.emit('response');
        }

        var accountId = user.roles.account;
        user.roles.account = null;
        user.save(function(err, user) {
          if (err) {
            return workflow.emit('exception', err);
          }

          user.populate('roles.admin roles.account', 'name.full', function(err, user) {
            if (err) {
              return workflow.emit('exception', err);
            }

            workflow.outcome.user = user;
            workflow.emit('patchAccount', accountId);
          });
        });
      });
    });

    workflow.on('patchAccount', function(id) {
      req.app.db.models.Account.findById(id).exec(function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (!account) {
          workflow.outcome.errors.push('Account was not found.');
          return workflow.emit('response');
        }

        account.user = undefined;
        account.save(function(err, account) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response');
        });
      });
    });

    workflow.emit('validate');
  }
};
module.exports = user;