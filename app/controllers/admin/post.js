var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  slug=require('slug'),
  pinyin=require('pinyin'),
  check = require('./User'),
  post = mongoose.model('Post');
  Category=mongoose.model('Category');
  User=mongoose.model('User')

module.exports = function (app) {
  app.use('/admin/posts', router);
};

router.get('/', check.requireLogin , function (req, res, next) {
      // res.jsonp(req.query);
      //排序功能
      var sortby=req.query.sortby?req.query.sortby:'created';
      var sortdir=req.query.sortdir?req.query.sortdir:'asc';//默认降序
      if(['title','category','author','created','published'].indexOf(sortby)===-1){
        sortby='created';
      }
      if(['desc','asc'].indexOf(sortdir)===-1){
        sortdir='desc';
      }
      var sortObject={};
      sortObject[sortby]=sortdir;
      //筛选功能
      var filterObj={};
      if(req.query.category){
          filterObj.category=req.query.category.trim();
      }
      if(req.query.author){
          filterObj.author=req.query.author.trim();
      }
      if(req.query.keywords){
         filterObj.title=new RegExp(req.query.keywords.trim(),'i');
         filterObj.content=new RegExp(req.query.keywords.trim(),'i');

      }
      User.find().exec(function(err,authors){
        if(err){
          return next(new Error('database is error'));
        }
         post.find(filterObj)
        .sort(sortObject)
        .populate('author')
        .populate('category')
        .exec(function (err, posts) {

                if (err) return next(err);
                // 分页
                var pageNum=Math.abs(parseInt(req.query.page || 1,10));
                var pageSize=15;
                var totalCount=posts.length;//文章总数
                var pageCount=Math.ceil(totalCount/pageSize);
                if(pageNum>pageCount){
                  pageNum=pageCount;
                }
                res.render('admin/post/index', {
                  title: '博客后台',
                  posts: posts.slice((pageNum-1)*pageSize,pageSize*pageNum),
                  pageNum:pageNum,
                  pageCount:pageCount,
                  sortby:sortby,
                  sortdir:sortdir,
                  authors:authors,
                  filter:{
                    category:req.query.category || '',
                    author:req.query.author || '',
                    keywords:req.query.keywords
                  },
                  pretty:true
                });
      });



       });
    });
  router.get('/delete/:id', check.requireLogin , function (req, res, next) {
    if(!req.params.id){
      return next(new Error('no req.params.id'));
    }

    post.remove({_id:req.params.id}).exec(function(err,rowsRemoved){
        if(err){
          return next(new Error('datase has some error '));
        }
        if(rowsRemoved){

          req.flash('info','删除成功！');
        }
        else{
          req.flash('info','删除失败！');
        }
        res.redirect('/admin/posts/');



    });
  });
  router.get('/edit/:id', check.requireLogin ,function(req,res,next){
    if(!req.params.id){
      return next(new Error('no posts id provided!'));
    }

    post.findOne({_id:req.params.id})
    .populate('category')
    .populate('author')
    .exec(function(err,post){
      res.render('admin/post/edit',{
        title:'文章编辑',
        post:post,
        pretty:true
      });
  });
});
router.post('/edit/:id',function(req,res,next){
        // res.jsonp(req.body)
         if(!req.params.id){
             return next(new Error('no post id'));
         }
           console.log("-------------------"+req.params.id);
           post.findOne({_id:req.params.id}).exec(function(err,post){
                    if(err){
                      return next(new Error('post database is contact is error'));
                    }
                    console.log(req.body);
              // 后端数据校验
       req.checkBody('title','文章标题不能为空！').notEmpty();
       req.checkBody('category','必须指定文章的分类！').notEmpty();
       req.checkBody('content','文章内容不能为空!').notEmpty();

       var errors=req.validationErrors();
          if(errors){
            req.flash('error','修改失败！');
            return res.render('admin/post/edit',{
              errors:errors,
              title:req.body.title,
              content:req.body.content
             }); 
          } 
         
        var title=req.body.title.trim();
        var category=req.body.category.trim();
        var content =req.body.content;
        var py=pinyin(title,{
                  style:pinyin.STYLE_NORMAL,
                  heteronym:false,
              }).map(function(item){
                return item[0];
              }).join(' ');
              console.log('--------------'+py+'--------------');
              post.category=category;
              post.title=py;
              post.content=content;


              post.save(function(err,post){
                    if(err){
                  
                  req.flash('error','编辑失败！');
                  res.redirect('/admin/posts/add');
                }else{
                  req.flash('info','编辑成功！');
                  res.redirect('/admin/posts');
                   }

              });
         });
});
//增加文章
router.get('/add', check.requireLogin ,function(req,res,next){
    Category.find().exec(function(err,category){
      if(err){
        return  next(new Error ('datase is error '));
      }
      res.render('admin/post/add',{
        title:'添加文章',
        pretty:true
     });

    } ); 
     
});
router.post('/add',function(req,res,next){
    // 后端数据校验
     req.checkBody('title','文章标题不能为空！').notEmpty();
     req.checkBody('category','必须指定文章的分类！').notEmpty();
     req.checkBody('content','文章内容不能为空!').notEmpty();

     var errors=req.validationErrors();
      console.log('---------------------------run here----------------------------');
        if(errors){
          req.flash('error','保存失败！');
          return res.render('admin/post/add',{
            errors:errors,
            title:req.body.title,
            content:req.body.content
           }); 
        } 
       
    // res.jsonp(req.body);
      var title=req.body.title.trim();
      var category=req.body.category.trim();
      var content =req.body.content;

      User.findOne({},function(err,author){
            if(err){
             return next(new Error('error'));
            }
            var py=pinyin(title,{
                style:pinyin.STYLE_NORMAL,
                heteronym:false,
            }).map(function(item){
              return item[0];
            }).join(' ');
            console.log('--------------'+py+'--------------');
            var Post=new post({
                        title:py,
                        slug:(title),
                        category:category,
                        content:content,
                        author:author,
                        published:true,
                        meta:{favorite:0},
                        comments:[],
                        created:new Date()
               });
            Post.save(function(err,post){
              if(err){
                
                req.flash('error','保存失败！');
                res.redirect('/admin/posts/add');
              }else{
                req.flash('info','保存成功！');
                res.redirect('/admin/posts');
                 }

            });
      });
       
  });
