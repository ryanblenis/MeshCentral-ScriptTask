/** 
* @description MeshCentral-ScriptTask database module
* @author Ryan Blenis
* @copyright Ryan Blenis 2019
* @license Apache-2.0
*/

"use strict";
require('promise');

module.exports.CreateDB = function(meshserver) {
    var obj = {};
    obj.dbVersion = 1;
    const expireHistoryLogSeconds = (60 * 60 * 24 * 30); // 30 days
    if (meshserver.args.mongodb) { // use MongDB
      require('mongodb').MongoClient.connect(meshserver.args.mongodb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
          if (err != null) { console.log("Unable to connect to database: " + err); process.exit(); return; }
          
          var dbname = 'meshcentral';
          if (meshserver.args.mongodbname) { dbname = meshserver.args.mongodbname; }
          const db = client.db(dbname);
          
          obj.scriptFile = db.collection('plugin_scripttask');
          obj.scriptFile.indexes(function (err, indexes) {
              // Check if we need to reset indexes
              var indexesByName = {}, indexCount = 0;
              for (var i in indexes) { indexesByName[indexes[i].name] = indexes[i]; indexCount++; }
              if ((indexCount != 6) || (indexesByName['ScriptName1'] == null) || (indexesByName['ScriptPath1'] == null) || (indexesByName['JobTime1'] == null) || (indexesByName['JobNode1'] == null) || (indexesByName['JobScriptID1'] == null)) {
                  // Reset all indexes
                  console.log('Resetting plugin (ScriptTask) indexes...');
                  obj.scriptFile.dropIndexes(function (err) {
                      obj.scriptFile.createIndex({ name: 1 }, { name: 'ScriptName1' });
                      obj.scriptFile.createIndex({ path: 1 }, { name: 'ScriptPath1' });
                      obj.scriptFile.createIndex({ queueTime: 1 }, { name: 'JobTime1' });
                      obj.scriptFile.createIndex({ node: 1 }, { name: 'JobNode1' });
                      obj.scriptFile.createIndex({ scriptId: 1 }, { name: 'JobScriptID1' });
                  }); 
              }
          });
          
          obj.updateDBVersion = function(new_version) {
            return obj.scriptFile.updateOne({type: "db_version"}, { $set: {version: new_version} }, {upsert: true});
          };
          
          obj.getDBVersion = function() {
              return new Promise(function(resolve, reject) {
                  obj.scriptFile.find( { type: "db_version" } ).project( { _id: 0, version: 1 } ).toArray(function(err, vers){
                      if (vers.length == 0) resolve(1);
                      else resolve(vers[0]['version']);
                  });
              });
          };
          
          obj.addScript = function(name, content, path, filetype) {
              if (path == null) path = "Shared"
              var sObj = { 
                  type: 'script',
                  path: path,
                  name: name,
                  content: content.trim(),
                  contentHash: require('crypto').createHash('sha384').update(content).digest('hex'),
                  filetype: filetype
              };
              return obj.scriptFile.insertOne(sObj);
          };
          
          obj.addFolder = function(name, path) {
              var sObj = { 
                  type: 'folder',
                  path: path,
                  name: name
              };
              return obj.scriptFile.insertOne(sObj);
          };
          
          obj.getScriptTree = function() {
              return obj.scriptFile.find( 
                  { type: 
                      { $in: [ 'script', 'folder' ] } 
                  }
              ).sort( 
                  { path: 1, type: 1, name: 1 } 
              ).project( 
                  { name: 1, path: 1, type: 1, filetype: 1 } 
              ).toArray();
          };
          
          obj.update = function(id, args) {
              id = require('mongodb').ObjectID(id);
              if (args.type == 'script' && args.content !== null) args.contentHash = require('crypto').createHash('sha384').update(args.content).digest('hex');
              return obj.scriptFile.updateOne( { _id: id }, { $set: args } );
          };
          obj.delete = function(id) {
              id = require('mongodb').ObjectID(id);
              return obj.scriptFile.deleteOne( { _id: id } );
          };
          obj.deleteByPath = function(path) {
            return obj.scriptFile.deleteMany( { path: path, type: { $in: ['script', 'folder'] } } );
          };
          obj.deleteSchedulesForScript = function(id) {
              id = require('mongodb').ObjectID(id);
              return obj.scriptFile.deleteMany( { type: 'jobSchedule', scriptId: id } );  
          };
          obj.getByPath = function(path) {
            return obj.scriptFile.find( { type: { $in: [ 'script', 'folder' ] }, path: path }).toArray();
          };
          obj.get = function(id) {
              if (id == null || id == 'null') return new Promise(function(resolve, reject) { resolve([]); });
              //if (require('mongodb').ObjectID.isValid(id) === false) 
              id = require('mongodb').ObjectID(id);
              return obj.scriptFile.find( { _id: id } ).toArray();
          };
          obj.addJob = function(passedObj) {
            var nowTime = Math.floor(new Date() / 1000);
            var defaultObj = { 
                type: 'job',
                queueTime: nowTime,
                dontQueueUntil: nowTime,
                dispatchTime: null,
                completeTime: null,
                node: null,
                scriptId: null,
                scriptName: null, // in case the original reference is deleted in the future
                replaceVars: null,
                returnVal: null,
                errorVal: null,
                returnAct: null,
                runBy: null,
                jobSchedule: null
            };
            var jObj = {...defaultObj, ...passedObj};
            
            if (jObj.node == null || jObj.scriptId == null) { console.log('PLUGIN: SciptTask: Could not add job'); return false; }
            
            return obj.scriptFile.insertOne(jObj);
          };
          obj.addJobSchedule = function(schedObj) {
              schedObj.type = 'jobSchedule';
              if (schedObj.node == null || schedObj.scriptId == null) { console.log('PLUGIN: SciptTask: Could not add job schedule'); return false; }
              return obj.scriptFile.insertOne(schedObj);
          };
          obj.removeJobSchedule = function (id) {
              return obj.delete(id);
          };
          obj.getSchedulesDueForJob = function(scheduleId) {
              var nowTime = Math.floor(new Date() / 1000);
              var scheduleIdLimiter = {};
              if (scheduleId != null) {
                  scheduleIdLimiter._id = scheduleId;
              }
              return obj.scriptFile.find( { 
                  type: 'jobSchedule',
                  // startAt: { $gte: nowTime },
                  $or: [
                      { endAt: null },
                      { endAt: { $lte: nowTime } }
                  ],
                  $or: [
                      { nextRun: null }, 
                      { nextRun: { $lte: (nowTime + 60) } } // check a minute into the future
                  ],
                  ...scheduleIdLimiter
              }).toArray();
          };
          obj.getPendingJobs = function(nodeScope) {
            if (nodeScope == null || !Array.isArray(nodeScope)) {
              return false;
            }
            // return jobs that has online nodes and queue time requirements have been met
            return obj.scriptFile.find( { 
                type: 'job', 
                node: { $in: nodeScope },
                completeTime: null,
                //dispatchTime: null,
                $or: [
                    { dontQueueUntil: null }, 
                    { dontQueueUntil: { $lte: Math.floor(new Date() / 1000) } }
                ]
            }).toArray();
          };
          obj.getJobNodeHistory = function(nodeId) {
              return obj.scriptFile.find( { 
                  type: 'job', 
                  node: nodeId,
              }).sort({ queueTime: -1 }).limit(200).toArray();
          };
          obj.getJobScriptHistory = function(scriptId) {
              return obj.scriptFile.find( { 
                  type: 'job', 
                  scriptId: scriptId,
              }).sort({ completeTime: -1, queueTime: -1 }).limit(200).toArray();
          };
          obj.updateScriptJobName = function(scriptId, scriptName) {
              return obj.scriptFile.updateMany({ type: 'job', scriptId: scriptId }, { $set: { scriptName: scriptName } });    
          };
          obj.getJobSchedulesForScript = function(scriptId) {
              return obj.scriptFile.find( { type: 'jobSchedule', scriptId: scriptId } ).toArray();
          };
          obj.getJobSchedulesForNode = function (nodeId) {
              return obj.scriptFile.find( { type: 'jobSchedule', node: nodeId } ).toArray();
          };
          obj.getIncompleteJobsForSchedule = function (schedId) {
              return obj.scriptFile.find( { type: 'job', jobSchedule: schedId, completeTime: null } ).toArray();
          };
          obj.deletePendingJobsForSchedule = function (schedId) {
              return obj.scriptFile.deleteMany( { type: 'job', jobSchedule: schedId, completeTime: null } );
          };
          obj.deleteOldHistory = function() {
              var nowTime = Math.floor(new Date() / 1000);
              var oldTime = nowTime - (86400 * 90); // 90 days
              return obj.scriptFile.deleteMany( { type: 'job', completeTime: { $lte: oldTime } } );
          };
          obj.checkDefaults = function() {
              obj.scriptFile.find( { type: 'folder', name: 'Shared', path: 'Shared' } ).toArray()
              .then(found => {
                if (found.length == 0) obj.addFolder('Shared', 'Shared');
              });
          };
          
          obj.checkDefaults();
    });  
    } else { // use NeDb
        
    }
    
    return obj;
}