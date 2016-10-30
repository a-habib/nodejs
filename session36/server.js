var express = require('express');
var mongodb = require('mongodb').MongoClient;

// above assumes npm modules 'express' and 'mongodb' are installed
// can find out by using command 'npm list --depth 0'


var dbHost = process.env.IP || '127.0.0.1';
var connStr = 'mongodb://' + dbHost + ':27017/test';

var server = express();
server.listen(process.env.PORT || 3000);

server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //CORS setting 
    next();
});

// route to query differnt types of landmarks available
server.get('/getProperty', function(req,res){
	console.log("Requesting " + req.url);
	mongodb.connect(connStr, function(err, dbConn) {
		if (err) throw err;
		var coll = dbConn.collection('lm');
		var groupStage = {"$group" : {"_id" : "$properties.TYPEDESC"} };
		var sortStage = {"$sort" : {"_id" : 1}};
		//var limitStage = {"$limit" : 5};
		var cursor = coll.aggregate([groupStage, sortStage]);
		cursor.toArray( function(err,docs){
            if (err) throw err;
            res.json({"typedesc":docs});
            dbConn.close();
        });
	});
});

// route to query all landmarks given a specific landmark type from the request
server.get('/filterByPropertyType=*', function(req,res){
	console.log("Requesting " + req.url);
	var parameter = decodeURIComponent(req.url.slice(req.url.indexOf('=')+1));
	console.log(parameter);
    mongodb.connect(connStr, function(err, dbConn) {
        if (err) throw err;
        var coll = dbConn.collection('lm');
        
        // this filter has two conditions on fields 
        // "properties.TYPEDESC" and "geometry"
        // implicit 'and' (as opposed to 'or')
        var query = { 
            "properties.TYPEDESC": parameter,
            "geometry" : { 
                "$nearSphere" : { 
                    "$geometry" : { 
                        "type" : "Point" ,
                        "coordinates" : [ -79.6436414, 43.5875534 ] 
                    } ,
                    "$maxDistance" : 1500
                } 
            } 
        };
        
        // note re:regular expression operator
        // above can use something like: "properties.TYPEDESC" : { "$regex": /^police/i } ,
        // matches any TYPEDESC that starts with the letters 'police', case insensitive
        
        var proj = {"_id":0};
        
        var cursor = coll.find(query, proj);
        
        cursor.toArray( function(err,docs){
            if (err) throw err;
            res.json({"type":"FeatureCollection","features":docs});
            dbConn.close();
        });
       
    });
});

/*server.get('/', function(req,res){
	console.log("Requesting " + req.url);
    mongodb.connect(connStr, function(err, dbConn) {
        if (err) throw err;
        var coll = dbConn.collection('lm');
        
        // this filter has two conditions on fields 
        // "properties.TYPEDESC" and "geometry"
        // implicit 'and' (as opposed to 'or')
        var query = { 
            "properties.TYPEDESC": "PARKS",
            "geometry" : { 
                "$nearSphere" : { 
                    "$geometry" : { 
                        "type" : "Point" ,
                        "coordinates" : [ -79.6436414, 43.5875534 ] 
                    } ,
                    "$maxDistance" : 500
                } 
            } 
        };
        
        // note re:regular expression operator
        // above can use something like: "properties.TYPEDESC" : { "$regex": /^police/i } ,
        // matches any TYPEDESC that starts with the letters 'police', case insensitive
        
        var proj = {"_id":0};
        
        var cursor = coll.find(query, proj);
        
        cursor.toArray( function(err,docs){
            if (err) throw err;
            res.json({"type":"FeatureCollection","features":docs});
            dbConn.close();
        });
       
    });
});*/
