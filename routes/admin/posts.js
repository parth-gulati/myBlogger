const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const {isEmpty,uploadDir} = require('../../helpers/upload-helper');
const path = require('path');
const fs = require('fs');
const {userAuthenticated} = require('../../helpers/authentication');
const Category = require('../../models/Category');



router.all('/*',userAuthenticated, (req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res)=>{

    Post.find({})
        .populate('category')
        .then(posts=>{

        res.render('admin/posts/index', {posts:posts});

    });


});

router.get('/create',(req,res)=>{

    Category.find({}).then(categories=>{

        res.render('admin/posts/create',{categories:categories});

    });


});

router.post('/create',(req,res)=>{
/*
    let errors = [];

    if(!req.body.title){
        errors.push({message:'Please add a title'});
    }

    if(!req.body.body){
        errors.push({message:'Please add a description'});
    }

    if(!req.body.file){
        errors.push({message:'Please upload an image'});
    }

    if(errors.length>0){
        res.render('admin/posts/create', {
            errors: errors
        })

    } else {*/

        let filename='lambo.jpg';

        if(!isEmpty(req.files)) {
            console.log('Aint empty');

            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err) => {
                if (err)
                    throw err;
            });

            console.log(req.files);



            let allowComments = true;
            if (req.body.allowComments) {
                allowComments = true;
            } else
                allowComments = false;

            const newPost = new Post({

                user: req.user.id,
                title: req.body.title,
                status: req.body.status,
                allowComments: allowComments,
                body: req.body.body,
                file: filename,
                category:req.body.category

            });

            newPost.save().then(saved => {

                req.flash('success_message',`Post \"${saved.title}\" was created successfully`);

                res.redirect('/admin/posts/my-posts');


            }).catch(err => console.log(err));

        }else{
            console.log('empty bitch');
        }





    //}


});

router.get('/edit/:id',(req,res)=>{

    //res.send(req.params.id);

    Post.findOne({_id:req.params.id}).then(post=>{

        Category.find({}).then(categories=>{



        res.render('admin/posts/edit',{post:post,categories:categories});

        });
    });
});


router.put('/edit/:id',(req,res)=>{

    Post.findOne({_id:req.params.id})
        .then(post=>{

            if(req.body.allowComments)
                post.allowComments = true;
            else
                post.allowComments = false;

            post.user = req.user.id,
            post.title = req.body.title;
            post.body = req.body.body;
            post.status = req.body.status;
            post.category=req.body.category;

            let filename = "";
            if(!isEmpty(req.files)){

                let file = req.files.file;
                filename = Date.now() + '-' + filename;
                post.file = filename;

                file.mv('./public/uploads/' + filename, (err)=>{
                    if(err) throw err;
                });

            }


            post.save().then(saved=>{

                req.flash('success_message','Post successfully updated');

                res.redirect('/admin/posts/my-posts');

            }).catch(err=>console.log(err));



    });


});

router.delete('/:id',(req,res)=>{

    Post.findOne({_id:req.params.id})
        .populate('comments')
        .then(post=>{

            fs.unlink(uploadDir + post.file, (err)=>{
                if(err)
                    console.log(err);
                if(post.comments.length>=1){
                    post.comments.forEach(comment=>{
                        comment.remove();
                    });
                }

                post.remove();
                req.flash('success_message','Post successfully deleted');
                res.redirect('/admin/posts/my-posts');
            });

        }).catch(err=>console.log(err));

});

router.get('/my-posts/',(req,res)=>{


    Post.find({user:req.user.id})
        .populate('category')
        .then(posts=>{
            res.render('admin/posts/my-posts',{posts:posts});
        });


});


module.exports = router;