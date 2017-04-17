var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
    check = require('./User'),
  post = mongoose.model('Post');
  user=mongoose.model('User');
  Category=mongoose.model('Category');

module.exports = function (app) {
  app.use('/admin/categories', router);
};

router.get('/', check.requireLogin , function (req, res, next) {
    Category.find({}).sort('created').exec(function(err,categories){
        if(err){
         return next(new Error('categories database is error !'));
        }
               var pageNum=Math.abs(parseInt(req.query.page || 1,10));
                var pageSize=10;
                var totalCount=categories.length;//文章总数
                var pageCount=Math.ceil(totalCount/pageSize);
                if(pageNum>pageCount){
                  pageNum=pageCount;
                }
                res.render('admin/category/index', {
                  title: 'Category Manager',
                  categories: categories.slice((pageNum-1)*pageSize,pageSize*pageNum),
                  pageNum:pageNum,
                  pageCount:pageCount,
                  pretty:true
                });

    });  
 });
router.get('/add', check.requireLogin ,function(req,res,next){
      res.render('admin/category/add', {
            title: '类别添加',
            pretty:true
      });
});
router.post('/add',function(req,res,next){
  // res.jsonp(req.body);
        var categoryName=req.body.category.trim();
         console.log(categoryName+'--------------------------running here-------------------------');
         var category= new Category({
                  name:categoryName,
                  slug:categoryName,
                  created:new Date()
         });
     category.save(function(err,category){
              if(err){        
                req.flash('error','保存失败！');
                res.redirect('/admin/categories/add');
              }else{
                req.flash('info','保存成功！');
                res.redirect('/admin/categories');
                 }


     });
      
});
router.get('/delete/:id', check.requireLogin ,function(req,res,next){
      if(! req.params.id){
          return next(new Error('no category id'));
      }
      // console.log(req.params.id+'--------------------------------------------------');
      Category.remove({_id:req.params.id}).exec(function(err,Removed){
                if(err){
                  return next(new Error('remove category no success'))
                }
                if(Removed){
                    post.remove({category:req.params.id}).exec(function(err,RemovedPost){
                         if(err){
                            return next(new Error('remove posts no success'));
                         }
                         if(RemovedPost){
                          req.flash('info','删除成功！');
                         }else{
                          req.flash('info','删除失败！');
                         }
                        res.redirect('/admin/categories'); 
                    });
                }else{
                   req.flash('info','删除失败！');
                   res.redirect('/admin/categories'); 
                }

      });
      
});
