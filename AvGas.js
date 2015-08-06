parseVatsimData =  function(raw){
  var cleaned = raw.replace(/^;.*\n?/gm, '');
  var ref = {1 : "GENERAL", 2 : "VOICE SERVERS", 3 : "CLIENTS", 4 : "SERVERS", 5: "PRE-FILE"};
  var clientData = cleaned.split(/^!.*:$/gm)[3];
  var header = "callsign:cid:realname:clienttype:frequency:latitude:longitude:altitude:groundspeed:planned_aircraft:planned_tascruise:planned_depairport:planned_altitude:planned_destairport:server:protrevision:rating:transponder:facilitytype:visualrange:planned_revision:planned_flighttype:planned_deptime:planned_actdeptime:planned_hrsenroute:planned_minenroute:planned_hrsfuel:planned_minfuel:planned_altairport:planned_remarks:planned_route:planned_depairport_lat:planned_depairport_lon:planned_destairport_lat:planned_destairport_lon:atis_message:time_last_atis_received:time_logon:heading:QNH_iHg:QNH_Mb:\n";
  var csv = header + clientData;
  csv = csv.replace(/^\s*[\r\n]/gm, "");
  var jsonResult = Papa.parse(csv, {
    delimiter: ":",
    comment: ";",
    header: true
  })['data'];
  var pilotList = [];
  var controllerList = [];
  var vatsim = {time: Date.now(), pilots : pilotList, controllers: controllerList};
  var vatsimId = Vatsims.insert(vatsim);
  //var airportData = Meteor.http.get(Meteor.absoluteUrl("/data/airports.json"), {timeout: 300000}).content;
  var airports = ["BOS","ALB","BDL","BGR","BTV","MHT","PVD","PWM","SYR","ACK","ASH","BAF","BED","BVY","CEF","EWB","FMH","GON","HFD","HYA","LEB","LWM","MVY","NHZ","OQU","ORH","OWD","PSM","SCH"];
  for(var i = 0; i < jsonResult.length; i++){
    if(jsonResult[i]["clienttype"] == "PILOT"){
      var pilotData = jsonResult[i];
      var db = Meteor.users.find({username: pilotData["cid"]}).fetch();
      if(db.length > 0){
        var pilot = {cid : pilotData["cid"],  latitude: pilotData["latitude"], longitude: pilotData["longitude"], callsign : pilotData["callsign"], vatsimId : vatsimId};
        var id = Pilots.insert(pilot);
        pilotList.push(id);
      }
    }else{
      var ctrData = jsonResult[i];
      if(ctrData["callsign"].indexOf("OBS") === -1){
        var segments = ctrData["callsign"].split("_");
        if(airports.indexOf(segments[0]) > -1){
          var icao = "K" + segments[0];
          var controller = {position : ctrData["callsign"], cid: ctrData["cid"], latitude : ctrData["latitude"], longitude: ctrData["longitude"], vatsimId : vatsimId};
          var id = Controllers.insert(controller);
          controllerList.push(id);
        }
      }
    }
  }
  Vatsims.update(vatsimId, {$set: {controllers : controllerList, pilots : pilotList}});
}

if (Meteor.isClient) {
  // Nothing here yet, using client/
}

if (Meteor.isServer) {
  Meteor.publish("controllers", function(){
    var id = Vatsims.find({}, {sort :{$natural : 1}}).fetch()[0]._id;
    //console.log(Controllers.find({vatsimId : id}).fetch().length);
    return Controllers.find({vatsimId: id});
  });
  Meteor.publish("pilots", function(){
    var id = Vatsims.find({}, {sort : {$natural : -1}}).fetch()[0]._id;
    //console.log(Pilots.find({vatsimId : id}).fetch().length);
    return Pilots.find({vatsimId: id});
  });
}
