var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chakre123",
  database: "test"
});
con.connect(function(err) {
		if (err) throw err;
			console.log("Connected!");
});
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index',{success : false});
});

router.post('/insert',function(req,res,next){
	
		var sql = "INSERT INTO temp(roll, name, email) VALUES ('"+req.body.roll+"', '"+req.body.name+"', '"+req.body.email+"')";
	
		con.query(sql, function (err, result) {
			if (err) throw err;
				console.log("1 record inserted");
  		});
	res.redirect('/');
});

router.get('/display',function(req,res,next){
	var array=[];
			
	var sql = "select * from temp";

	con.query(sql, function (err, result,fields) {
		if (err) 
			throw err;
		var cursor = result;
		
		console.log(cursor);
		
		cursor.forEach(function(doc,err){
			array.push(doc);
		},function(){
			res.render('index',{item : array,success : true});
		});
		res.render('index',{item : array,success : true});
	});
});
module.exports = router;
