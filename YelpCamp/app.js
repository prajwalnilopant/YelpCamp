if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ejsMate = require('ejs-mate');
const { link } = require('fs');
const Campground = require('./models/campground');
const Review = require('./models/review');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'); //Security package to prevent Mongo Injection, 


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { MongoStore } = require('connect-mongo');
const MongoDBStore = require("connect-mongo")(session); // To store the session info on mongo instead of Memorey store.

const dbUrl = process.env.DB_URL;
//Change dbUrl to 'mongodb://127.0.0.1:27017/yelp-camp' for development connect to the local host 
// Change dbUrl to process.env.DB_URL for production while deploying.
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(mongoSanitize({
    replaceWith: '_'
}));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //This line is used to serve static assets

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //(milliseconds*minutes*hour*day*week) this is for the cookie to expire after a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// Helmet related code
app.use(helmet({ contentSecurityPolicy: false })); //Helmet is another securty package that we can use
// If we want to include any new website source, fonts i.e. whichever is external to the application needs to be included below.
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/deamcmwnd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session()); //passport.session makes sure that our application has pesistent login sessions. passport.session() should be declared after session() in line 45 is declared.
passport.use(new LocalStrategy(User.authenticate())); //Here, we are telling to use the LocalStrategy package that is required and for that the authentication method should be "authenticate()" which is added by the plugin method in user.js file and the model to use will be the User Model. 

passport.serializeUser(User.serializeUser()); // Tells how to serialize the user. Serialization refers to on how we store the user on to the session. 
passport.deserializeUser(User.deserializeUser()); // Deserialization refers to on how we remove the user from the session.

app.use((req, res, next) => {
    res.locals.currentUser = req.user;  //The user attrbute gives us the id, username and email. And this property is provided by passport. 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// This code is used as a part of breaking the routes using Express router. 
// The below /campgrounds will be prefiex to every route which is there in the routes file. For example, to view all the campgrounds the route was "/campgrounds" now, we can write "/".
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})



