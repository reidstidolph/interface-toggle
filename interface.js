"use strict";
/**
* Bit of ES to handle manipulating state of a network interface
*/

const fs = require('fs');              // Requires the fs module to read interface state from file system
const iface="enp0s3";                  // Interface to control
const task = require('child_process'); // Set up a shortcut var to spawn child processes

/**
* Fetch interface state.
* @function
* @param {string} intf - The name of an interface.
* @returns {Promise} promise for results of interface state.
*/
function getInterfaceState(intf){
  return new Promise(
    (resolve, reject)=> {
      fs.readFile(`/sys/class/net/${intf}/operstate`, 'utf8', (err, newInterfaceState) => {
        if (err) {
          // something when wrong, reject the promise with the error
          reject(err);
        } else {
          newInterfaceState = newInterfaceState.trim();
          resolve(newInterfaceState);
        }
      });
    }
  );
}

/**
* Turn interface up
* @function
* @param {string} intf - The name of an interface.
*/
function intUp(intf){
  task.execFile('ip', ['link', 'set', intf, 'up'], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
    } else {
      console.log('Success!', stdout);
    }
  });
}

/**
* Turn interface down
* @function
* @param {string} intf - The name of an interface.
*/
function intDown(intf){
  task.execFile('ip', ['link', 'set', intf, 'down'], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
    } else {
      console.log('Success!', stdout);
    }
  });
}

/**
* Toggle interface up or down
* @function
* @param {string} intf - The name of an interface.
*/
function intToggle(intf){

  console.log(`Toggle ${intf}`);

  getInterfaceState(intf).then(
    (state)=>{
      if (state == 'up') {
        console.log("Interface up...turning down.");
        intDown(intf);
      } else if (state == 'down') {
        console.log("Interface down...turning up.");
        intUp(intf);
      }
    },
    (reason)=>{
      console.error('Something went wrong', reason);
    }
  );
}

function intSet(intf, state) {
  if (state === "up") {
    intUp(intf);
  } else if (state === "down") {
    intDown(intf);
  } else {
    intToggle(intf);
  }
}

intToggle(iface);

module.exports = {
  "get" : getInterfaceState(intf),
  "set" : intSet(intf, state)
}
