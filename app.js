require('dotenv').config;

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')
const session = require('express-session');
const methodOverride = require('method-override');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(expressLayout);
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));

app.set('view engine', 'ejs');
app.set('layout', './layouts/main');    //Main.ejs is declares as an layout

app.locals.isActiveRoute = isActiveRoute; 

app.use('/', require('./server/routes/main'))   //on index request, it will route to ./server/routes/main
app.use('/', require('./server/routes/admin'));

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
})