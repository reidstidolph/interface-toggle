"use strict";

// call the packages we need
const express    = require('express');      // call express
const app        = express();               // define our app using express
const bodyParser = require('body-parser');  // uses body-parser  express middleware
const router = express.Router();            // get an instance of the express Router
const port = process.env.PORT || 8080;      // set our port
const iface = require('./ifacectl');        // interface controller

// Map of interfaces available to be managed. Key is the name of the interace
// available to the front-end. Value is the interface name in in the back-end.
const ifaceMap = new Map([
  ['int1', 'enp0s8'],
  ['int2', 'enp0s9']
]);

app.use(bodyParser.json());                 // parse application/json
app.use(express.static('client'));          // serve client HTML

/* ROUTES FOR OUR API
*  =============================================================================
*/

// test route to make sure everything is working (GET /api)
router.get('/', function(req, res) {
    res.json({ message: 'success!' });
});

/* REST resource /api/interface
*  =============================================================================
*  This resource accpets GET method, and returns an array containing the
*  interfaces that are available for control.
*/
router.route('/interface')
  .get((req, res)=> {

    console.log("request to get interfaces.");
    // send array of only the keys from the ifaceMap
    res.json(Array.from(ifaceMap.keys()));
  })

/* REST resource /api/interface/<some interface>
*  =============================================================================
*  This resource accepts GET method with a valid interface name, and returns the
*  current up|down state.
*
*  It also accepts POST method with a valid interface name, to set the state of
*  the interface.
*
*  If POST has no valid URL parameters or valid request body, it toggles the
*  interface.
*
*  If POST contains a URL parameter for state up|down, it sets state
*  accordingly.
*    e.g. POST /api/interface/myinterface?state=down
*
*  If POST contains a request body containing a JSON object with state, it sets
*  state accordingly.
*    e.g. POST /api/interface/myinterface body={"state":"down"}
*
*  If a POST contains both a valid URL parameter and a valid body, the URL
*  parameter takes precedence.
*
*  In all cases of a successful POST or GET, state of the interface is returned
*  as JSON in the response body.
*    e.g. {"state":"down"} or {"state":"up"}
*/
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
            console.log(e);
            res.status(500).send('Unable to change interface state');
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

/* REGISTER OUR ROUTES
*  =============================================================================
*  all of our routes will be prefixed with /api
*/
app.use('/api', router);

/* START THE SERVER
*  =============================================================================
*/
app.listen(port);
console.log('Magic happens on port ' + port);
