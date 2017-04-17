var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
   res.redirect('/posts');
});
router.get('/posts/download',function(req,res,next){
    res.render('blog/download',{
        title:'DownLoad Resource',
        pretty:true

    });
});

