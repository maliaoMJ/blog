var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose');
  post = mongoose.model('Post');
  Category=mongoose.model('Category');

module.exports = function (app) {
  app.use('/posts', router);
};

router.get('/', function (req, res, next) {

      //筛选功能
      var filterObj={};
      if(req.query.keywords){
         filterObj.title=new RegExp(req.query.keywords.trim(),'i');
         filterObj.content=new RegExp(req.query.keywords.trim(),'i');

      }
  post.find(filterObj).sort('-created').populate('author').populate('category').exec(function (err, posts) {

    if (err) return next(err);
    var pageNum=Math.abs(parseInt(req.query.page || 1,10));
    var pageSize=9;
    var totalCount=posts.length;//文章总数
    var pageCount=Math.ceil(totalCount/pageSize);
    if(pageNum>pageCount){
      pageNum=pageCount;
    }
    res.render('blog/index', {
      title: '博客首页',
      posts: posts.slice((pageNum-1)*pageSize,pageSize*pageNum),
      pageNum:pageNum,
      pageCount:pageCount,
      keywords:req.query.keywords,
      pretty:true
    });
  });
});
router.get('/category/:name',function(req,res,next){
    Category.findOne({name:req.params.name}).exec(function(err,category){
        if(err){
          return next(err);
        }
        post.find({category:category,published:true})
        .sort('-created')
        .populate('category')
        .populate('author')
        .exec(function(err,posts){
           if(err){
             return next(err);
           }
           var pageNum=Math.abs(parseInt(req.query.page || 1,10));
           var pageSize=5;
           var totalCount=posts.length;//文章总数
           var pageCount=Math.ceil(totalCount/pageSize);
           if(pageNum>pageCount){
             pageNum=pageCount;
           }
           res.render('blog/category',{
             title:'文章分类',
             category:category,
             posts:posts,
             posts: posts.slice((pageNum-1)*pageSize,pageSize*pageNum),
             pageNum:pageNum,
             pageCount:pageCount,
             pretty:true
           });
        });
    });
});
router.get('/view/:id',function(req,res,next){
  if(!req.params.id){
    return next(new Error ('no post id provided'));
  }
  var conditions={};
  try{
    conditions._id=mongoose.Types.ObjectId(req.params.id);
  }catch(err){
    conditions.slug=req.params.id;
  }
  post.findOne(conditions)
  .populate('category')
  .populate('author')
  .exec(function(err,post){
      if(err){
        return next(err);
      }
      res.render('blog/view',{
        post:post,
        pretty:true
      });

  });
});
router.post('/comments/:id',function(req,res,next){
  //  res.jsonp(req.body);
  //post 提交过来的数据进行简单的校验
      if(!req.body.email || req.body.email==''){
        return next(new Error('email is not exit'));
      }
      if(!req.body.content || req.body.content==''){
        return next(new Error('content is not exit'));
      }
      if(!req.params.id){
        return next(new Error("don't provided id"));
      }
      var conditions={};
      try{
        conditions._id=mongoose.Types.ObjectId(req.params.id);
      } catch(err){
        conditions.slug=req.params.id;
      }
      post.findOne(conditions).exec(function(err,post){
             if(err){
               return next(new Error ('database is error '));
             }
             var comment={
               email:req.body.email,
               content:req.body.content,
               date:new Date()
             }
             post.comments.unshift(comment);
             post.markModified('comments');
             post.save(function(err,post){
               if(err){
                 return next(new Error ('comments save not ok'));
               }
               req.flash('info','评论添加成功！');
               res.redirect('/posts/view/'+post.slug);
             });
      });
});
router.get('/favorite/:id',function(req,res,next){
      if(!req.params.id){
        return next(new Error('no post id provided'));
      }
      var conditions={};
      try{
        conditions._id=mongoose.Types.ObjectId(req.params.id);
      }catch(err){
        conditions.slug=req.params.id;
      }
      post.findOne(conditions).exec(function(err,post){
          post.meta.favorites=post.meta.favorites ? post.meta.favorites+1 : 1;
          post.markModified('meta');
          post.save(function(err){
            res.redirect('/posts/view/'+post.slug);
          });
      });
});
