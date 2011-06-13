Ext.regModel('User', {
	idProperty: 'key',
	fields: [{
		name: 'key',
		type: 'string'
	},
	{
		name: 'name',
		type: 'string'
	}],
	proxy: {
		type: 'lawnchair',
		id: 'users'
	}
});

module('create()', {
	setup: function() {
		QUnit.stop();

		user1 = Ext.ModelMgr.create({
			name: 'Bob'
		},
		'User');
		user2 = Ext.ModelMgr.create({
			name: 'Carl'
		},
		'User');


		lc.nuke(function() {
			QUnit.start();
		});
	},
	teardown: function() {
		user1 = null;
		user2 = null;
	}
});

test('adds one record', function() {
	QUnit.stop();
	QUnit.expect(3);
	
	var operation = new Ext.data.Operation({
		records: [user1]
	});
	
	proxy.create(operation, function() {
		lc.all(function(r) {
			equals(r.length, 1);
			equals(r[0].name, 'Bob');
			notEqual(r[0].key, null);
			QUnit.start();
		});
	});
});

test('adds two records', function() {
	QUnit.stop();
	QUnit.expect(1);

	var operation = new Ext.data.Operation({
		records: [user1, user2]
	});
	
	proxy.create(operation, function() {
		lc.all(function(r) {
			equals(r.length, 2);
			QUnit.start();
		});
	});
});

module('update()', {
	setup: function() {
		QUnit.stop();

		user = Ext.ModelMgr.create({
			name: 'Bob'
		},
		'User');
		
		lc.nuke(function() {
			QUnit.start();
		});
	},
	teardown: function() {
		user = null;
	}
});

test('updates record', function() {
	QUnit.stop();
	QUnit.expect(1);
	
	var operation = new Ext.data.Operation({
		records: [user]
	});
	
	proxy.create(operation, function() {
		user.set('name', 'newName');
		proxy.update(operation, function() {
			lc.all(function(r) {
				equals(r[0].name, 'newName');
				QUnit.start();
			});
		});
	});
});

module('read()', {
	setup: function() {
		QUnit.stop();

		user1 = Ext.ModelMgr.create({
			name: 'Bob'
		},
		'User');
		user2 = Ext.ModelMgr.create({
			name: 'Carl'
		},
		'User');


		lc.nuke(function() {
			QUnit.start();
		});
	},
	teardown: function() {
		user1 = null;
		user2 = null;
	}
});

test('reads one record', function() {
	QUnit.stop();
	QUnit.expect(2);
	
	var operation = new Ext.data.Operation({
		records: [user1]
	});
	
	proxy.create(operation, function() {
		var operation = new Ext.data.Operation({
			id: user1.getId()
		});
		
		proxy.read(operation, function(op) {
			equals(op.resultSet.totalRecords, 1);
			equals(op.resultSet.records[0].get('name'), 'Bob');
			QUnit.start();
		});
	});
});

test('reads all records', function() {
	QUnit.stop();
	QUnit.expect(1);

	var operation = new Ext.data.Operation({
		records: [user1, user2]
	});
	
	proxy.create(operation, function() {
		var operation = new Ext.data.Operation({
		});
		
		proxy.read(operation, function(op) {
			equals(op.resultSet.totalRecords, 2);
			QUnit.start();
		});
	});
});


module('destroy()', {
	setup: function() {
		QUnit.stop();

		user1 = Ext.ModelMgr.create({
			name: 'Bob'
		},
		'User');
		user2 = Ext.ModelMgr.create({
			name: 'Carl'
		},
		'User');


		lc.nuke(function() {
			QUnit.start();
		});
	},
	teardown: function() {
		user1 = null;
		user2 = null;
	}
});

test('destroy one record', function() {
	QUnit.stop();
	QUnit.expect(2);
	
	var operation = new Ext.data.Operation({
		records: [user1]
	});
	
	proxy.create(operation, function() {
		var operation = new Ext.data.Operation({
		});
		
		proxy.read(operation, function(op) {
			equals(op.resultSet.totalRecords, 1);
		
			var operation = new Ext.data.Operation({
				records: [user1]
			});			
			proxy.destroy(operation, function(){
				var operation = new Ext.data.Operation({
				});

				proxy.read(operation, function(op) {
					equals(op.resultSet.totalRecords, 0);
					QUnit.start();
				});
			});
		});
	});
});

test('destroy two records', function() {
	QUnit.stop();
	QUnit.expect(2);
	
	var operation = new Ext.data.Operation({
		records: [user1, user2]
	});
	
	proxy.create(operation, function() {
		var operation = new Ext.data.Operation({
		});
		
		proxy.read(operation, function(op) {
			equals(op.resultSet.totalRecords, 2);
		
			var operation = new Ext.data.Operation({
				records: [user1, user2]
			});			
			proxy.destroy(operation, function(){
				var operation = new Ext.data.Operation({
				});

				proxy.read(operation, function(op) {
					equals(op.resultSet.totalRecords, 0);
					QUnit.start();
				});
			});
		});
	});
});
