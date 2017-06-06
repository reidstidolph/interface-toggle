
var iface = {
  get : function(iface, callback){
    var rest = new XMLHttpRequest();
    rest.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
       console.log(this);
      }
    };
    rest.open("GET", "/api/interface/" + iface, true);
    rest.send();
  },
  set : function(iface, state, callback){

  }
}
