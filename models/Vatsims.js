//A controller is pretty straight forward, might consider adding time online stamp
Controllers = new Mongo.Collection('controllers',{
	schema:{
		position: {
			type: String
		},
		cid : {
			type: Number
		},
		frequency: {
			type: String
		},
		latitude: {
			type: Number
		},
		realname:{
			type: String
		},
		longitude: {
			type: Number
		},
		vatsimId : {
			type : String
		}
	}
});

//everything we need to know to display the pilot
Pilots = new Mongo.Collection('pilots', {
	schema:{
		cid: {
			type: Number
		},
		realname : {
			type: String
		},
		departs : {
			type: String
		},
		arrives : {
			type: String
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
		vatsimId : {
			type : String
		}
	}
});

//We needs something to hold the data. A VATSIM is an instance of data, pulled every two minutes
Vatsims = new Mongo.Collection("vatsims", {
	schema:{
		time: {
			type: Number,
			label: "The time this was created",
			defaultValue: Date.now()
		},

		pilots: {
			type : [String],
			label : "The pilots on the network"
		},

		controllers: {
			type : [String],
			label : "The controllers on the network"
		}
	}
});