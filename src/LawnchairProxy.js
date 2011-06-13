/**
 * @author Thomas Pedersen
 * @class Ext.data.LawnchairProxy
 * @extends Ext.data.ClientProxy
 * 
 * 
 * 
 * @constructor
 * Creates the proxy, throws an error if local storage is not supported in the current browser
 * @param {Object} config Optional config object
 */
Ext.data.LawnchairProxy = Ext.extend(Ext.data.ClientProxy, {

	/**
	 * @cfg {String} id The unique ID used as the key in which all record data are stored in the local storage object
	 */
	id: undefined,

	/**
	 * @ignore
	 */
	constructor: function(config) {
		Ext.data.LawnchairProxy.superclass.constructor.call(this, config);

		/**
		 * Cached map of records already retrieved by this Proxy - ensures that the same instance is always retrieved
		 * @property cache
		 * @type Object
		 */
		this.cache = {};

		if (this.getStorageObject() == undefined) {
			throw "Local Storage is not supported in this browser, please use another type of data proxy";
		}

		//if an id is not given, try to use the store's id instead
		this.id = this.id || (this.store ? this.store.storeId : undefined);

		if (this.id == undefined) {
			throw "No unique id was provided to the local storage proxy. See Ext.data.LocalStorageProxy documentation for details";
		}
	},

	//inherit docs
	create: function(operation, callback, scope) {
		this.saveOrUpdate(operation, callback, scope);
	},

	//inherit docs
	update: function(operation, callback, scope) {
		this.saveOrUpdate(operation, callback, scope);
	},

	//@private
	saveOrUpdate: function(operation, callback, scope) {
		var records = operation.records,
			length = records.length,
			that = this,
			toSave = [],
			record, i;

		operation.setStarted();

		for (i = 0; i < length; i++) {
			record = records[i];

			if (record.phantom) {
				record.phantom = false;
			}

			toSave.push(record.data);
		}

		this.getStorageObject().batch(toSave, function(results) {
			operation.setCompleted();
			operation.setSuccessful();

			if (typeof callback == 'function') {
				callback.call(scope || that, operation);
			}
		});
	},

	//inherit docs
	read: function(operation, callback, scope) {
		//TODO: respect sorters, filters, start and limit options on the Operation
		var records = [],
			that = this,
			record;

		if (operation.id) {
			this.getStorageObject().get(operation.id, function(result) {

				record = that.createModel(result, operation.id);
				records.push(record);
				operation.setSuccessful();
				operation.setCompleted();

				operation.resultSet = new Ext.data.ResultSet({
					records: records,
					total: records.length,
					loaded: true
				});

				if (typeof callback == 'function') {
					callback.call(scope || that, operation);
				}
			});
		} else {
			this.getStorageObject().all(function(results) {
				for (var i = results.length - 1; i >= 0; i--) {
					var result = results[i];

					record = that.createModel(result, result.key);
					records.push(record);
				};

				operation.setSuccessful();
				operation.setCompleted();

				operation.resultSet = new Ext.data.ResultSet({
					records: records,
					total: records.length,
					loaded: true
				});

				if (typeof callback == 'function') {
					callback.call(scope || that, operation);
				}
			});
		}

	},

	//@private
	createModel: function(rawData, id) {
		var data = {},
			Model = this.model,
			fields = Model.prototype.fields.items,
			length = fields.length,
			i, field, name, record;

		for (i = 0; i < length; i++) {
			field = fields[i];
			name = field.name;

			if (typeof field.decode == 'function') {
				data[name] = field.decode(rawData[name]);
			} else {
				data[name] = rawData[name];
			}
		}

		record = new Model(data, id);
		record.phantom = false;

		return record;
	},

	//inherit docs
	destroy: function(operation, callback, scope) {
		var records = operation.records,
			that = this;
		
		this.batchDestroy(records, function(){
			operation.setSuccessful();
			operation.setCompleted();
			if (typeof callback == 'function') {
				callback.call(scope || that, operation);
			}
		});
	},
	
	// @private
	batchDestroy: function(objs, cb) {
		var destroyed = 0,
			done = false,
			that = this;

		var updateProgress = function() {
			destroyed += 1;
			done = destroyed === objs.length;
		};

		var checkProgress = setInterval(function() {
			if (done) {
				if (cb) {
					cb.call(that);
				}
				clearInterval(checkProgress);
			}
		},
		200);

		for (var i = 0, l = objs.length; i < l; i++) {
			this.getStorageObject().remove(objs[i].getId(), updateProgress);
		}
	},

	/**
	 * Destroys all records stored in the proxy and removes all keys and values used to support the proxy from the storage object
	 */
	clear: function() {
		this.getStorageObject().nuke();
	},

	/**
	 * @private
	 * Abstract function which should return the storage object that data will be saved to. This must be implemented
	 * in each subclass.
	 * @return {Object} The storage object
	 */
	getStorageObject: function() {
		if (!this.lawnchair) {
			this.lawnchair = new Lawnchair({
				name: this.id
			},
			function() {});
		}
		return this.lawnchair;
	}
});

Ext.data.ProxyMgr.registerType('lawnchair', Ext.data.LawnchairProxy);
