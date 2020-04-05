var bodyParser    = require("body-parser"),
	methodOverride  = require("method-override"),
	expressSanitizer= require("express-sanitizer"),
	mongoose        = require("mongoose"),
	express         = require("express"),
	app             = express(),
	passport        = require("passport"),
	LocalStrategy   = require("passport-local"),
	Coupon          = require("./models/coupon"),
  User            = require("./models/user"),
	Used            = require("./models/used");


var graveyardRoutes = require("./routes/graveyard"),
		couponsRoutes   = require("./routes/coupons"),
    authRoutes      = require("./routes/auth");
var middleware = require("./middleware/index.js");

mongoose.connect("mongodb://localhost:27017/coupons_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

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

app.use(authRoutes);
app.use(couponsRoutes);
app.use(graveyardRoutes);


app.listen(3000, function(){
	console.log("START!");
});
