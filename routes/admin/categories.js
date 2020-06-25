const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

router.all('/*',(req,res,next)=>{

    req.app.locals.layout = 'admin';
    next();

});

router.get('/',(req,res)=>{

    Category.find({}).then(categories=>{

        res.render('admin/categories/index',{categories:categories});

    })


});

router.get('/edit/:id',(req,res)=>{

    Category.findOne({_id:req.params.id}).then(category=>{

        res.render('admin/categories/edit',{category:category});

    });
});


router.put('/edit/:id',(req,res)=>{

    Category.findOne({_id:req.params.id}).then(category=>{

        category.name = req.body.name;
        category.save().then(category=>{

            res.redirect('/admin/categories');


        })

    });
});




router.post('/create',(req,res)=>{

    const newCat = new Category({

        name: req.body.name


    });

    newCat.save().then(cat=> {

        res.redirect('/admin/categories');
    });

});

router.delete('/delete/:id', (req,res)=>{

    Category.remove({_id:req.params.id}).then(result=>{

        req.flash('success_message','Item successfully deleted');
        res.redirect('/admin/categories');

    })


});

module.exports = router;
