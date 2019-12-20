/** 
* @description MeshCentral ScriptTask plugin
* @author Ryan Blenis
* @copyright 
* @license Apache-2.0
*/

"use strict";
var mesh;
var obj = this;
var _sessionid;
var isWsconnection = false;
var wscon = null;
var db = require('SimpleDataStore').Shared();
var pendingDownload = [];
var debug_flag = false;
var runningJobs = [];
var runningJobPIDs = {};

var dbg = function(str) {
    if (debug_flag !== true) return;
    var fs = require('fs');
    var logStream = fs.createWriteStream('scripttask.txt', {'flags': 'a'});
    // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
    logStream.write('\n'+new Date().toLocaleString()+': '+ str);
    logStream.end('\n');
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function consoleaction(args, rights, sessionid, parent) {
    isWsconnection = false;
    wscon = parent;
    var _sessionid = sessionid;
    if (typeof args['_'] == 'undefined') {
      args['_'] = [];
      args['_'][1] = args.pluginaction;
      args['_'][2] = null;
      args['_'][3] = null;
      args['_'][4] = null;
      isWsconnection = true;
    }
    
    var fnname = args['_'][1];
    mesh = parent;
    
    switch (fnname) {
        case 'triggerJob':
            var jObj = { 
                jobId: args.jobId,
                scriptId: args.scriptId,
                replaceVars: args.replaceVars,
                scriptHash: args.scriptHash,
                dispatchTime: args.dispatchTime
            };
            //dbg('jObj args is ' + JSON.stringify(jObj));
            var sObj = getScriptFromCache(jObj.scriptId);
            //dbg('sobj = ' + JSON.stringify(sObj) + ', shash = ' + jObj.scriptHash);
            if (sObj == null || sObj.contentHash != jObj.scriptHash) {
                // get from the server, then run
                //dbg('Getting and caching script '+ jObj.scriptId);
                mesh.SendCommand({ 
                    "action": "plugin", 
                    "plugin": "scripttask",
                    "pluginaction": "getScript",
                    "scriptId": jObj.scriptId, 
                    "sessionid": _sessionid,
                    "tag": "console"
                });
                pendingDownload.push(jObj);
            } else {
                // ready to run
                runScript(sObj, jObj);
            }
        break;
        case 'cacheScript':
            var sObj = args.script;
            cacheScript(sObj);
            var setRun = [];
            if (pendingDownload.length) {
                pendingDownload.forEach(function(pd, k) { 
                    if (pd.scriptId == sObj._id && pd.scriptHash == sObj.contentHash) {
                        if (setRun.indexOf(pd) === -1) {
                            runScript(sObj, pd);
                            setRun.push(pd);
                        }
                        pendingDownload.remove(k);
                    }
                });
            }
        break;
        case 'clearCache':
            clearCache();
            return 'The script cache has been cleared';
        break;
        case 'getPendingJobs':
            var ret = '';
            if (pendingDownload.length == 0) return "No jobs pending script download";
            pendingDownload.forEach(function(pd, k) {     
                ret += 'Job ' + k + ': ' + 'JobID: ' + pd.jobId + ' ScriptID: ' + pd.scriptId;
            });
            return ret;
        break;
        default:
            dbg('Unknown action: '+ fnname + ' with data ' + JSON.stringify(args));
        break;
    }
}

function finalizeJob(job, retVal, errVal) {
    if (errVal != null && errVal.stack != null) errVal = errVal.stack;
    runningJobs.remove(runningJobs.indexOf(job.jobId));
    if (typeof runningJobPIDs[job.jobId] != 'undefined') delete runningJobPIDs[job.jobId];
    mesh.SendCommand({ 
        "action": "plugin", 
        "plugin": "scripttask",
        "pluginaction": "jobComplete",
        "jobId": job.jobId,
        "scriptId": job.scriptId,
        "retVal": retVal,
        "errVal": errVal,
        "dispatchTime": job.dispatchTime, // include original run time (long running tasks could have tried a re-send)
        "sessionid": _sessionid,
        "tag": "console"
    });
}
//@TODO Test powershell on *nix devices with and without powershell installed
function runPowerShell(sObj, jObj) {
    const fs = require('fs');
    var rand =  Math.random().toString(32).replace('0.', '');
    var oName = 'st' + rand + '.txt';
    var pName = 'st' + rand + '.ps1';
    var pwshout = '', pwsherr = '', cancontinue = false;
    if (process.platform != 'win32') {
        try {
            var childp = require('child_process').execFile('/bin/sh', ['sh']);
            childp.stderr.on('data', function (chunk) { pwsherr += chunk; });
            childp.stdout.on('data', function (chunk) { pwshout += chunk; });
            childp.stdin.write('`which pwsh`' + '\n');
            childp.stdin.write('exit\n');
            childp.waitExit();
        } catch (e) { finalizeJob(jObj, null, "Couldn't determine pwsh in env: " + e); }
        if (pwsherr != '') {
            finalizeJob(jObj, null, "PowerShell env determination error: " + pwsherr);
            return;
        }
        if (pwshout.trim() != '') {
            cancontinue = true;
        }
        if (cancontinue === false) { finalizeJob(jObj, null, "PowerShell is not installed"); return; }
    }
    try {
        fs.writeFileSync(pName, sObj.content);
        var outstr = '', errstr = '';
        if (process.platform == 'win32') {
            var child = require('child_process').execFile(process.env['windir'] + '\\system32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoLogo'] );
        } else {
            var child = require('child_process').execFile('`which pwsh`');
        }
        child.stderr.on('data', function (chunk) { errstr += chunk; });
        child.stdout.on('data', function (chunk) { });
        runningJobPIDs[jObj.jobId] = child.pid;
        
        if (process.platform == 'win32') {
            child.stdin.write('.\\' + pName + ' | Out-File ' + oName + ' -Encoding UTF8\r\n');
        } else {
            child.stdin.write('./' + pName + ' | Out-File ' + oName + ' -Encoding UTF8\n');
        }
        child.on('exit', function(procRetVal, procRetSignal) {
            dbg('Exiting with '+procRetVal + ', Signal: ' + procRetSignal); 
            if (errstr != '') {
                fs.unlinkSync(oName);
                fs.unlinkSync(pName);
                finalizeJob(jObj, null, errstr);
                return;
            }
            if (procRetVal == 1) {
                fs.unlinkSync(oName);
                fs.unlinkSync(pName);
                finalizeJob(jObj, null, 'Process terminated unexpectedly.');
                return;
            }
            outstr = fs.readFileSync(oName, 'utf8').toString();
            if (outstr) {
                //outstr = outstr.replace(/[^\x20-\x7E]/g, ''); 
                outstr = outstr.trim();
            }
            dbg('Output is: ' + outstr);
            fs.unlinkSync(oName);
            fs.unlinkSync(pName);
            finalizeJob(jObj, outstr);
        });
        child.stdin.write('exit\r\n');
        //child.waitExit(); // this was causing the event loop to stall on long-running scripts, switched to '.on exit'

    } catch (e) { 
        dbg('Error block was ' + e);
        finalizeJob(jObj, null, e);
    }
}

function runBat(sObj, jObj) {
    if (process.platform != 'win32') {
        finalizeJob(jObj, null, 'Platform not supported.');
        return;
    }
    const fs = require('fs');
    var rand =  Math.random().toString(32).replace('0.', '');
    var oName = 'st' + rand + '.txt';
    var pName = 'st' + rand + '.bat';
    try {
        fs.writeFileSync(pName, sObj.content);
        var outstr = '', errstr = '';
        var child = require('child_process').execFile(process.env['windir'] + '\\system32\\cmd.exe');
        child.stderr.on('data', function (chunk) { errstr += chunk; });
        child.stdout.on('data', function (chunk) { });
        runningJobPIDs[jObj.jobId] = child.pid;
        child.stdin.write(pName + ' > ' + oName + '\r\n');
        child.stdin.write('exit\r\n');

        child.on('exit', function(procRetVal, procRetSignal) {
            if (errstr != '') {
                fs.unlinkSync(oName);
                fs.unlinkSync(pName);
                finalizeJob(jObj, null, errstr);
                return;
            }
            if (procRetVal == 1) {
                fs.unlinkSync(oName);
                fs.unlinkSync(pName);
                finalizeJob(jObj, null, 'Process terminated unexpectedly.');
                return;
            }
            outstr = fs.readFileSync(oName, 'utf8').toString();
            if (outstr) {
                //outstr = outstr.replace(/[^\x20-\x7E]/g, ''); 
                outstr = outstr.trim();
            }
            dbg('Output is: ' + outstr);
            fs.unlinkSync(oName);
            fs.unlinkSync(pName);
            finalizeJob(jObj, outstr);
        });
    } catch (e) { 
        dbg('Error block was ' + e);
        finalizeJob(jObj, null, e);
    }
}

function runBash(sObj, jObj) {
    if (process.platform == 'win32') {
        finalizeJob(jObj, null, 'Platform not supported.');
        return;
    }
    //var child = require('child_process');
    //child.execFile(process.env['windir'] + '\\system32\\cmd.exe', ['/c', 'RunDll32.exe user32.dll,LockWorkStation'], { type: 1 });
    const fs = require('fs');
    var rand =  Math.random().toString(32).replace('0.', '');
    var oName = 'st' + rand + '.txt';
    var pName = 'st' + rand + '.sh';
    try {
        fs.writeFileSync(pName, sObj.content);
        var outstr = '', errstr = '';
        var child = require('child_process').execFile('/bin/sh', ['sh']);
        child.stderr.on('data', function (chunk) { errstr += chunk; });
        child.stdout.on('data', function (chunk) { });
        runningJobPIDs[jObj.jobId] = child.pid;
        child.stdin.write('chmod a+x ' + pName + '\n');
        child.stdin.write('./' + pName + ' > ' + oName + '\n');
        child.stdin.write('exit\n');
        
        child.on('exit', function(procRetVal, procRetSignal) {
            if (errstr != '') {
                fs.unlinkSync(oName);
                fs.unlinkSync(pName);
                finalizeJob(jObj, null, errstr);
                return;
            }
            if (procRetVal == 1) {
                fs.unlinkSync(oName);
                fs.unlinkSync(pName);
                finalizeJob(jObj, null, 'Process terminated unexpectedly.');
                return;
            }
            outstr = fs.readFileSync(oName, 'utf8').toString();
            if (outstr) {
                //outstr = outstr.replace(/[^\x20-\x7E]/g, ''); 
                outstr = outstr.trim();
            }
            dbg('Output is: ' + outstr);
            fs.unlinkSync(oName);
            fs.unlinkSync(pName);
            finalizeJob(jObj, outstr);
        });
    } catch (e) { 
        dbg('Error block was ' + e);
        finalizeJob(jObj, null, e);
    }
}

function jobIsRunning(jObj) {
    if (runningJobs.indexOf(jObj.jobId) === -1) return false;
    return true;
}

function runScript(sObj, jObj) {
    // get current processes and clean running jobs if they are no longer running (computer fell asleep, user caused process to stop, etc.)
    require('process-manager').getProcesses(function (plist) {
        //dbg('Got process list');
        dbg('There are currently ' + runningJobs.length + ' running jobs.');
        if (runningJobs.length) {
            runningJobs.forEach(function (jobId, idx) {
                //dbg('Checking for running job: ' + jobId + ' with PID ' + runningJobPIDs[jobId]);
                try {
                    //dbg('Info is: ' + typeof plist[runningJobPIDs[jobId]]);
                    //dbg('Info2 is: ' + typeof plist[runningJobPIDs[jobId]].cmd);
                } catch (e) { dbg('Info Error was ' + e); }
                if (typeof plist[runningJobPIDs[jobId]] == 'undefined' || typeof plist[runningJobPIDs[jobId]].cmd != 'string') {
                    dbg('Found job with no process. Removing running status.');
                    delete runningJobPIDs[jobId];
                    runningJobs.remove(runningJobs.indexOf(idx));
                    //dbg('RunningJobs: ' + JSON.stringify(runningJobs));
                    //dbg('RunningJobsPIDs: ' + JSON.stringify(runningJobPIDs));
                }
            });
        }
    });
    if (jobIsRunning(jObj)) { dbg('Job already running job id [' + jObj.jobId + ']. Skipping.'); return; }
    runningJobs.push(jObj.jobId);
    dbg('Running Script '+ sObj._id);
    switch (sObj.filetype) {
        case 'ps1':
            runPowerShell(sObj, jObj);
        break;
        case 'bat':
            runBat(sObj, jObj);
        break;
        case 'bash':
            runBash(sObj, jObj);
        break;
        default:
            dbg('Unknown filetype: '+ sObj.filetype);
        break;
    }
}
function getScriptFromCache(id) {
    var script = db.Get('pluginScriptTask_script_' + id);
    if (script == '' || script == null) return null;
    try {
        script = JSON.parse(script);
    } catch (e) { return null; }
    return script;
}
function cacheScript(sObj) {
    db.Put('pluginScriptTask_script_' + sObj._id, sObj);
}
function clearCache() {
     db.Keys.forEach(function(k) {
        if (k.indexOf('pluginScriptTask_script_') === 0) {
            db.Delete(k);
        }
    });
}

function sendConsoleText(text, sessionid) {
    if (typeof text == 'object') { text = JSON.stringify(text); }
    mesh.SendCommand({ "action": "msg", "type": "console", "value": text, "sessionid": sessionid });
}

module.exports = { consoleaction : consoleaction };