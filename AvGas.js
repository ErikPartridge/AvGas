parseVatsimData =  function(raw){
  var cleaned = raw.replace(/^;.*\n?/m, '');
  var ref = {1 : "GENERAL", 2 : "VOICE SERVERS", 3 : "CLIENTS", 4 : "SERVERS", 5: "PRE-FILE"};
  var clientData = cleaned.split(/^;.*:$/m)[4];
  var header = "callsign:cid:realname:clienttype:frequency:latitude:longitude:altitude:groundspeed:planned_aircraft:planned_tascruise:planned_depairport:planned_altitude:planned_destairport:server:protrevision:rating:transponder:facilitytype:visualrange:planned_revision:planned_flighttype:planned_deptime:planned_actdeptime:planned_hrsenroute:planned_minenroute:planned_hrsfuel:planned_minfuel:planned_altairport:planned_remarks:planned_route:planned_depairport_lat:planned_depairport_lon:planned_destairport_lat:planned_destairport_lon:atis_message:time_last_atis_received:time_logon:heading:QNH_iHg:QNH_Mb:\n";
  var csv = header + clientData;
  var jsonResult = Papa.parse(csv, {
    delimiter: ":",
    header: true,
  })['data'];
  var pilotList = [];
  var controllerList = [];
  var airports = ["BOS","ALB","BDL","BGR","BTV","MHT","PVD","PWM","SYR","ACK","ASH","BAF","BED","BVY","CEF","EWB","FMH","GON","HFD","HYA","LEB","LWM","MVY","NHZ","OQU","ORH","OWD","PSM","SCH"];
  for(var i = 0; i < jsonResult.length; i++){
    if(jsonResult[i]["clienttype"] == "PILOT"){
      var pilotData = jsonResult[i];
      var db = Users.find({username: pilotData["cid"]});
      if(db.count() === 1){
        var pilot = {cid : pilotData["cid"],  latitude: pilotData["latitude"], longitude: pilotData["longitude"], callsign : pilotData["callsign"]};
        var id = Pilots.insert(pilot);
        pilotList.push(id);
      }
    }else{
      var ctrData = jsonResult[i];
      if(ctrData["callsign"].indexOf("OBS") === -1){
        var segments = ctrData[callsign].split("_");
        var controller = {position : ctrData["callsign"], cid: ctrData["cid"], latitude : ctrData["latitude"], longitude : ctrData["longitude"]};
        var id = Controllers.insert(controller);
        controllerList.push(id);
      }
    }
  }
  var vatsim = {time : Date.now(), pilots : pilotList, controllers : controllerList};
  return Vatsims.insert(vatsim);
}

SyncedCron.add({
  //Part way here.
  name: 'Update the VATSIM controllers data',
  schedule : function(parser){
      return parser.text('every 2 minutes');
  },
  job: function(){
    //Get the XML data for online controllers, pilots doesn't work
    var servers = ['http://www.pcflyer.net/DataFeed/vatsim-data.txt',
        'http://fsproshop.com/servinfo/vatsim-data.txt',
        'http://vatsim-data.hardern.net/vatsim-data.txt',
        'http://info.vroute.net/vatsim-data.txt',
        'http://data.vattastic.com/vatsim-data.txt']
    var result = Meteor.http.get(servers[Math.floor(Math.random()*servers.length)], {timeout : 30000});
    if(result.statusCode != 200){
      throw new Meteor.Error(403, "Unable to connect to the VATSIM Network, please try again later");
    }
    var id = parseVatsimData(result.content);
  }
});

SyncedCron.start();

if (Meteor.isClient) {
  // Nothing here yet, using client/
  Meteor.subscribe("vatsim");
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.publish("vatsim", function(){
    return Vatsims.find({}, {sort : {date_created : -1}})[0];
  });
}
