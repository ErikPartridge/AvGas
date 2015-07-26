Accounts.emailTemplates.siteName = "Boston vARTCC";
Accounts.emailTemplates.from = "Boston John <no-reply@bvartcc.com>";

//Self explanatory
Accounts.config({
  sendVerificationEmail : true,
  loginExpirationInDays : 30
});

Accounts.validateNewUser(function (user){
  //Validate that it has the lengh of a CID
  if(user.username && user.username.length >= 6 && user.username.length <= 7){
    //Validates they're a member of VATSIM
    var result = Meteor.http.get('https://cert.vatsim.net/cert/vatsimnet/idstatus.php?cid=' + user.username, {timeout:30000});
    if(result.statusCode != 200){
      throw new Meteor.Error(403, "Unable to connect to the VATSIM Network, please try again later");
    }
    var xml = result.content;
    var js = xml2js.parseStringSync(xml);
    //Sets their first and last name to what VATSIM has on file
    var name = js['root']['user'][0]['name_first'] + ' ' + js['root']['user'][0]['name_last'];
    if(!name){
      throw new Meteor.Error(403, "No VATSIM account found with that CID");
    }
    user.profile = {'name': name};

    return true;
  }else{
      throw new Meteor.Error(403, "Your username must be your CID!");
  }
});

if (Meteor.isClient) {
  // Nothing here yet, using client/
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    SyncedCron.add({
      //Part way here.
      name: 'Update the VATSIM controllers data',
      schedule : function(parser){
          return parser.text('every 2 minutes');
      },
      job: function(){
        //Get the XML data for online controllers, pilots doesn't work
        var result = Meteor.http.get('http://vatsim.hostcreator.nl/api/controllers', {timeout:30000});
        if(result.statusCode != 200){
          throw new Meteor.Error(403, "Unable to connect to the VATSIM Network, please try again later");
        }
        var xml = result.content;
        var js = xml2js.parseStringSync(xml);
        var controllers = [];
        //Here's the airports we need to worry about
        var airports = ["BOS","ALB","BDL","BGR","BTV","MHT","PVD","PWM","SYR","ACK","ASH","BAF","BED","BVY","CEF","EWB","FMH","GON","HFD","HYA","LEB","LWM","MVY","NHZ","OQU","ORH","OWD","PSM","SCH"];
        for(var i = 0, len = js[controllers].length(); i < len; i++){
          //Identify if they're controlling a ZBW position
          //Then set that positon to show up on the map. That's not done yet, but all the positions are there theoretically.
        }
      }
    });
  });
}
