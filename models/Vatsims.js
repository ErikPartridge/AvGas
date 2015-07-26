//A controller is pretty straight forward, might consider adding time online stamp
Controllers = new Mongo.Collection('controllers',{
	schema:{
		position: {
			type: String
		},
		cid : {
			type: Number
		}
	}
});

//everything we need to know to display the pilot
Pilots = new Mongo.Collection('pilots', {
	schema:{
		cid: {
			type: Number
		},
		latitude: {
			type: Number
		},
		longitude: {
			type : Number
		},
		callsign: {
			type : String
		},
		heading: {
			type : Number
		}
	}
});

//We needs something to hold the data. A VATSIM is an instance of data, pulled every two minutes
Vatsims = new Mongo.Collection("vatsims");

var Schemas = {};

//The schema
Schemas.Vatsim = new SimpleSchema({
	time: {
		type: Number,
		label: "The time this was created",
		defaultValue: Date.now()
	},

	pilots: {
		type : [Pilots],
		label : "The pilots on the network"
	},

	controllers: {
		type : [Controllers],
		label : "The controllers on the network"
	}

});

Vatsims.attachSchema(Schemas.Vatsim);