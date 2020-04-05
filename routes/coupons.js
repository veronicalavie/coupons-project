//coupons routes
var express = require("express");
var router = express.Router({mergeParams: true});
var Coupon = require("../models/coupon");
var User = require("../models/user");
var Used = require("../models/used");
var middleware = require("../middleware/index.js");

router.get("/coupons", middleware.isLoggedIn, function(req, res){
	Coupon.find({}, function(err, coupons){
		if(err){
			console.log("Error");
		}else{
			res.render("index", {coupons: coupons, currentUser: req.user});
		}
	});
});

//new route
router.get("/coupons/news", middleware.isLoggedIn, function(req, res){
	res.render("new");
});

//create route
router.post("/coupons", middleware.isLoggedIn,  function(req,res){
	Coupon.create(req.body.coupon, function(err, newCoupon){
		if(err){
			res.render("new");

		}else{
			newCoupon.creator.id = req.user._id;
			newCoupon.creator.username = req.user.username;
			newCoupon.save();
			res.redirect("/coupons");
		}
	});
});


//show route
router.get("/coupons/:id",  middleware.isLoggedIn, function(req,res){
	Coupon.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("/coupons");
		}else{
			res.render("show", { coupon: foundCoupon});
		}
	});
});

//edit route
router.get("/coupons/:id/edit", middleware.isLoggedIn, middleware.checkCouponOwnership, function(req, res){

	Coupon.findById(req.params.id, function(err, foundCoupon){
			res.render("edit", {coupon: foundCoupon});
	});
});

//update route
router.put("/coupons/:id",  middleware.isLoggedIn, middleware.checkCouponOwnership, function(req, res){
	Coupon.findByIdAndUpdate(req.params.id, req.body.coupon, function(err, UpdatedCoupon){
		if(err){
			res.redirect("/coupons");
		}else{
			res.redirect("/coupons/" + req.params.id);
		}
	});
});

//destroy route
router.delete("/coupons/:id",  middleware.isLoggedIn, middleware.checkCouponOwnership, function(req,res){
	Coupon.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/coupons");
		}else{
			res.redirect("/coupons");
	}});
});

module.exports = router;
