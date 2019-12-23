# MeshCentral-ScriptTask

A script running plugin for the [MeshCentral2](https://github.com/Ylianst/MeshCentral) Project. The plugin supports PowerShell, BAT, and Bash scripts. Windows, MacOS, and Linux endpoints are all supported. PowerShell can be run on any OS that has PowerShell installed, not just Windows.

## Important Note
**This plugin now supports NeDB and MongoDB**

## Installation

 Pre-requisite: First, make sure you have plugins enabled for your MeshCentral installation:
>     "plugins": {
>          enabled: true
>     },
Restart your MeshCentral server after making this change.

 To install, simply add the plugin configuration URL when prompted:
 `https://raw.githubusercontent.com/ryanblenis/MeshCentral-ScriptTask/master/config.json`

## Features
- Add scripts to a central store
- Run scripts on single or multiple endpoints simultaneously
-- Supports PowerShell, BAT, and Bash scripts
- Review the return status / value of completed scripts
-- Returns text or parses returned JSON for easy viewing
- Schedule scripts for future runs on either a one-time or interval basis (minutes, hourly, daily, weekly)
- View schedules and histories based on either node (endpoint) or script
- Dead job detection with script replay

## Usage Notes
- *Run* schedules and runs the job instantly.
- *Schedule* puts the events into a queue.
- Queues are checked / run every minute.
- Scheduled jobs only show the *next* scheduled job at any given time.
- History is limited to 200 events per node/script in the viewport.
- Historical events that have completed will delete after 90 days.
- Jobs only run when the endpoint agent is online. They do *not* queue to the agent when offline, then run at the specified time.
- Scripts are cached on the clients and verified via hash at runtime for the latest version.

## Getting Started
Drag and drop some of your favorite admin scripts on the file tree. You'll then be able to run them immediately on endpoints (nodes).

## Upcoming Features
- Take action on the results of a script
- Variable replacement

## Other Information
This is fairly new and in beta. Testing was mostly done in the latest Chrome and Firefox. No attempt was made to be compatible with older IE browsers. Endpoint testing was done on Windows 10 (1903) and OS X 10.13.

## Screenshots
![Device Page](https://user-images.githubusercontent.com/1929277/71248033-f4519b00-22e7-11ea-9aa6-ef22e0b9fdb2.png)
![Script Editor](https://user-images.githubusercontent.com/1929277/71248034-f4519b00-22e7-11ea-8ab4-ccad3e959a1a.png)
![Schedule Screen](https://user-images.githubusercontent.com/1929277/71248469-e7817700-22e8-11ea-9121-a215de160e0e.png)

