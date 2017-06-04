"use strict";

// call the packages we need
const express    = require('express');        // call express
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;        // set our port
const iface = require('./interface');

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
  .post((req, res)=> {

    console.log("request to change interface state.");
    iface.set((e)=>{
      if (e) {
        res.json({ error: e});
      }
      else {
        iface.get((err)=>{
          if (err) {
            res.json({ error: err});
          }
          else {
            res.json({state: results});
          }
        });
      }
    })
  })
  .get((req, res)=> {

    console.log("request to get interface state.");
    iface.get((err, results)=>{
      if (err) {
        res.json({ state: err});
      }
      else {
        res.json({state: results});
      }
    });
  })

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
