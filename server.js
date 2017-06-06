"use strict";

// call the packages we need
const express    = require('express');        // call express
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;        // set our port
const iface = require('./ifaceCtl');

// Map of interfaces available to be managed. Key is the name of the interace
// available to the front-end. Value is the interface name in in the back-end.
const ifaceMap = new Map([
  ['int1', 'enp0s8'],
  ['int2', 'enp0s9']
]);

// parse application/json
app.use(bodyParser.json());
app.use(express.static('client')); // serve client HTML

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/interface')
  .get((req, res)=> {

    console.log("request to get interfaces.");
    // send array of only the keys from the ifaceMap
    res.json(Array.from(ifaceMap.keys()));
  })

// route to resource for sepecific interface
router.route('/interface/:ifaceName')
  .get((req, res)=> {
    console.log("request to get interface state.");
    // check to see if the requested interfaceName exists in our ifaceMap
    if (ifaceMap.has(req.params.ifaceName)) {
      iface.get(ifaceMap.get(req.params.ifaceName), (err, results)=>{
        if (err) {
          console.log(err);
          res.json({ state: 'error'});
        }
        else {
          res.json({state: results});
        }
      });
    // requested interfaceName is not in our map...send 404.
    } else {
      res.status(404).send('Not found.');
    }
  })
  // POST manipulates interface state
  .post((req, res)=> {
    console.log("request to change interface state.");
    // basic validation of request query and body
    if ((
      Object.keys(req.query).length === 0 ||
      req.query.state === 'up' ||
      req.query.state === 'down'
      ) && (
      Object.keys(req.body).length === 0 ||
      req.body.state === 'up' ||
      req.body.state === 'down'
      )
    ) {
      // query and body is valid
      // check to see if the requested interfaceName exists in our ifaceMap
      if (ifaceMap.has(req.params.ifaceName)) {
        iface.set(ifaceMap.get(req.params.ifaceName), req.query.state || req.body.state || null, (e)=>{
          if (e) {
            res.json({ error: e});
          }
          else {
            // add in a 500ms delay before looking up interface state and returning it
            setTimeout(()=>{
              iface.get(ifaceMap.get(req.params.ifaceName), (err, results)=>{
                if (err) {
                  console.log(err);
                  res.json({ state: 'error'});
                }
                else {
                  res.json({state: results});
                }
              });
            }, 500)
          }
        })
      // requested interfaceName is not in our map...send 404.
      } else {
        res.status(404).send('Not found');
      }
    }
    else {
      res.status(400).send('Bad request');
    }
  })

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
