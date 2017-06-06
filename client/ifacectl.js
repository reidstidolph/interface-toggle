
var iface = {
  get : function(iface, callback){
    // set up new REST request
    var rest = new XMLHttpRequest();
    // handle results that come back
    rest.onreadystatechange = function() {
      // request is successful
      if (this.readyState == 4 && this.status == 200) {
        // try to parse response into JSON
        try {
          var r = JSON.parse(this.response);
          callback(null, r);
        } catch (e) {
          console.log("Results parse error: " + e);
          callback(e, null);
        }
      // request failed
    } else if (this.readyState == 4 && this.status != 200) {
        callback("request failed with " + this.status, null);
      }
    };
    // finish configuring REST request
    rest.open("GET", "/api/interface/" + iface, true);
    // fire in the hole!
    rest.send();
  },
  set : function(iface, state, callback){

  }
}
