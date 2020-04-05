var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var couponSchema = new mongoose.Schema({
	couponName: String,
	validUntil: { type: Date, default: Date.now },
	description: String,
	creator: {
		id:{type:mongoose.Schema.Types.ObjectId,
				 ref:"User"},
	    username: String},
	usedBy: String,
	createdDate: { type: Date, default: Date.now },
	lastChangedDate: { type: Date, default: Date.now },
	cost: String

});
couponSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Coupon", couponSchema );
