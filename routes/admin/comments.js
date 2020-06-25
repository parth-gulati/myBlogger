const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',userAuthenticated,(req,res,next)=>{

    req.app.locals.layout = 'admin';
    next();

});


router.delete('/delete/:id',(req,res)=>{

    Comment.deleteOne({_id:req.params.id}).then(comment=>{

        Post.findOneAndUpdate({comments:req.params.id},{$pull: {comments: req.params.id}}, (err,data)=>{
            if(err) throw err;

        });

        res.redirect('/admin/comments');
    });


});


router.get('/', (req,res)=>{

    Comment.find({user:req.user.id}).populate('user')
        .then(comments=>{

        res.render('admin/comments/index',{comments:comments});

    });



})



router.post('/',(req,res)=>{

    Post.findOne({_id:req.body.idd}).then(post=>{

        const newComment = new Comment({

            user:req.user.id,
            body:req.body.body

        });

        post.comments.push(newComment);

        post.save().then(savedPost=>{

            newComment.save().then(comment=>{

                req.flash('success_message', 'Your comment will be reviewed shortly :)');
                res.redirect(`/post/${post.id}`);
            });

        });


    });

/*
    res.send('it works');*/
});


router.post('/approve-comment',(req,res)=>{

    console.log(req.body.approveComment);
    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}},(err,result)=> {
        if (err) return err;

        res.send(result);

    });

});

module.exports = router;