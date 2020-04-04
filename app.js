var bodyParser    = require("body-parser"),
	methodOverride= require("method-override"),
	mongoose      = require("mongoose"),
	express       = require("express"),
	app           = express(),
	passport      =require("passport"),
	LocalStrategy =require("passport-local"),
    User          =require("./models/user"),
	Used          =require("./models/used");

mongoose.connect("mongodb://localhost:27017/coupons_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));


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
	lastChangedDate: { type: Date, default: Date.now }

});

var Coupon = mongoose.model("Coupon", couponSchema );

//passport configuration
app.use(require("express-session")({
	secret:"coupon app",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.get("/coupons", isLoggedIn, function(req, res){
	Coupon.find({}, function(err, coupons){
		if(err){
			console.log("Error");
		}else{
			res.render("index", {coupons: coupons, currentUser: req.user});
		}
	});
});

//new route
app.get("/coupons/news", isLoggedIn, function(req, res){
	res.render("new");
});

//create route
app.post("/coupons", isLoggedIn,  function(req,res){
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
app.get("/coupons/:id",  isLoggedIn, function(req,res){
	Coupon.findById(req.params.id, function(err, foundCoupon){
		if(err){
			res.redirect("/coupons");
		}else{
			res.render("show", { coupon: foundCoupon});
		}
	});
});

//edit route
app.get("/coupons/:id/edit", isLoggedIn, checkCouponOwnership, function(req, res){
	Coupon.findById(req.params.id, function(err, foundCoupon){
			res.render("edit", {coupon: foundCoupon});
	});
});

//update route
app.put("/coupons/:id",  isLoggedIn, checkCouponOwnership, function(req, res){
	Coupon.findByIdAndUpdate(req.params.id, req.body.coupon, function(err, UpdatedCoupon){
		if(err){
			res.redirect("/coupons");
		}else{
			res.redirect("/coupons/" + req.params.id);
		}
	});
});

//destroy route
app.delete("/coupons/:id",  isLoggedIn, checkCouponOwnership, function(req,res){
	Coupon.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/coupons");
		}else{
			res.redirect("/coupons");
	}});
});

//use route
app.post("/coupons/:id/use", isLoggedIn, function(req, res){
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
					console.log(newUsed);
					console.log(err);
				}else{
					newCoupon.save();
					console.log("success!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
					res.redirect("/coupons");
				}

			});
		}
	});
	// Coupon.findByIdAndRemove(req.params.id, function(err){
	// 	if(err){
	// 		res.redirect("/coupons");
	// 	}else{
	// 		res.redirect("/coupons");
	// }});
});

//profil route
app.get("/profil",  isLoggedIn, function(req,res){
	Used.find({}, function(err, usedCoupons){
		if(err){
			console.log("Error");
		}else{
			res.render("profil", {usedCoupons: usedCoupons, currentUser: req.user});
		}
	});
});


//=============================================================================
//auth routes
//=============================================================================

app.get("/",function(req, res){
	res.render("home");
});


//show register form
app.get("/register", function(req,res){
	res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
	var newUser = new User ({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/coupons");
		});
	});
});

//show login form
app.get("/login", function(req, res){
	res.render("login");
});

//handling login logic
app.post("/login", passport.authenticate("local",
 { successRedirect: "/coupons",
   failureRedirect: "/login"}),
	function(req, res){
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});
function isLoggedIn(req, res, next){
	 if(req.isAuthenticated()){
		 return next();
	 }
	 res.redirect("/login");
 }

function checkCouponOwnership(req, res, next){
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



app.listen(3000, function(){
	console.log("START!!!!!!!!!!!!!");
});
