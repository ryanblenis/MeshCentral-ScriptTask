/** 
* @description MeshCentral database abstraction layer for NeDB to be more Mongo-like
* @author Ryan Blenis
* @copyright Ryan Blenis 2019
* @license Apache-2.0
* This is by no means feature complete, just a simple abstraction layer for many commonly used DB calls.
* It supplements the need to duplicate and modify all NeDB calls in the db.js file by assuming that .toArray()
* will be called on MongoDB objects (as you normally would to keep the return values of NeDB / Mongo similarly for MeshCentral consumption)
* and uses that information to then call a .exec() function on the supplied NeDB with the given arguments.
* This does NOT handle some of Mongo's more complex arguments (yet)
*/
class NEMongo {
    constructor(nedbInst) {
        this.nedb = nedbInst;
        this._find = null;
        this._proj = null;
        this._limit = null;
        this._sort = null;
        return this;
    }
    
    find(args, proj) {
        this._find = args;
        this._proj = proj;
        return this;
    }
    
    project(args) {
        this._proj = args;
        
        return this;
    }
    
    sort(args) {
        this._sort = args;
        return this;
    }
    
    limit(limit) {
        this._limit = limit;
        return this;
    }
    
    toArray(callback) {
        var self = this; 
        return new Promise(function(resolve, reject) {
            self.nedb.find( self._find, self._proj ).sort(self._sort).limit(self._limit).exec((err, docs) => {
              if (callback != null && typeof callback == 'function') callback(err, docs);
              if (err != null) reject(err);
              if (callback != null && typeof callback == 'function') callback(err, docs);
              else resolve(docs);
            });
        });
    }
    
    insertOne(args, options) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.nedb.insert(args, function(err, newDoc) { 
                if (err) reject(err);
                newDoc.insertedId = newDoc._id;
                resolve({ insertedId: newDoc._id });
            });
        });
    }
    
    deleteOne(filter, options) {
        var self = this;
        self._find = filter;
        return new Promise(function(resolve, reject) {
            self.nedb.remove(self._find, { multi: false }, function(err, numRemoved) { 
                if (err) reject(err);
                resolve( { deletedCount: numRemoved } );
            });
        });
    }
    
    deleteMany(filter, options) {
        var self = this;
        self._find = filter;
        return new Promise(function(resolve, reject) {
            self.nedb.remove(self._find, { multi: true }, function(err, numRemoved) { 
                if (err) reject(err);
                resolve( { deletedCount: numRemoved } );
            });
        });
    }
    
    updateOne(filter, update, options) {
        var self = this;
        self._find = filter;
        if (options == null) options = {};
        if (options.upsert == null) options.upsert = false;
        return new Promise(function(resolve, reject) {
            self.nedb.update(self._find, update, { multi: false, upsert: options.upsert }, function(err, numAffected, affectedDoc) { 
                if (err) reject(err);
                var retObj = { matchedCount: numAffected, modifiedCount: numAffected };
                if (affectedDoc != null) retObj.upsertedId = affectedDoc._id;
                resolve(retObj);
            });
        });
    }
    
    updateMany(filter, update, options) {
        var self = this;
        self._find = filter;
        if (options == null) options = {};
        if (options.upsert == null) options.upsert = false;
        return new Promise(function(resolve, reject) {
            self.nedb.update(self._find, update, { multi: true, upsert: options.upsert }, function(err, numAffected, affectedDocs) { 
                if (err) reject(err);
                var retObj = { matchedCount: numAffected, modifiedCount: numAffected };
                if (affectedDocs != null) retObj.upsertedId = affectedDocs[0]._id;
                resolve(retObj);
            });
        });
    }
    
}

module.exports = NEMongo;