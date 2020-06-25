module.exports={

    matchAll:function(post,query){

        if(post.title.includes(query) || post.body.includes(query));

        else
            post.remove();

    }

};

