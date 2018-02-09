var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

//  mongoose module
var mongoose = require('mongoose');

var middlewares = require('./myMiddlewares.js');

var bodyParser = require('body-parser');

app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

//database

var databasePath = "mongodb://localhost/myblogApp";

db = mongoose.connect(databasePath);

mongoose.connection.once('open', function() {
    console.log("Success! Database is now connected!");
});

// model file
var sampleBlog = require('./blogModel.js');

var blogModel = mongoose.model('Blog');

// Application Middleware to log user data
app.use(function(req, res, next) {
console.log('///////////////////////*//////////////////////////////////');
    console.log("HostName",req.hostname);//name of the host
    var x = new Date();
    console.log("Date and time Log:",x.toString());//date and time 
    console.log("Protocol Log:",req.protocol);
    console.log("Path Log:",req.path);
    console.log("Method Log:",req.method);
    console.log("Ip address Log:",req.ip);
    console.log('///////////////////////*//////////////////////////////////');

    console.log("Logging started");
    console.log("User requested " + req.originalUrl);
    console.log("User's IP adress: " + req.ip);
    console.log("Logging ended");
    req.someGuy ={
        name:"SomeGuy",
        email:"somemail"
    };
    next(); 
});

app.get('/normal/route', function(request, response) {
    var dateOfBirth = new Date(request.query.dob);
    console.log(request.someGuy.name);
    response.send("Hi, Welcome to My Blog Application! Use '/blog/create' to create a blog, '/blog/_Id' to find a blog, '/blogs' to see all blogs, '/blog/edit/_Id' to edit a blog, '/blog/delete/_Id' to delete a blog. Thank You!  ");

});

app.get('/restricted/route', middlewares.ageFilter,function(request, response) {
    var dateOfBirth = new Date(request.query.dob);

    response.send("I am"+ request.age + " years old and I can use this route");

});

app.get('/', function(request, response) {

    response.send("Hi, Welcome to My Blog Application! Use '/blog/create' to create a blog, '/blog/_Id' to find a blog, '/blogs' to see all blogs, '/blog/edit/_Id' to edit a blog, '/blog/delete/_Id' to delete a blog. Thank You!  ");

});

// GET request for all blogs

app.get('/blogs', function(req, res) {

    blogModel.find(function(err, result) {

        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});


//POST request to create a blog
app.post('/blog/create', function(req, res) {

    var newBlog = new blogModel({

        title: req.body.title,
        subtitle: req.body.subtitle,
        blogBody: req.body.blogBody
    });
    var today = Date.now();
    newBlog.created = today;

    newBlog.authorInfo = {
        authorName: req.body.name,
        authorEmail: req.body.email
    };

    newBlog.tags = (req.body.tags != undefined && req.body.tags != null) ? req.body.tags.split(',') : '';

    // save blog
    newBlog.save(function(err, result) {
        if (err) {

            if(err.errors.hasOwnProperty('title')){
                if (err.errors.title.kind = "unique")
                    console.log("Enter unique title " + err.errors.title.kind);
            }

            res.send(err);
        } else {
            res.send(newBlog);
        }
    });

});


//GET request to find a particular blog

app.get('/blog/:Id', function(req, res) {

    blogModel.findOne({
        '_id': req.params.Id
    }, function(err, result) {
        if (err) {
            console.log("Error");
            res.send(err);
        } else {
            res.send(result);
        }
    });

});


//PUT request to Edit a blog
app.put('/blog/edit/:Id', function(req, res) {

    var update = req.body;

    //Find one blog and update it.

    blogModel.findOneAndUpdate({
        "_id": req.params.Id
        }, update, function(err, result) {

        if (err) {
            res.send(err);
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }

    }); // findOneAndUpdate ends

}); //PUT request ends


// POST request to Delete a blog
app.post('/blog/delete/:Id', function(req, res) {

        blogModel.remove({
            _id: req.params.Id
        }, function(err, result) {

            if (err) {
                res.send(err);
            } else {
                //res.send(res)
                res.json({
                    Info: "aah! Blog Deleted Successfully! "
                });
            }

        }); //  remove blog ends

}); //POST request  ends


//route for commenting on a blog.
app.post('/blog/:id/comment',function(req, res, next) {

        blogModel.findOne({'_id':req.params.id},function(err , result){

            if(err)
            {
                console.log("sorry ID not available.");
                next(err);
            }
            else
            { 
                var y = new Date();
                timendate = y.toString();
                result.comments.push({ 
                    
                    Name     : req.body.commentorName,
                    comment  :req.body.commentBody,
                    commentedTime: timendate           
                });
            
                //save comment
                result.save(function(err){
                    if(err)
                        res.send(error);
                     else
                        res.send(result);
                });
            }

        })
});

//function for any other path i.e Error handler
app.get('*', function(request, response, next) {

    response.status = 404;
    next("Error Occured");
});

//function for any other path i.e Error handler
app.put('*', function(request, response, next) {

    response.status = 404;
    next("Error Occured");
});


//Error handling Middleware

app.use(function(err, req, res, next) {
    
    console.log("Error handler used");
    //console.error(err.stack);
    
    if (res.status == 404) {
        res.send("Enter Correct Path");
    } else {
        res.send(err);
    }  
});



app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});