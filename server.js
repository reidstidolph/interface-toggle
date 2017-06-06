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

// more routes for our API will happen here
router.route('/interface/:name')
  .get((req, res)=> {
    if (ifaceMap.has(req.params)) {
      console.log("request to get interface state.");
      console.log(req.body);
      console.log(req.query);
      console.log(req.params);
      iface.get(ifaceMap.get(req.params), (err, results)=>{
        if (err) {
          res.json({ state: err});
        }
        else {
          res.json({state: results});
        }
      });
    } else {

    }
  })
  .post((req, res)=> {

    console.log("request to change interface state.");
    iface.set((e)=>{
      if (e) {
        res.json({ error: e});
      }
      else {
        iface.get((err, results)=>{
          if (err) {
            res.json({ state: err});
          }
          else {
            res.json({state: results});
          }
        });
      }
    })
  })

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
