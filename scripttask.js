/**
* @description MeshCentral ScriptTask
* @author Ryan Blenis
* @copyright
* @license Apache-2.0
*/

"use strict";

module.exports.scripttask = function (parent) {
    var obj = {};
    obj.parent = parent;
    obj.meshServer = parent.parent;
    obj.db = null;
    obj.intervalTimer = null;
    obj.debug = obj.meshServer.debug;
    obj.VIEWS = __dirname + '/views/';
    obj.exports = [
        'onDeviceRefreshEnd',
        'resizeContent',
        'historyData',
        'variableData',
        'malix_triggerOption'
    ];

    obj.malix_triggerOption = function(selectElem) {
        selectElem.options.add(new Option("ScriptTask - Run Script", "scripttask_runscript"));
    }
    obj.malix_triggerFields_scripttask_runscript = function() {

    }
    obj.resetQueueTimer = function() {
        clearTimeout(obj.intervalTimer);
        obj.intervalTimer = setInterval(obj.queueRun, 1 * 60 * 1000); // every minute
    };

    obj.server_startup = function() {
        obj.meshServer.pluginHandler.scripttask_db = require (__dirname + '/db.js').CreateDB(obj.meshServer);
        obj.db = obj.meshServer.pluginHandler.scripttask_db;
        obj.resetQueueTimer();
    };

    obj.onDeviceRefreshEnd = function() {
        pluginHandler.registerPluginTab({
            tabTitle: 'ScriptTask',
            tabId: 'pluginScriptTask'
        });
        QA('pluginScriptTask', '<iframe id="pluginIframeScriptTask" style="width: 100%; height: 700px; overflow: auto" scrolling="yes" frameBorder=0 src="/pluginadmin.ashx?pin=scripttask&user=1" />');
    };
    // may not be needed, saving for later. Can be called to resize iFrame
    obj.resizeContent = function() {
        var iFrame = document.getElementById('pluginIframeScriptTask');
        var newHeight = 700;
        //var sHeight = iFrame.contentWindow.document.body.scrollHeight;
        //if (sHeight > newHeight) newHeight = sHeight;
        //if (newHeight > 1600) newHeight = 1600;
        iFrame.style.height = newHeight + 'px';
    };

    obj.queueRun = async function() {
        var onlineAgents = Object.keys(obj.meshServer.webserver.wsagents);
        //obj.debug('ScriptTask', 'Queue Running', Date().toLocaleString(), 'Online agents: ', onlineAgents);

        obj.db.getPendingJobs(onlineAgents)
        .then((jobs) => {
            if (jobs.length == 0) return;
            //@TODO check for a large number and use taskLimiter to queue the jobs
            jobs.forEach(job => {

                obj.db.get(job.scriptId)
                .then(async (script) => {
                    script = script[0];
                    var foundVars = script.content.match(/#(.*?)#/g);
                    var replaceVars = {};
                    if (foundVars != null && foundVars.length > 0) {
                        var foundVarNames = [];
                        foundVars.forEach(fv => {
                            foundVarNames.push(fv.replace(/^#+|#+$/g, ''));
                        });

                        var limiters = {
                            scriptId: job.scriptId,
                            nodeId: job.node,
                            meshId: obj.meshServer.webserver.wsagents[job.node]['dbMeshKey'],
                            names: foundVarNames
                        };
                        var finvals = await obj.db.getVariables(limiters);
                        var ordering = { 'global': 0, 'script': 1, 'mesh': 2, 'node': 3 }
                        finvals.sort((a, b) => {
                            return (ordering[a.scope] - ordering[b.scope])
                              || a.name.localeCompare(b.name);
                        });
                        finvals.forEach(fv => {
                            replaceVars[fv.name] = fv.value;
                        });
                        replaceVars['GBL:meshId'] = obj.meshServer.webserver.wsagents[job.node]['dbMeshKey'];
                        replaceVars['GBL:nodeId'] = job.node;
                        console.log('FV IS', finvals);
                        console.log('RV IS', replaceVars);
                    }
                    var dispatchTime = Math.floor(new Date() / 1000);
                    var jObj = {
                        action: 'plugin',
                        plugin: 'scripttask',
                        pluginaction: 'triggerJob',
                        jobId: job._id,
                        scriptId: job.scriptId,
                        replaceVars: replaceVars,
                        scriptHash: script.contentHash,
                        dispatchTime: dispatchTime
                    };
                    //obj.debug('ScriptTask', 'Sending job to agent');
                    try {
                        obj.meshServer.webserver.wsagents[job.node].send(JSON.stringify(jObj));
                        obj.db.update(job._id, { dispatchTime: dispatchTime });
                    } catch (e) { }
                })
                .catch(e => console.log('PLUGIN: ScriptTask: Could not dispatch job.', e));
            });
        })
        .then(() => {
            obj.makeJobsFromSchedules();
            obj.cleanHistory();
        })
        .catch(e => { console.log('PLUGIN: ScriptTask: Queue Run Error: ', e); });
    };

    obj.cleanHistory = function() {
        if (Math.round(Math.random() * 100) == 99) {
            //obj.debug('Plugin', 'ScriptTask', 'Running history cleanup');
            obj.db.deleteOldHistory();
        }
    };

    obj.downloadFile = function(req, res, user) {
        var id = req.query.dl;
        obj.db.get(id)
        .then(found => {
          if (found.length != 1) { res.sendStatus(401); return; }
          var file = found[0];
          res.setHeader('Content-disposition', 'attachment; filename=' + file.name);
          res.setHeader('Content-type', 'text/plain');
          //var fs = require('fs');
          res.send(file.content);
        });
    };

    obj.updateFrontEnd = async function(ids){
        if (ids.scriptId != null) {
            var scriptHistory = null;
            obj.db.getJobScriptHistory(ids.scriptId)
            .then((sh) => {
                scriptHistory = sh;
                return obj.db.getJobSchedulesForScript(ids.scriptId);
            })
            .then((scriptSchedule) => {
                var targets = ['*', 'server-users'];
                obj.meshServer.DispatchEvent(targets, obj, { nolog: true, action: 'plugin', plugin: 'scripttask', pluginaction: 'historyData', scriptId: ids.scriptId, nodeId: null, scriptHistory: scriptHistory, nodeHistory: null, scriptSchedule: scriptSchedule });
            });
        }
        if (ids.nodeId != null) {
            var nodeHistory = null;
            obj.db.getJobNodeHistory(ids.nodeId)
            .then((nh) => {
                nodeHistory = nh;
                return obj.db.getJobSchedulesForNode(ids.nodeId);
            })
            .then((nodeSchedule) => {
                var targets = ['*', 'server-users'];
                obj.meshServer.DispatchEvent(targets, obj, { nolog: true, action: 'plugin', plugin: 'scripttask', pluginaction: 'historyData', scriptId: null, nodeId: ids.nodeId, scriptHistory: null, nodeHistory: nodeHistory, nodeSchedule: nodeSchedule });
            });
        }
        if (ids.tree === true) {
            obj.db.getScriptTree()
            .then((tree) => {
                var targets = ['*', 'server-users'];
                obj.meshServer.DispatchEvent(targets, obj, { nolog: true, action: 'plugin', plugin: 'scripttask', pluginaction: 'newScriptTree', tree: tree });
            });
        }
        if (ids.variables === true) {
            obj.db.getVariables()
            .then((vars) => {
                var targets = ['*', 'server-users'];
                obj.meshServer.DispatchEvent(targets, obj, { nolog: true, action: 'plugin', plugin: 'scripttask', pluginaction: 'variableData', vars: vars });
            });
        }
    };

    obj.handleAdminReq = function(req, res, user) {
        if ((user.siteadmin & 0xFFFFFFFF) == 1 && req.query.admin == 1)
        {
            // admin wants admin, grant
            var vars = {};
            res.render(obj.VIEWS + 'admin', vars);
            return;
        } else if (req.query.admin == 1 && (user.siteadmin & 0xFFFFFFFF) == 0) {
            // regular user wants admin
            res.sendStatus(401);
            return;
        } else if (req.query.user == 1) {
            // regular user wants regular access, grant
            if (req.query.dl != null) return obj.downloadFile(req, res, user);
            var vars = {};

            if (req.query.edit == 1) { // edit script
                if (req.query.id == null) return res.sendStatus(401);
                obj.db.get(req.query.id)
                .then((scripts) => {
                    if (scripts[0].filetype == 'proc') {
                        vars.procData = JSON.stringify(scripts[0]);
                        res.render(obj.VIEWS + 'procedit', vars);
                    } else {
                        vars.scriptData = JSON.stringify(scripts[0]);
                        res.render(obj.VIEWS + 'scriptedit', vars);
                    }
                });
                return;
            } else if (req.query.schedule == 1) {
                var vars = {};
                res.render(obj.VIEWS + 'schedule', vars);
                return;
            }
            // default user view (tree)
            vars.scriptTree = 'null';
            obj.db.getScriptTree()
            .then(tree => {
              vars.scriptTree = JSON.stringify(tree);
              res.render(obj.VIEWS + 'user', vars);
            });
            return;
        } else if (req.query.include == 1) {
            switch (req.query.path.split('/').pop().split('.').pop()) {
                case 'css':     res.contentType('text/css'); break;
                case 'js':      res.contentType('text/javascript'); break;
            }
            res.sendFile(__dirname + '/includes/' + req.query.path); // don't freak out. Express covers any path issues.
            return;
        }
        res.sendStatus(401);
        return;
    };

    obj.historyData = function (message) {
        if (typeof pluginHandler.scripttask.loadHistory == 'function') pluginHandler.scripttask.loadHistory(message);
        if (typeof pluginHandler.scripttask.loadSchedule == 'function') pluginHandler.scripttask.loadSchedule(message);
    };

    obj.variableData = function (message) {
        if (typeof pluginHandler.scripttask.loadVariables == 'function') pluginHandler.scripttask.loadVariables(message);
    };

    obj.determineNextJobTime = function(s) {
        var nextTime = null;
        var nowTime = Math.floor(new Date() / 1000);

        // special case: we've reached the end of our run
        if (s.endAt !== null && s.endAt <= nowTime) {
            return nextTime;
        }

        switch (s.recur) {
            case 'once':
                if (s.nextRun == null) nextTime = s.startAt;
                else nextTime = null;
            break;
            case 'minutes':
                /*var lRun = s.nextRun || nowTime;
                if (lRun == null) lRun = nowTime;
                nextTime = lRun + (s.interval * 60);
                if (s.startAt > nextTime) nextTime = s.startAt;*/
                if (s.nextRun == null) { // hasn't run yet, set to start time
                    nextTime = s.startAt;
                    break;
                }
                nextTime = s.nextRun + (s.interval * 60);
                // this prevents "catch-up" tasks being scheduled if an endpoint is offline for a long period of time
                // e.g. always make sure the next scheduled time is relevant to the scheduled interval, but in the future
                if (nextTime < nowTime) {
                    // initially I was worried about this causing event loop lockups
                    // if there was a long enough time gap. Testing over 50 years of backlog for a 3 min interval
                    // still ran under a fraction of a second. Safe to say this approach is safe! (~8.5 million times)
                    while (nextTime < nowTime) {
                        nextTime = nextTime + (s.interval * 60);
                    }
                }
                if (s.startAt > nextTime) nextTime = s.startAt;
            break;
            case 'hourly':
                if (s.nextRun == null) { // hasn't run yet, set to start time
                    nextTime = s.startAt;
                    break;
                }
                nextTime = s.nextRun + (s.interval * 60 * 60);
                if (nextTime < nowTime) {
                    while (nextTime < nowTime) {
                        nextTime = nextTime + (s.interval * 60 * 60);
                    }
                }
                if (s.startAt > nextTime) nextTime = s.startAt;
            break;
            case 'daily':
                if (s.nextRun == null) { // hasn't run yet, set to start time
                    nextTime = s.startAt;
                    break;
                }
                nextTime = s.nextRun + (s.interval * 60 * 60 * 24);
                if (nextTime < nowTime) {
                    while (nextTime < nowTime) {
                        nextTime = nextTime + (s.interval * 60 * 60 * 24);
                    }
                }
                if (s.startAt > nextTime) nextTime = s.startAt;
            break;
            case 'weekly':
                var tempDate = new Date();
                var nowDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());

                if (s.daysOfWeek.length == 0) {
                    nextTime = null;
                    break;
                }
                s.daysOfWeek = s.daysOfWeek.map(el => Number(el));
                var baseTime = s.startAt;
                //console.log('dow is ', s.daysOfWeek);
                var lastDayOfWeek = Math.max(...s.daysOfWeek);
                var startX = 0;
                //console.log('ldow is ', lastDayOfWeek);
                if (s.nextRun != null) {
                    baseTime = s.nextRun;
                    //console.log('basetime 2: ', baseTime);
                    if (nowDate.getDay() == lastDayOfWeek) {
                        baseTime = baseTime + ( s.interval * 604800 ) - (lastDayOfWeek * 86400);
                        //console.log('basetime 3: ', baseTime);
                    }
                    startX = 0;
                } else if (s.startAt < nowTime) {
                    baseTime = Math.floor(nowDate.getTime() / 1000);
                    //console.log('basetime 4: ', baseTime);
                }
                //console.log('startX is: ', startX);
                //var secondsFromMidnight = nowTimeDate.getSeconds() + (nowTimeDate.getMinutes() * 60) + (nowTimeDate.getHours() * 60 * 60);
                //console.log('seconds from midnight: ', secondsFromMidnight);
                //var dBaseTime = new Date(0); dBaseTime.setUTCSeconds(baseTime);
                //var dMidnight = new Date(dBaseTime.getFullYear(), dBaseTime.getMonth(), dBaseTime.getDate());
                //baseTime = Math.floor(dMidnight.getTime() / 1000);
                for (var x = startX; x <= 7; x++){
                    var checkDate = baseTime + (86400 * x);
                    var d = new Date(0); d.setUTCSeconds(checkDate);
                    var dm = new Date(d.getFullYear(), d.getMonth(), d.getDate());

                    console.log('testing date: ', dm.toLocaleString()); // dMidnight.toLocaleString());
                    //console.log('if break check :', (s.daysOfWeek.indexOf(d.getDay()) !== -1 && checkDate >= nowTime));
                    //console.log('checkDate vs nowTime: ', (checkDate - nowTime), ' if positive, nowTime is less than checkDate');
                    if (s.nextRun == null && s.daysOfWeek.indexOf(dm.getDay()) !== -1 && dm.getTime() >= nowDate.getTime()) break;
                    if (s.daysOfWeek.indexOf(dm.getDay()) !== -1 && dm.getTime() > nowDate.getTime()) break;
                    //if (s.daysOfWeek.indexOf(d.getDay()) !== -1 && Math.floor(d.getTime() / 1000) >= nowTime) break;
                }
                var sa = new Date(0); sa.setUTCSeconds(s.startAt);
                var sad = new Date(sa.getFullYear(), sa.getMonth(), sa.getDate());
                var diff = (sa.getTime() - sad.getTime()) / 1000;
                nextTime = Math.floor(dm.getTime() / 1000) + diff;
                //console.log('next schedule is ' + d.toLocaleString());
            break;
            default:
                nextTime = null;
            break;
        }

        if (s.endAt != null && nextTime > s.endAt) nextTime = null; // if the next time reaches the bound of the endAt time, nullify

        return nextTime;
    };

    obj.makeJobsFromSchedules = function(scheduleId) {
        return obj.db.getSchedulesDueForJob(scheduleId)
            .then(schedules => {
                if (schedules.length > 0) {
                    console.log('PLUGIN DEBUG: Found ' + schedules.length + ' schedules due.');

                    schedules.forEach(s => {
                        var nextJobTime = obj.determineNextJobTime(s);
                        var executeImmediatelyTime = nextJobTime ;
                        if (nextJobTime === null) {
                            obj.db.removeJobSchedule(s._id);
                        } else {
                            obj.db.get(s.scriptId)
                                .then(scripts => {
                                    if (!scripts || scripts.length === 0) return;
                                    var scriptName = scripts[0].name;
                                    if (s.node === 'all') {
                                        obj.meshServer.db.GetAllType('node', function(err, docs) {
                                            if (docs && docs.length > 0) {
                                                createJobsForList(docs, s, scriptName, executeImmediatelyTime, nextJobTime);
                                            }
                                        });
                                    }

                                    else if (typeof s.node === 'string' && s.node.startsWith('mesh/')) {
                                        console.log('PLUGIN DEBUG: Schedule is for a MESH (Group):', s.node);
                                        obj.meshServer.db.GetAllType('node', function(err, docs) {
                                            if (docs && docs.length > 0) {
                                                console.log(docs)
                                                var meshNodes = docs.filter(function(d) { return d.meshid === s.node; });

                                                console.log('PLUGIN DEBUG: Nodes found in this group:', meshNodes.length);

                                                if (meshNodes.length > 0) {
                                                    createJobsForList(meshNodes, s, scriptName, executeImmediatelyTime, nextJobTime);
                                                } else {

                                                    obj.db.update(s._id, { nextRun: nextJobTime });
                                                }
                                            }
                                        });
                                    }

                                    else {
                                        return obj.db.getIncompleteJobsForSchedule(s._id)
                                            .then((jobs) => {
                                                if (jobs.length > 0) { return Promise.resolve(); }
                                                else {
                                                    return obj.db.addJob({
                                                        scriptId: s.scriptId,
                                                        scriptName: scriptName,
                                                        node: s.node,
                                                        runBy: s.scheduledBy,
                                                        dontQueueUntil: executeImmediatelyTime,
                                                        jobSchedule: s._id
                                                    });
                                                }
                                            })
                                            .then(() => {
                                                return obj.db.update(s._id, { nextRun: nextJobTime });
                                            })
                                            .then(() => {
                                                obj.updateFrontEnd( { scriptId: s.scriptId, nodeId: s.node } );
                                            });
                                    }
                                })
                                .catch((e) => { console.log('PLUGIN Error:', e); });
                        }
                    });
                }
            });
    };


    function createJobsForList(nodeList, schedule, scriptName, execTime, nextTime) {
        var jobProms = [];
        nodeList.forEach(function(device) {
            jobProms.push(obj.db.addJob({
                scriptId: schedule.scriptId,
                scriptName: scriptName,
                node: device._id,
                runBy: schedule.scheduledBy,
                dontQueueUntil: execTime,
                jobSchedule: schedule._id
            }));
        });

        Promise.all(jobProms).then(() => {
            console.log('PLUGIN DEBUG: Jobs created for list. Updating next run.');
            obj.db.update(schedule._id, { nextRun: nextTime });
            obj.updateFrontEnd({ scriptId: schedule.scriptId });
        });
    }

    obj.deleteElement = function (command) {
        var delObj = null;
        obj.db.get(command.id)
        .then((found) => {
          var file = found[0];
          delObj = {...{}, ...found[0]};
          return file;
        })
        .then((file) => {
          if (file.type == 'folder') return obj.db.deleteByPath(file.path); //@TODO delete schedules for scripts within folders
          if (file.type == 'script') return obj.db.deleteSchedulesForScript(file._id);
          if (file.type == 'jobSchedule') return obj.db.deletePendingJobsForSchedule(file._id);
        })
        .then(() => {
          return obj.db.delete(command.id)
        })
        .then(() => {
          var updateObj = { tree: true };
          if (delObj.type == 'jobSchedule') {
              updateObj.scriptId = delObj.scriptId;
              updateObj.nodeId = delObj.node;
          }
          return obj.updateFrontEnd( updateObj );
        })
        .catch(e => { console.log('PLUGIN: ScriptTask: Error deleting ', e.stack); });
    };

    obj.serveraction = function(command, myparent, grandparent) {
        switch (command.pluginaction) {
            case 'addScript':
                obj.db.addScript(command.name, command.content, command.path, command.filetype)
                .then(() => {
                    obj.updateFrontEnd( { tree: true } );
                });
            break;
            case 'new':
                var parent_path = '';
                var new_path = '';
                obj.db.get(command.parent_id)
                .then(found => {
                  if (found.length > 0) {
                      var file = found[0];
                      parent_path = file.path;
                  } else {
                      parent_path = 'Shared';
                  }
                })
                .then(() => {
                    obj.db.addScript(command.name, '', parent_path, command.filetype)
                })
                .then(() => {
                    obj.updateFrontEnd( { tree: true } );
                });
            break;
            case 'rename':
              obj.db.get(command.id)
              .then((docs) => {
                  var doc = docs[0];
                  if (doc.type == 'folder') {
                      console.log('old', doc.path, 'new', doc.path.replace(doc.path, command.name));
                      return obj.db.update(command.id, { path: doc.path.replace(doc.name, command.name) })
                      .then(() => { // update sub-items
                          return obj.db.getByPath(doc.path)
                      })
                      .then((found) => {
                          if (found.length > 0) {
                            var proms = [];
                            found.forEach(f => {
                              proms.push(obj.db.update(f._id, { path: doc.path.replace(doc.name, command.name) } ));
                            })
                            return Promise.all(proms);
                          }
                      })
                  } else {
                      return Promise.resolve();
                  }
              })
              .then(() => {
                  obj.db.update(command.id, { name: command.name })
              })
              .then(() => {
                  return obj.db.updateScriptJobName(command.id, command.name);
              })
              .then(() => {
                  obj.updateFrontEnd( { scriptId: command.id, nodeId: command.currentNodeId, tree: true } );
              });
            break;
            case 'move':
              var toPath = null, fromPath = null, parentType = null;
              obj.db.get(command.to)
              .then(found => { // get target data
                  if (found.length > 0) {
                    var file = found[0];
                    toPath = file.path;
                  } else throw Error('Target destination not found');
              })
              .then(() => { // get item to be moved
                return obj.db.get(command.id);
              })
              .then((found) => { // set item to new location
                  var file = found[0];
                  if (file.type == 'folder') {
                    fromPath = file.path;
                    toPath += '/' + file.name;
                    parentType = 'folder';
                    if (file.name == 'Shared' && file.path == 'Shared') throw Error('Cannot move top level directory: Shared');
                  }
                  return obj.db.update(command.id, { path: toPath } );
              })
              .then(() => { // update sub-items
                  return obj.db.getByPath(fromPath)
              })
              .then((found) => {
                  if (found.length > 0) {
                    var proms = [];
                    found.forEach(f => {
                      proms.push(obj.db.update(f._id, { path: toPath } ));
                    })
                    return Promise.all(proms);
                  }
              })
              .then(() => {
                return obj.updateFrontEnd( { tree: true } );
              })
              .catch(e => { console.log('PLUGIN: ScriptTask: Error moving ', e.stack); });
            break;
            case 'newFolder':
              var parent_path = '';
              var new_path = '';

              obj.db.get(command.parent_id)
              .then(found => {
                if (found.length > 0) {
                    var file = found[0];
                    parent_path = file.path;
                } else {
                    parent_path = 'Shared';
                }
              })
              .then(() => {
                new_path = parent_path + '/' + command.name;
              })
              .then(() => {
                  return obj.db.addFolder(command.name, new_path);
              })
              .then(() => {
                return obj.updateFrontEnd( { tree: true } );
              })
              .catch(e => { console.log('PLUGIN: ScriptTask: Error creating new folder ', e.stack); });
            break;
            case 'delete':
              obj.deleteElement(command);
            break;
            case 'addScheduledJob':
                var sj = command.schedule;
                var sel = command.nodes;

                var sObj = {
                    scriptId: command.scriptId,
                    node: null,
                    scheduledBy: myparent.user.name,
                    recur: sj.recur,
                    interval: sj.interval,
                    daysOfWeek: sj.dayVals,
                    startAt: sj.startAt,
                    endAt: sj.endAt,
                    lastRun: null,
                    nextRun: null,
                    type: "jobSchedule"
                };

                var proms = [];


                if (sel === 'all') {

                    sObj.node = 'all';
                    proms.push(obj.db.addJobSchedule(sObj));
                }
                else if (Array.isArray(sel)) {

                    sel.forEach((s) => {
                        var nodeSched = {...sObj, node: s};
                        proms.push(obj.db.addJobSchedule(nodeSched));
                    });
                } else {

                    sObj.node = sel;
                    proms.push(obj.db.addJobSchedule(sObj));
                }


                Promise.all(proms)
                    .then(() => {
                        obj.makeJobsFromSchedules();
                        return Promise.resolve();
                    })
                    .catch(e => { console.log('PLUGIN: ScriptTask: Error adding schedules. The error was: ', e); });
                break;
            case 'runScript':
              var scriptId = command.scriptId;
              var sel = command.nodes;
              var proms = [];
              if (Array.isArray(sel)) {
                sel.forEach((s) => {
                  proms.push(obj.db.addJob( { scriptId: scriptId, node: s, runBy: myparent.user.name } ));
                });
              } else {
                proms.push(obj.db.addJob( { scriptId: scriptId, node: sel, runBy: myparent.user.name } ));
              }
              Promise.all(proms)
              .then(() => {
                  return obj.db.get(scriptId);
              })
              .then(scripts => {
                  return obj.db.updateScriptJobName(scriptId, scripts[0].name);
              })
              .then(() => {
                  obj.resetQueueTimer();
                  obj.queueRun();
                  obj.updateFrontEnd( { scriptId: scriptId, nodeId: command.currentNodeId } );
              });
            break;
            case 'getScript':
                //obj.debug('ScriptTask', 'getScript Triggered', JSON.stringify(command));
                obj.db.get(command.scriptId)
                .then(script => {
                    myparent.send(JSON.stringify({
                        action: 'plugin',
                        plugin: 'scripttask',
                        pluginaction: 'cacheScript',
                        nodeid: myparent.dbNodeKey,
                        rights: true,
                        sessionid: true,
                        script: script[0]
                    }));
                });
            break;
            case 'jobComplete':
                //obj.debug('ScriptTask', 'jobComplete Triggered', JSON.stringify(command));
                var jobNodeHistory = null, scriptHistory = null;
                var jobId = command.jobId, retVal = command.retVal, errVal = command.errVal, dispatchTime = command.dispatchTime;
                var completeTime = Math.floor(new Date() / 1000);
                obj.db.update(jobId, {
                    completeTime: completeTime,
                    returnVal: retVal,
                    errorVal: errVal,
                    dispatchTime: dispatchTime
                })
                .then(() => {
                    return obj.db.get(jobId)
                    .then(jobs => {
                        return Promise.resolve(jobs[0].jobSchedule);
                    })
                    .then(sId => {
                        if (sId == null) return Promise.resolve();
                        return obj.db.update(sId, { lastRun: completeTime } )
                        .then(() => {
                            obj.makeJobsFromSchedules(sId);
                        });
                    });
                })
                .then(() => {
                    obj.updateFrontEnd( { scriptId: command.scriptId, nodeId: myparent.dbNodeKey } );
                })
                .catch(e => { console.log('PLUGIN: ScriptTask: Failed to complete job. ', e); });
                // update front end by eventing
            break;
            case 'loadNodeHistory':
                obj.updateFrontEnd( { nodeId: command.nodeId } );
            break;
            case 'loadScriptHistory':
                obj.updateFrontEnd( { scriptId: command.scriptId } );
            break;
            case 'editScript':
                obj.db.update(command.scriptId, { type: command.scriptType, name: command.scriptName, content: command.scriptContent })
                .then(() => {
                    obj.updateFrontEnd( { scriptId: command.scriptId, tree: true } );
                });
            break;
            case 'clearAllPendingJobs':
                obj.db.deletePendingJobsForNode(myparent.dbNodeKey);
            break;
            case 'loadVariables':
                obj.updateFrontEnd( { variables: true } );
            break;
            case 'newVar':
                obj.db.addVariable(command.name, command.scope, command.scopeTarget, command.value)
                .then(() => {
                    obj.updateFrontEnd( { variables: true } );
                })
            break;
            case 'editVar':
                obj.db.update(command.id, {
                    name: command.name,
                    scope: command.scope,
                    scopeTarget: command.scopeTarget,
                    value: command.value
                })
                .then(() => {
                    obj.updateFrontEnd( { variables: true } );
                })
            break;
            case 'deleteVar':
                obj.db.delete(command.id)
                .then(() => {
                    obj.updateFrontEnd( { variables: true } );
                })
            break;
            default:
                console.log('PLUGIN: ScriptTask: unknown action');
            break;
        }
    };

    return obj;
}
