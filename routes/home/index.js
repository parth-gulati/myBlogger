const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {userAuthenticated} = require('../../helpers/authentication');
const {matchAll} = require('../../helpers/search');

router.all('/*',(req,res,next)=>{

    req.app.locals.layout = 'home';
    next();

});

router.get('/category/:id',(req,res)=>{


    const perPage = 10;
    const page = req.query.page || 1;

    req.session.patty = 'Pattypan';

    Post.find({status:'public',category:req.params.id})

        .skip(perPage* page - perPage)
        .limit(perPage)
        .then(posts=>{

            Post.count().then(postCount=>{

                postCount=posts.length;
                var voidResult = false;
                if(posts.length===0)
                    voidResult=true;

                Category.find({}).then(categories=> {

                    res.render('home/index', {
                        posts: posts,
                        categories:categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount/perPage),
                        user: ((req.user)?true:false),
                        voidResult: voidResult

                    });

                });


            });

        });




})

router.post('/search',(req,res)=>{


    const perPage = 10;
    const page = req.query.page || 1;
    const query = req.body.query;

    req.session.patty = 'Pattypan';

    Post.find({status:'public'})

        .skip(perPage* page - perPage)
        .limit(perPage)
        .then(posts=>{

            var result = [];
            posts.forEach((post)=>{

                var tit = post.title.toLowerCase();
                if(tit.includes(query.toLowerCase()))
                    result.push(post);

            });

            var voidResult=false;
            if(result.length==0)
                voidResult=true;
            else
                voidResult=false;

            Post.count().then(postCount=>{

                postCount=posts.length;

                Category.find({}).then(categories=> {

                    res.render('home/index', {
                        posts: result,
                        categories:categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount/perPage),
                        user: ((req.user)?true:false),
                        voidResult: voidResult
                    });

                });


            });

        });

    /* if(req.session.patty) {

         console.log(`we found ${req.session.patty}`);

     }
 */


});


router.get('/',(req,res)=>{

    const perPage = 10;
    const page = req.query.page || 1;

    req.session.patty = 'Pattypan';

    Post.find({status:'public'})

        .skip(perPage* page - perPage)
        .limit(perPage)
        .then(posts=>{

        Post.count().then(postCount=>{

            Category.find({}).then(categories=> {

                res.render('home/index', {
                    posts: posts,
                    categories:categories,
                    current: parseInt(page),
                    pages: Math.ceil(postCount/perPage),
                    user: ((req.user)?true:false)
                });

            });


        });

    });

   /* if(req.session.patty) {

        console.log(`we found ${req.session.patty}`);

    }
*/


});

router.get('/about',(req,res)=>{

    res.render('home/about');

});

router.get('/login',(req,res)=>{

    res.render('home/login');

});

router.get('/logout',(req,res)=>{

    req.logOut();
    res.redirect('/login');
})

//APP LOGIN

passport.use(new LocalStrategy({usernameField: 'email'}, (email,password,done)=>{

    User.findOne({email:email}).then(user=>{

        if(!user)
        {
            return done(null, false, {message: 'No user found'});
        }

        bcrypt.compare(password,user.password,(err,matched)=>{
            if(err) throw err;
            if(matched){
                return done(null,user);
            }else{
                return done(null,false,{message:'Incorrect password'});
            }
        });

    });

}));

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    });
});


router.post('/login',(req,res,next)=>{

    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true

    })(req,res,next);



});

router.get('/register',(req,res)=>{

    res.render('home/register')

});

router.post('/register',(req,res)=>{

    let errors = [];

    if(req.body.password !== req.body.passwordConfirm){

        errors.push({message:'Password fields don\'t match'});

    }

    if(errors.length>0){
        res.render('home/register',{
            errors:errors,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email: req.body.email,

        });
    } else{

        User.findOne({email:req.body.email}).then(user=>{
            if(!user){

                const newUser = new User({

                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password

                });

                bcrypt.genSalt(10, (err,salt)=>{

                    bcrypt.hash(newUser.password,salt,(err,hash)=>{

                        newUser.password = hash;
                        newUser.save().then(savedUser=>{

                            req.flash('success_message','You are now registered, please login');
                            res.redirect('/login');

                        });

                    });

                });


            }else{
                req.flash('error_message','Email already exists');
                res.redirect('/login');

            }
        })





    }



});

router.get('/post/:slug',(req,res)=>{

    Post.findOne({slug: req.params.slug})
        .populate({path:'comments', match: {approveComment: true}, populate: {path:'user',model:'users'}})
        .populate('user')
        .then(post=>{


        Category.find({}).then(categories=>{

        res.render('home/post',{post:post,categories:categories});

        });

    });

});

module.exports = router;