"use strict";
/**
* Bit of ES to handle manipulating state of a network interface
*/

const fs = require('fs');              // Requires the fs module to read interface state from file system
const iface="enp0s8";                  // Interface to control
const task = require('child_process'); // Set up a shortcut var to spawn child processes

/**
* Fetch interface state.
* @function
* @param {string} intf - The name of an interface.
* @returns {Promise} Promise for results of interface state.
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
* Run a command in the OS.
* @function
* @param {string} cmd - The name the command to run.
* @param {Array<string>} args - Command arguments.
* @returns {Promise} Promise for results of the command.
*/
function osTask(cmd, args = [] ){
  return new Promise(
    (resolve, reject)=> {
      if (!Array.isArray(args)) {
        reject('args not an array.');
      } else {
        task.execFile(cmd, args, (error, stdout, stderr) => {
          if (error) {
            //console.log(error);
            reject(stderr);
          } else {
            resolve(stdout);
          }
        });
      }
    }
  );
}


/**
* Manipulate interface state
* @function
* @param {string} intf - The name of an interface.
* @param {string} state - up or down state to apply to interface.
*/
function intSet(intf, state) {
  // state is supplied, use it
  if (state === "up" || state === "down") {
    console.log(`Turning ${intf} ${state}.`);
    // return the osTask promise
    return osTask('ip', ['link', 'set', intf, state]);
  }
  // state not supplied. toggle the interface based on current state
  else {
    // return the getInterfaceState promise, with the osTask promise nested
    return getInterfaceState(intf)
      .then(
        (state)=>{
          if (state == 'up') {
            console.log("Interface up...turning down.");
            //return Promise.all([state, osTask('sudo', ['ip', 'link', 'set', intf, 'down'])])

            return osTask('ip', ['link', 'set', intf, 'down'])
            /*  .then((output)=>{return output;})
            /*  .catch((error)=>{return error;});
            */
          } else if (state == 'down') {
            console.log("Interface down...turning up.");
            //return Promise.all([state, osTask('sudo', ['ip', 'link', 'set', intf, 'up'])])

            return osTask('ip', ['link', 'set', intf, 'up'])
            /*  .then((output)=>{return output;})
            /*  .catch((error)=>{return error;});
            */
          }
        }
      )
      /*
      .then(
        (finalResults)=> {
          return finalResults[1];
        }
      );
      */
  }
}

module.exports = {
  get : (callback)=>{
    getInterfaceState(iface)
      .then(
        (results)=> {
          callback(null, results);
        }
      )
      .catch(
        (error)=> {
          callback(error, null);
        }
      );
  },
  set : (callback, state)=>{
    intSet(iface, state)
      .then(
        (results)=> {
          callback(null);
        }
      )
      .catch(
        (error)=> {
          callback(error);
        }
      );
  }
}
