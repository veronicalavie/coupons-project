//all the middleware goes here
var Used = require("../models/used");
var Coupon = require("../models/coupon");
var middlewareObj = {};

middlewareObj.checkCouponOwnershipUsed = function(req, res, next){
	Used.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("back");
		}else{
			if(req.user._id.equals(foundCoupon.creator.id)){
				next();
			}else{
				res.redirect("back");
			}
		}
	});
};

middlewareObj.checkCouponOwnership = function(req, res, next){
	Coupon.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("back");
		}else{
			if(foundCoupon.creator.id.equals(req.user._id)){
				next();
			}else{
				res.redirect("back");
			}
		}
	});
};

middlewareObj.isLoggedIn = function(req, res, next){
	 if(req.isAuthenticated()){
		 return next();
	 }
	 res.redirect("/login");
 }



module.exports = middlewareObj;
