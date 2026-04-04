/** 
* @description MeshCentral database abstraction layer for MariaDB
* @author Ryan Blenis
* @copyright 
* @license Apache-2.0
* This is a simple abstraction layer for many commonly used DB calls.
* It routes requests between the legacy JSON table and a dedicated Jobs table.
*/

class NEMariaDB {
    constructor(pool) {
        this.pool = pool;
        this._find = null;
        this._proj = null;
        this._limit = null;
        this._sort = null;

        // initialize tables
        this._initDB();

        return this;
    }

    _initDB() {
        this.pool.query("CREATE TABLE IF NOT EXISTS plugin_scripttask (id VARCHAR(128) PRIMARY KEY, doc JSON)")
            .catch(err => { console.log("PLUGIN: ScriptTask: Error creating database table", err); });

        this.pool.query("CREATE TABLE IF NOT EXISTS plugin_scripttask_jobs (id VARCHAR(128) PRIMARY KEY, type VARCHAR(64) DEFAULT 'job', queueTime INT, dontQueueUntil INT, dispatchTime INT, completeTime INT, lastPing INT, node VARCHAR(256), scriptId VARCHAR(128), scriptName VARCHAR(512), replaceVars JSON, returnVal MEDIUMTEXT, errorVal TEXT, returnAct VARCHAR(256), runBy VARCHAR(256), jobSchedule VARCHAR(128))")
            .catch(err => { console.log("PLUGIN: ScriptTask: Error creating jobs table", err); });
    }

    _escape(val) {
        // Use the native secure pool escaper to serialize standard values. 
        // Handles \x00, \n, \r, \, ', ", and \x1a safely.
        if (typeof val === 'object' && val !== null) {
            return this.pool.escape(JSON.stringify(val));
        }
        return this.pool.escape(val);
    }

    _escapeCol(col) {
        // Enclose in backticks and remove internal backticks to comprehensively protect column names
        return '`' + col.replace(/`/g, '') + '`';
    }

    _escapeJsonPath(path) {
        // Securely format JSON path keys by double quoting them inside the single-quoted string literal
        return "'$.\"" + path.replace(/"/g, '\\"') + "\"'";
    }

    _buildWhereDoc(filter) {
        if (!filter || Object.keys(filter).length === 0) return "1=1";
        var conditions = [];
        for (var key in filter) {
            if (key === '$or') {
                var orConds = [];
                for (var i in filter.$or) orConds.push("(" + this._buildWhereDoc(filter.$or[i]) + ")");
                conditions.push("(" + orConds.join(" OR ") + ")");
            } else if (key === '$and') {
                var andConds = [];
                for (var i in filter.$and) andConds.push("(" + this._buildWhereDoc(filter.$and[i]) + ")");
                conditions.push("(" + andConds.join(" AND ") + ")");
            } else {
                var val = filter[key];
                var dbKey = key === '_id' ? '`id`' : `JSON_UNQUOTE(JSON_EXTRACT(\`doc\`, ${this._escapeJsonPath(key)}))`;

                if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                    for (var op in val) {
                        if (op === '$in') {
                            if (val.$in.length === 0) {
                                conditions.push('1=0');
                            } else {
                                var inList = val.$in.map(v => this._escape(v)).join(",");
                                conditions.push(`${dbKey} IN (${inList})`);
                            }
                        } else if (op === '$gte') {
                            conditions.push(`${dbKey} >= ${this._escape(val.$gte)}`);
                        } else if (op === '$lte') {
                            conditions.push(`${dbKey} <= ${this._escape(val.$lte)}`);
                        } else if (op === '$gt') {
                            conditions.push(`${dbKey} > ${this._escape(val.$gt)}`);
                        } else if (op === '$lt') {
                            conditions.push(`${dbKey} < ${this._escape(val.$lt)}`);
                        } else if (op === '$ne') {
                            if (val.$ne === null) {
                                conditions.push(`(${dbKey} IS NOT NULL AND ${dbKey} != 'null')`);
                            } else {
                                conditions.push(`${dbKey} != ${this._escape(val.$ne)}`);
                            }
                        }
                    }
                } else if (val === null) {
                    conditions.push(`(${dbKey} IS NULL OR ${dbKey} = 'null')`);
                } else {
                    conditions.push(`${dbKey} = ${this._escape(val)}`);
                }
            }
        }
        return conditions.join(" AND ");
    }

    _buildWhereJob(filter) {
        if (!filter || Object.keys(filter).length === 0) return "1=1";
        var conditions = [];
        for (var key in filter) {
            if (key === '$or') {
                var orConds = [];
                for (var i in filter.$or) orConds.push("(" + this._buildWhereJob(filter.$or[i]) + ")");
                conditions.push("(" + orConds.join(" OR ") + ")");
            } else if (key === '$and') {
                var andConds = [];
                for (var i in filter.$and) andConds.push("(" + this._buildWhereJob(filter.$and[i]) + ")");
                conditions.push("(" + andConds.join(" AND ") + ")");
            } else {
                var val = filter[key];
                var dbKey = key === '_id' ? '`id`' : this._escapeCol(key);

                if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                    for (var op in val) {
                        if (op === '$in') {
                            if (val.$in.length === 0) {
                                conditions.push('1=0');
                            } else {
                                var inList = val.$in.map(v => this._escape(v)).join(",");
                                conditions.push(`${dbKey} IN (${inList})`);
                            }
                        } else if (op === '$gte') {
                            conditions.push(`${dbKey} >= ${this._escape(val.$gte)}`);
                        } else if (op === '$lte') {
                            conditions.push(`${dbKey} <= ${this._escape(val.$lte)}`);
                        } else if (op === '$gt') {
                            conditions.push(`${dbKey} > ${this._escape(val.$gt)}`);
                        } else if (op === '$lt') {
                            conditions.push(`${dbKey} < ${this._escape(val.$lt)}`);
                        } else if (op === '$ne') {
                            if (val.$ne === null) {
                                conditions.push(`${dbKey} IS NOT NULL`);
                            } else {
                                conditions.push(`${dbKey} != ${this._escape(val.$ne)}`);
                            }
                        }
                    }
                } else if (val === null) {
                    conditions.push(`${dbKey} IS NULL`);
                } else {
                    conditions.push(`${dbKey} = ${this._escape(val)}`);
                }
            }
        }
        return conditions.join(" AND ");
    }

    find(args, proj) {
        this._find = args;
        this._proj = proj;
        this._sort = null;
        this._limit = null;
        return this;
    }

    project(args) { this._proj = args; return this; }
    sort(args) { this._sort = args; return this; }
    limit(limit) { this._limit = Number(limit) || null; return this; }

    _applyProjection(docs) {
        if (!this._proj) return docs;
        var keepFields = [];
        var excludeFields = [];
        for (var p in this._proj) {
            if (this._proj[p] === 1) keepFields.push(p);
            else if (this._proj[p] === 0) excludeFields.push(p);
        }
        var ret = [];
        for (var doc of docs) {
            var pDoc = {};
            if (keepFields.length > 0) {
                for (var k of keepFields) { if (doc[k] !== undefined) pDoc[k] = doc[k]; }
                if (excludeFields.indexOf('_id') === -1) pDoc._id = doc._id || doc.id;
                ret.push(pDoc);
            } else {
                var nDoc = { ...doc };
                for (var k of excludeFields) delete nDoc[k];
                ret.push(nDoc);
            }
        }
        return ret;
    }

    toArray(callback) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var isJob = self._find && self._find.type === 'job';

            var queryJob = () => {
                var wJ = self._buildWhereJob(self._find);
                var q = `SELECT * FROM \`plugin_scripttask_jobs\` WHERE ${wJ}`;
                if (self._sort) {
                    var order = [];
                    for (var key in self._sort) order.push(`${key === '_id' ? '`id`' : self._escapeCol(key)} ${self._sort[key] === -1 ? 'DESC' : 'ASC'}`);
                    if (order.length > 0) q += " ORDER BY " + order.join(", ");
                }
                if (self._limit) q += ` LIMIT ${self._limit}`;
                return self.pool.query(q).then(rows => {
                    var docs = [];
                    for (var r of rows) {
                        var it = { ...r };
                        it._id = it.id; delete it.id;
                        for (var k in it) {
                            if (typeof it[k] === 'bigint') it[k] = Number(it[k]);
                        }
                        if (it.replaceVars && typeof it.replaceVars === 'string') {
                            try { it.replaceVars = JSON.parse(it.replaceVars); } catch (e) { }
                        }
                        docs.push(it);
                    }
                    return docs;
                });
            };

            var queryDoc = () => {
                var wD = self._buildWhereDoc(self._find);
                var q = `SELECT \`doc\` FROM \`plugin_scripttask\` WHERE ${wD}`;
                if (self._sort) {
                    var order = [];
                    for (var key in self._sort) {
                        if (key === '_id') order.push(`\`id\` ${self._sort[key] === -1 ? 'DESC' : 'ASC'}`);
                        else order.push(`JSON_UNQUOTE(JSON_EXTRACT(\`doc\`, ${self._escapeJsonPath(key)})) ${self._sort[key] === -1 ? 'DESC' : 'ASC'}`);
                    }
                    if (order.length > 0) q += " ORDER BY " + order.join(", ");
                }
                if (self._limit) q += ` LIMIT ${self._limit}`;
                return self.pool.query(q).then(rows => {
                    var docs = [];
                    for (var i = 0; i < rows.length; i++) {
                        var doc = typeof rows[i].doc === 'string' ? JSON.parse(rows[i].doc) : rows[i].doc;
                        docs.push(doc);
                    }
                    return docs;
                });
            };

            var handleResults = (docs) => {
                docs = self._applyProjection(docs);
                if (callback != null && typeof callback == 'function') callback(null, docs);
                resolve(docs);
            }

            if (isJob) return queryJob().then(handleResults).catch(reject);
            if (self._find && self._find.type && self._find.type !== 'job') return queryDoc().then(handleResults).catch(reject);

            queryDoc().then(docs => {
                if (docs.length > 0) return handleResults(docs);
                return queryJob().then(handleResults);
            }).catch(reject);
        });
    }

    insertOne(args, options) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var id = args._id;
            if (!id) {
                id = require('crypto').randomBytes(12).toString('hex');
                args._id = id;
            }
            if (args.type === 'job') {
                var cols = ['`id`'];
                var qmarks = ['?'];
                var vals = [id];
                for (var k in args) {
                    if (k === '_id' || k === 'id') continue;
                    cols.push(self._escapeCol(k));
                    qmarks.push('?');
                    var v = args[k];
                    if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
                    vals.push(v);
                }
                self.pool.query(`INSERT INTO \`plugin_scripttask_jobs\` (${cols.join(',')}) VALUES (${qmarks.join(',')})`, vals)
                    .then(res => resolve({ insertedId: id }))
                    .catch(reject);
            } else {
                var docStr = JSON.stringify(args);
                self.pool.query("INSERT INTO \`plugin_scripttask\` (`id`, `doc`) VALUES (?, ?)", [id, docStr])
                    .then(res => resolve({ insertedId: id }))
                    .catch(reject);
            }
        });
    }

    deleteOne(filter, options) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var isJob = filter.type === 'job';
            var isDoc = filter.type && filter.type !== 'job';
            var tryJob = () => self.pool.query(`DELETE FROM \`plugin_scripttask_jobs\` WHERE ${self._buildWhereJob(filter)} LIMIT 1`);
            var tryDoc = () => self.pool.query(`DELETE FROM \`plugin_scripttask\` WHERE ${self._buildWhereDoc(filter)} LIMIT 1`);

            if (isJob) return tryJob().then(res => resolve({ deletedCount: res.affectedRows })).catch(reject);
            if (isDoc) return tryDoc().then(res => resolve({ deletedCount: res.affectedRows })).catch(reject);

            var count = 0;
            tryDoc().catch(err => { if (err.errno === 1054) return { affectedRows: 0 }; throw err; })
                .then(res => {
                    count += res.affectedRows;
                    return tryJob().catch(err => { if (err.errno === 1054) return { affectedRows: 0 }; throw err; });
                })
                .then(res => {
                    count += res.affectedRows;
                    resolve({ deletedCount: count });
                })
                .catch(reject);
        });
    }

    deleteMany(filter, options) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var isJob = filter.type === 'job';
            var isDoc = filter.type && filter.type !== 'job';
            var tryJob = () => self.pool.query(`DELETE FROM \`plugin_scripttask_jobs\` WHERE ${self._buildWhereJob(filter)}`);
            var tryDoc = () => self.pool.query(`DELETE FROM \`plugin_scripttask\` WHERE ${self._buildWhereDoc(filter)}`);

            if (isJob) return tryJob().then(res => resolve({ deletedCount: res.affectedRows })).catch(reject);
            if (isDoc) return tryDoc().then(res => resolve({ deletedCount: res.affectedRows })).catch(reject);

            var count = 0;
            tryDoc().catch(err => { if (err.errno === 1054) return { affectedRows: 0 }; throw err; })
                .then(res => {
                    count += res.affectedRows;
                    return tryJob().catch(err => { if (err.errno === 1054) return { affectedRows: 0 }; throw err; });
                })
                .then(res => {
                    count += res.affectedRows;
                    resolve({ deletedCount: count });
                })
                .catch(reject);
        });
    }

    updateOne(filter, update, options) {
        var self = this;
        if (options == null) options = {};
        if (options.upsert == null) options.upsert = false;

        return new Promise(function (resolve, reject) {
            var tryUpdateJob = () => {
                var wJ = self._buildWhereJob(filter);
                return self.pool.query(`SELECT \`id\` FROM \`plugin_scripttask_jobs\` WHERE ${wJ} LIMIT 1`)
                    .then(rows => {
                        if (rows.length === 0) return { matchedCount: 0, modifiedCount: 0 };
                        var updates = [], vals = [];
                        var src = update.$set ? update.$set : update;
                        for (var k in src) {
                            if (k === '_id' || k === 'id') continue;
                            updates.push(`${self._escapeCol(k)} = ?`);
                            var v = src[k];
                            if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
                            vals.push(v);
                        }
                        if (updates.length > 0) {
                            vals.push(rows[0].id);
                            return self.pool.query(`UPDATE \`plugin_scripttask_jobs\` SET ${updates.join(', ')} WHERE \`id\` = ?`, vals)
                                .then(() => ({ matchedCount: 1, modifiedCount: 1, upsertedId: rows[0].id }));
                        } else {
                            return { matchedCount: 1, modifiedCount: 0 };
                        }
                    });
            };

            var tryUpdateDoc = () => {
                var wD = self._buildWhereDoc(filter);
                return self.pool.query(`SELECT \`id\`, \`doc\` FROM \`plugin_scripttask\` WHERE ${wD} LIMIT 1`)
                    .then(rows => {
                        if (rows.length === 0) return { matchedCount: 0, modifiedCount: 0 };
                        var id = rows[0].id;
                        var doc = typeof rows[0].doc === 'string' ? JSON.parse(rows[0].doc) : rows[0].doc;
                        var modified = false;
                        if (update.$set) {
                            for (var k in update.$set) doc[k] = update.$set[k];
                            modified = true;
                        } else {
                            doc = { ...doc, ...update };
                            if (!doc._id) doc._id = id;
                            modified = true;
                        }
                        if (modified) {
                            return self.pool.query("UPDATE \`plugin_scripttask\` SET \`doc\` = ? WHERE \`id\` = ?", [JSON.stringify(doc), id])
                                .then(() => ({ matchedCount: 1, modifiedCount: 1, upsertedId: id }));
                        } else {
                            return { matchedCount: 1, modifiedCount: 0 };
                        }
                    });
            };

            var isJob = filter.type === 'job';
            var isDoc = filter.type && filter.type !== 'job';

            if (isJob) return tryUpdateJob().then(res => {
                if (res.matchedCount === 0 && options.upsert) {
                    var newDoc = { ...filter, ...(update.$set || {}) };
                    return self.insertOne(newDoc).then(r => ({ matchedCount: 0, modifiedCount: 1, upsertedId: r.insertedId }));
                }
                resolve(res);
            }).catch(reject);

            if (isDoc) return tryUpdateDoc().then(res => {
                if (res.matchedCount === 0 && options.upsert) {
                    var newDoc = { ...filter, ...(update.$set || {}) };
                    return self.insertOne(newDoc).then(r => ({ matchedCount: 0, modifiedCount: 1, upsertedId: r.insertedId }));
                }
                resolve(res);
            }).catch(reject);

            tryUpdateDoc().then(res => {
                if (res.matchedCount > 0) return resolve(res);
                return tryUpdateJob().then(res2 => {
                    if (res2.matchedCount === 0 && options.upsert) {
                        var newDoc = { ...filter, ...(update.$set || {}) }; // fallback to insert doc
                        return self.insertOne(newDoc).then(r => resolve({ matchedCount: 0, modifiedCount: 1, upsertedId: r.insertedId }));
                    }
                    resolve(res2);
                });
            }).catch(reject);
        });
    }

    updateMany(filter, update, options) {
        var self = this;
        if (options == null) options = {};
        if (options.upsert == null) options.upsert = false;

        return new Promise(function (resolve, reject) {
            var tryUpdateJob = () => {
                var wJ = self._buildWhereJob(filter);
                return self.pool.query(`SELECT \`id\` FROM \`plugin_scripttask_jobs\` WHERE ${wJ}`)
                    .then(rows => {
                        if (rows.length === 0) return { matchedCount: 0, modifiedCount: 0 };
                        var updatesQ = [], vals = [];
                        var src = update.$set ? update.$set : update;
                        for (var k in src) {
                            if (k === '_id' || k === 'id') continue;
                            updatesQ.push(`${self._escapeCol(k)} = ?`);
                            var v = src[k];
                            if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
                            vals.push(v);
                        }
                        if (updatesQ.length > 0) {
                            var proms = rows.map(r => self.pool.query(`UPDATE \`plugin_scripttask_jobs\` SET ${updatesQ.join(', ')} WHERE \`id\` = ?`, [...vals, r.id]));
                            return Promise.all(proms).then(() => ({ matchedCount: rows.length, modifiedCount: rows.length }));
                        } else {
                            return { matchedCount: rows.length, modifiedCount: 0 };
                        }
                    });
            };

            var tryUpdateDoc = () => {
                var wD = self._buildWhereDoc(filter);
                return self.pool.query(`SELECT \`id\`, \`doc\` FROM \`plugin_scripttask\` WHERE ${wD}`)
                    .then(rows => {
                        if (rows.length === 0) return { matchedCount: 0, modifiedCount: 0 };
                        var proms = rows.map(r => {
                            var doc = typeof r.doc === 'string' ? JSON.parse(r.doc) : r.doc;
                            if (update.$set) {
                                for (var k in update.$set) doc[k] = update.$set[k];
                            } else {
                                doc = { ...doc, ...update };
                                if (!doc._id) doc._id = r.id;
                            }
                            return self.pool.query("UPDATE \`plugin_scripttask\` SET \`doc\` = ? WHERE \`id\` = ?", [JSON.stringify(doc), r.id]);
                        });
                        return Promise.all(proms).then(() => ({ matchedCount: rows.length, modifiedCount: rows.length }));
                    });
            };

            var isJob = filter.type === 'job';
            if (isJob) return tryUpdateJob().then(res => resolve(res)).catch(reject);
            return tryUpdateDoc().then(res => resolve(res)).catch(reject);
        });
    }

    indexes(callback) { if (callback != null && typeof callback == 'function') callback(null, []); }
    dropIndexes(callback) { if (callback != null && typeof callback == 'function') callback(null); }
    createIndex(args, options) { }
}

module.exports = NEMariaDB;
