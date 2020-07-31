module.exports = {
    userSignup : function(req,con,callback){
        con.query("insert into users(handle,name,password,followers,following,noFollowers,noFollowing) values('"+req.body.handle+"','"+req.body.name+"','"+req.body.password+"','-1','-1',0,0);",function(err,result,fields){
            if(err) throw err;
            con.query("select userId from users where handle = '"+ req.body.handle+"';",function(err,result,fields){
                if(err) throw err;
                req.session.id1 = result[0].userId;
                console.log(req.session.id1);
                callback();
            });
        });
    },

    userSignin : function (req,con,callback){
        con.query("select userId,profile from users where handle='"+req.body.handle+"' and password='"+req.body.password+"';",function(err,result,fields){
            if(err) throw err;
            req.session.id1=-1;
            if(result.length > 0)
            {
                req.session.id1=result[0].userId;
                req.session.profile = result[0].profile;
            }
            callback();        
        });
    },

    userProfile : function(req,con,callback){
        con.query("select profile,handle,name,noFollowers,noFollowing,followers from users where userId = "+req.query.id1+";",function(err,result,fields){
            if(err) throw err;

            var arr = result[0].followers.split(",");
            var prof = result[0].profile;
            var hand = result[0].handle;
            var nam = result[0].name;
            var followe = result[0].noFollowers;
            var followi = result[0].noFollowing;
            var flag = false;

            /*for(var i=0;i<arr.length;i++){
                if(arr[i]==req.session.id1)
                    flag=true;
            }*/

            con.query("select post,comment from post where userId = "+req.query.id1+";",function(err,result,fields){
                if(err) throw err;
                var post = result;
  	   
              /*  for (var i =0;i<result.length ; i+=3){
                        post.push(result.slice(i,i+3));
                }*/

                callback(prof,hand,nam,followe,followi,flag,post);
            });
        });
    },

    follow : function(req,con,callback){
        con.query("select followers,noFollowers from users where userId="+req.query.id1+";",function(err,result,fields){
            if(err) throw err;
            var str = result[0].followers+","+req.session.id1;
            var no = result[0].noFollowers+1;
            con.query("update users set followers='"+str+"',noFollowers="+no+" where userId = "+req.query.id1+";",function(err,result,fields){
                if(err) throw err;
                con.query("select following,noFollowing from users where userId="+req.session.id1+";",function(err,result,fields){
                    if(err) throw err;
                    var str = result[0].following+","+req.query.id1;
                    var no = result[0].noFollowing+1;

                    con.query("update users set following ='"+str+"',noFollowing="+no+" where userId="+req.session.id1+";",function(err,result,fields){
                        callback();
                    });
                });
            });
        });
    },

    unfollow : function(req,con,callback){
        con.query("select followers,noFollowers from users where userId = "+req.query.id1+";",function(err,result,fields){
            if(err) throw err;
            var arr = result[0].followers.split(",");
            var num = result[0].noFollowers - 1;
            var str = "";

            for(var i=0;i<arr.length;i++){
                if(arr[i] != req.session.id1)
                    str = str + arr[i] + ",";
            }
            str = str.substring(0, str.length-1); 

            con.query("update users set followers ='"+str+"', noFollowers="+num+" where userId="+req.query.id1+";",function(err,result,fields){
                if(err) throw err;
                con.query("select following,noFollowing from users where userId = "+req.session.id1+";",function(err,result,fields){
                    if(err) throw err;
                    var arr = result[0].following.split(",");
                    var num = result[0].noFollowing - 1;
                    var str = "";
        
                    for(var i=0;i<arr.length;i++){
                        if(arr[i] != req.query.id1)
                            str = str + arr[i] + ",";
                    }
                    str = str.slice(0, -1); 
                
                    con.query("update users set following ='"+str+"', noFollowing="+num+" where userId="+req.session.id1+";",function(err,result,fields){
                        if(err) throw err;
                        callback();
                    });
                });
            });
        });
    },

    showFollowers : function(req,con,callback){
        con.query("select followers from users where userId = "+req.query.id1+";",function(err,result,fields){
            if(err) throw err;
            var str=result[0].followers;

            con.query("select userId,profile,handle,name from users where userId in ("+str+");",function(err,result,fields){
                if(err) throw err;
                var fol = result;
                callback(fol);
            })
        });
    },

    showFollowing : function(req,con,callback){
        con.query("select following from users where userId = "+req.query.id1+";",function(err,result,fields){
            if(err) throw err;
            var str=result[0].following;

            con.query("select userId,profile,handle,name from users where userId in ("+str+");",function(err,result,fields){
                if(err) throw err;
                var fol = result;
                callback(fol);
            })
        });
    },

    addNewPost : function(req,con,callback){
        con.query("insert into post(userId,post,comment) values("+req.session.id1+",'"+req.body.photoLink+"','"+req.body.comment+"');",function(err,result,fields){
            if(err) throw err;
            callback();
        });
    },

    getFeed : function(req,con,callback){
        var id = req.session.id1;
        //var id = req.query.id1;
        
        con.query("select following from users where userId = "+id+";",function(err,result,fields){
                if(err) throw err;
                var str = result[0].following;

                con.query("select userId,post,comment,postId from post where userId in ("+str+");",function(err,result,fields){
                    if(err) throw err;
                    var str1=""
                    var temp = result;
                    for(var i=0;i<result.length;i++)
                        str1+=result[i].userId+",";
                    
                    str1+="-1";

                    if(str.length>1){
                        con.query("select userId,profile,handle,name from users where userId in("+str1+");", function(err, result,fields){
                                if(err) throw err;
                                var post = [];
                                for(var i=0;i<result.length;i++){
                                    for(var j=0;j<temp.length;j++){
                                        if(result[i].userId == temp[j].userId){
                                            post.push({
                                                uid : result[i].userId,
                                                post : temp[j].post,
                                                comment : temp[j].comment,
                                                pid : temp[j].postId,
                                                profile : result[i].profile,
                                                hand : result[i].handle,
                                                name : result[i].name
                                            });
                                        }
                                    }
                                }

                                callback(post);
                        });
                    }
                    else{
                        var post;
                        callback(post)
                    }

                });
        });
    },

    showPost : function(req,con,callback){
        con.query("select postId,userId,post,comment from post where postId="+req.query.pid+";",function(err,result,fields){
            if(err) throw err;
            var pos1 = result[0];

            con.query("select comId,userId,comm from comments where type=1 and postId="+req.query.pid+";",function(err,result,fields){
                if(err) throw err;
                var pos = {
                    postId : pos1.postId,
                    userId : pos1.userId,
                    post : pos1.post,
                    comment : pos1.comment,
                    arr : result
                };

                callback(pos);
            });
        });
    },

    postCom : function(req,con,callback){
        con.query("insert into comments(type,postId,userId,comm) values(1,"+req.query.pid+","+req.session.id1+",'"+req.body.comm+"');",function(err,result,fields){
            if(err) throw err;
            callback();
        });
    },

    postCom1 : function(req,con,callback){
        con.query("insert into comments(type,postId,userId,comm) values(2,"+req.query.cid+","+req.session.id1+",'"+req.body.comm+"');",function(err,result,fields){
            if(err) throw err;
            callback();
        });
    },

    commCom : function(req,con,callback){
        con.query("select userId,comm from comments where comId = "+req.query.cid+";",function(err,result,field){
            if(err) throw err;
            var com1 = result[0];
            con.query("select userId,comm from comments where type=2 and postId ="+req.query.cid+";",function(err,result,fields){
                if(err) throw err;
                var com = {
                    userId : com1.userId,
                    comm : com1.comm,
                    arr : result
                }

                callback(com);
            });
        });
    },

    getUser : function(req,con,callback){
        con.query("select userId from users where handle = '"+req.body.hand+"';",function(err,result,fields){
            if(err) throw err;
            callback(result);
        });
    },

    gethandList : function(req,con,callback){
        con.query("select handle from users",function(err,result,fields){
            if(err) throw err;
            req.session.handList = result;
        });
        callback();
    }
};