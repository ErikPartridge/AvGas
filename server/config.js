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