var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var user = require('../config/user');
var alert = require('alert-node');

var con = mysql.createConnection({
  host: "localhost",
  user: "nitin",
  password: "password",
  database: "insta"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
 });

/* GET home page. */
router.get('/', function(req, res, next) {

  console.log(req.session.id);
  //res.send('Old API');
  if(req.session.id1 > 0)
  {
    console.log(req.session.id1);
    user.getFeed(req,con,function(pos){
      const results = {
        profile  : req.session.profile,
        uid :  req.session.id1,
        hand : req.session.handle,
        name : "Nitin Chakre",
        post : pos 
      };
      res.json(results);
    });
  }
  
  /* if(req.session.handList){
    if(req.session.id1>0)
    {
      user.getFeed(req,con,function(pos){
        res.render('index', { title: 'Express',handle : req.session.handle, id : req.session.id1,profile : req.session.profile,post : pos, handList : req.session.handList});
      });
  
    /*}
      else
      res.redirect('signin');
  }
  else{
    user.gethandList(req,con,function(){
      if(req.session.id1>0)
      {
        user.getFeed(req,con,function(pos){
          res.render('index', { title: 'Express',handle : req.session.handle, id : req.session.id1,profile : req.session.profile,post : pos, handList : req.session.handList});
        });
    
      }
        else
        res.redirect('signin');
    });
  }*/
});

router.get('/signin',function(req,res,next){
  res.render('signin');
});

router.get('/signup',function(req,res,next){
  res.render('signup');
});

router.post('/signup',function(req,res,next){
  user.userSignup(req,con,function(){
      req.session.handle = req.body.handle;
      res.redirect('/');
  });
});

router.post('/signin',function(req,res,next){
        console.log(req.body);
        user.userSignin(req,con,function(){
          if(req.session.id1>0){
            console.log(req.session.id);
            req.session.handle = req.body.handle;
            res.send("1");
          }
          else{
            res.send("0");
          }
      });
   /* user.userSignin(req,con,function(){
        if(req.session.id1>0){
          req.session.handle = req.body.handle;
          res.redirect('/');
        }
        else{
          alert('Failed Login');
          res.redirect('/signin');
        }
    });*/
});

router.get('/profile',function(req,res,next){

    //console.log(req.query.id1);
    user.userProfile(req,con,function(prof,hand,nam,followe,followi,fl,pos){
    
          const result = {
            profile : prof,
            handle : hand,
            name : nam,
            followers : followe,
            following : followi,
            post : pos
          }

          res.json(result);
      //  res.render('profile',{profile : prof,handle :hand,name : nam,id : req.query.id1,followers : followe,following : followi,flag : fl, post:pos});
    });
});

router.get('/follow',function(req,res,next){
    user.follow(req,con,function(){
        res.redirect('/profile/?id1='+req.query.id1);
    });
});

router.get('/unfollow',function(req,res,next){
  user.unfollow(req,con,function(){
      res.redirect('/profile/?id1='+req.query.id1);
  });
});

router.get('/followers',function(req,res,next){
  user.showFollowers(req,con,function(foll){
    res.render('followers',{follow : foll});
  });
});

router.get('/following',function(req,res,next){
  user.showFollowing(req,con,function(foll){
    res.render('followers',{follow : foll});
  }); 
});

router.get('/newPost' , function(req,res,next){
    res.render('newPost');
});

router.post('/newPost' , function(req,res,next){
    user.addNewPost(req,con,function(){
      res.redirect('/profile/?id1='+req.session.id1)
    });
});

router.get('/post' ,function(req,res,next){
  user.showPost(req,con,function(post){
    res.json(post);
    //res.render('post',{pos : post});
  });
});

router.post('/postCom',function(req,res,next){
  user.postCom(req,con,function(){
      res.redirect('/post/?pid='+req.query.pid);
  });
});

router.get('/showCom',function(req,res,next){
    user.commCom(req,con,function(comm){
        res.render('comm.hbs',{com1 : comm,cid : req.query.cid})
    });
})

router.post('/postCom1',function(req,res,next){
  user.postCom1(req,con,function(){
      res.redirect('/showCom/?cid='+req.query.cid);
  });
});

router.post('/search',function(req,res,next){
  user.getUser(req,con,function(result){
    if(result.length > 0)
      res.redirect('/profile/?id1='+result[0].userId);
    else{
      alert('No such user found');
      res.redirect('/');
    }
      
  })
})
module.exports = router;
