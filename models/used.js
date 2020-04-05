var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UsedSchema = new mongoose.Schema({
	couponName: String,
	validUntil: Date,
	description: String,
	creator: {id: String,
			 username: String},
	usedBy: {
				id:{type:mongoose.Schema.Types.ObjectId,
					ref:"User"},
				username: String
			},
	createdDate: Date,
	lastChangedDate:{type: Date, default: Date.now},
	cost: String
});

UsedSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Used", UsedSchema );

 UsedSchema.set('autoIndex', false);
