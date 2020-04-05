//graveyard routes
var express = require("express");
var router = express.Router({mergeParams: true});
var Coupon = require("../models/coupon");
var User = require("../models/user");
var Used = require("../models/used");
var middleware = require("../middleware");

router.get("/graveyard", middleware.isLoggedIn, function(req, res){
	Used.find({}, function(err, coupons){
		if(err){
			console.log("Error");
		}else{
			res.render("allUsed", {coupons: coupons});
		}
	});
});

//show used coupons route
router.get("/graveyard/:id",  middleware.isLoggedIn, function(req,res){
	Used.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("/coupons");
		}else{
			res.render("showUsed", { coupon: foundCoupon, currentUser: req.user});
		}
	});
});


//edit used routes
router.get("/graveyard/:id/edit", middleware.isLoggedIn, middleware.checkCouponOwnershipUsed,  function(req, res){
	Used.findById(req.params.id, function(err, foundCoupon){
			res.render("editUsed", {coupon: foundCoupon});
	});
});

//update used route
router.put("/graveyard/:id",  middleware.isLoggedIn, middleware.checkCouponOwnershipUsed, function(req, res){
  console.log("in update route:");
	console.log(req.body);
	Used.findByIdAndUpdate(req.params.id, req.body.coupon, function(err, UpdatedCoupon){
		if(err){
			res.redirect("/coupons");
		}else{
			res.redirect("/graveyard/" + req.params.id);
		}
	});
});

//destroy used route
router.delete("/graveyard/:id",  middleware.isLoggedIn, middleware.checkCouponOwnershipUsed, function(req,res){
	Used.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/coupons");
		}else{
			res.redirect("/coupons");
	}});
});

//use route
router.post("/coupons/:id/use", middleware.isLoggedIn, function(req, res){
	Coupon.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("/coupons");
		}else{

			var couponName = foundCoupon.couponName;
			var validUntil = foundCoupon.validUntil;
			var description = foundCoupon.description;
			var creator = foundCoupon.creator;
			var createdDate = foundCoupon.createdDate;
			var usedBy = {
			  id: req.user._id,
				username: req.user.username
			};


			var newUsed = {
				couponName: couponName,
				validUntil: validUntil,
				description: description,
				creator: creator,
				usedBy: usedBy,
				createdDate: createdDate
			}

			Used.create(newUsed, function(err, newCoupon){
				if(err){
					console.log(err);
				}else{
					newCoupon.save();
				}
			});
		}
	});
		Coupon.findByIdAndRemove(req.params.id, function(err){
			if(err){
				res.redirect("/coupons");
			}else{
				res.redirect("/profil");
		}});
});

//dont use route
router.post("/graveyard/:id/dontUse", middleware.isLoggedIn, function(req, res){
	Used.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("/graveyard");
		}else{
			var couponName = foundCoupon.couponName;
			var validUntil = foundCoupon.validUntil;
			var description = foundCoupon.description;
			var creator = foundCoupon.creator;
			var createdDate = foundCoupon.createdDate;
			var lastChangedDate = foundCoupon.lastChangedDate;

			var newCoupon = {
				couponName: couponName,
				validUntil: validUntil,
				description: description,
				creator: creator,
				createdDate: createdDate,
				lastChangedDate: lastChangedDate
			}
			Coupon.create(newCoupon, function(err, newC){
				if(err){
					console.log(err);
				}else{
					newC.save();
				}
			});
		}
	});
		Used.findByIdAndRemove(req.params.id, function(err){
			if(err){
				res.redirect("/profil");
			}else{
				res.redirect("/coupons");
		}});
});

//profil route
router.get("/profil",  middleware.isLoggedIn, function(req,res){
	Used.find({}, function(err, usedCoupons){
		if(err){
			console.log("Error");
		}else{
			res.render("profil", {usedCoupons: usedCoupons, currentUser: req.user});
		}
	});
});



 module.exports = router;
