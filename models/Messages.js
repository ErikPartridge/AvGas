Messages = new Mongo.Collection('messages',{
	schema:{
		name: {
			type: String
		},
		content: {
			type:  String
		},
		time : {
			type : Number
		},
		hoursMinutes: {
			type: String
		}
	}
});