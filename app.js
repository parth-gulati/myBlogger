const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');

mongoose.Promise = global.Promise;

mongoose.connect(mongoDbUrl).then((db)=>{

    console.log('MONGo ConNeCtEd');

}).catch(err=>console.log(err));

//Body Parser

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Upload Middleware
app.use(upload());

//Method Override
app.use(methodOverride('_method'));

//Load sessions
app.use(session({

    secret: 'patty',
    resave: true,
    saveUninitialized: true

}));

app.use(flash());

//passport

app.use(passport.initialize());
app.use(passport.session());

//Local variables using middleware

app.use((req,res,next)=>{

    res.locals.user = req.user || null;

    res.locals.error = req.flash('error');

    res.locals.success_message = req.flash('success_message');

    res.locals.error_message = req.flash('error_message');

    next();

});


//Load routes

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const comments = require('./routes/admin/comments');
const categories = require('./routes/admin/categories');

app.use(express.static(path.join(__dirname,'public')));

//Set View Engine

const {paginate, select, generateTime} = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphbs({defaultLayout: 'home',helpers: {select:select, generateTime:generateTime, paginate:paginate}}));
app.set('view engine', 'handlebars');

//Use routes

app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);


const port = process.env.PORT || 4200;

app.listen(port,()=>{

    console.log(`I'm listenin ${port}`);

});