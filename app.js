var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

//  mongoose module
var mongoose = require('mongoose');

//var middlewares = require('./myMiddlewares.js');

var bodyParser = require('body-parser');

app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

//database path
var databasePath = "mongodb://localhost/blogApp";

db = mongoose.connect(databasePath);
//to make connection
mongoose.connection.once('open', function() {
    console.log("Database connected Successfully!");
});

// model file 
var sampleBlog = require('./blogModel.js');
//var fs = require('fs');
//instance of model file
var blogModel = mongoose.model('Blog');

// Application Middleware to log user data
app.use(function(req, res, next) {

    console.log("HostName", req.hostname); //name of the host
    var ddate = new Date();
    console.log("Date:", ddate.toString()); //date and time 
    console.log("Protocol:", req.protocol);
    console.log("Path:", req.path);
    console.log("Method :", req.method);
    console.log("Url requested " + req.originalUrl);
    console.log("User's IP adress: " + req.ip);

    next();
});

//documentation 
app.get('/', function(request, response) {

    //response.send("Hello , Welcome to  Blog Application! Hit  Documentation for API info ! ");
    response.send("Hi, Welcome to Blog Application ! \n ***Documentation*** \n base url - http://localhost:3000/ \n Use \n 1) 'GET /blogs' to get all blogs, \n 2) 'GET /blog/:Id' to find particular blog, \n 3) 'POST /blog/create' to create a blog , \n 4) 'PUT /blog/edit/:Id' to edit a blog, \n 5) 'POST /blog/delete/:Id' to delete a blog, \n 6) 'POST /blog/comment/:Id to comment on blog' \n  Thank You!");

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
}); //end get request for all the blogs

//GET request to find a particular blog by ID

app.get('/blog/:Id', function(req, res) {

    blogModel.findOne({
        '_id': req.params.Id
    }, function(err, result) {
        if (err) {
            console.log(err);
            res.send("Please check Id");
        } else {

            //checks if result variable is null
            if (!result) {
                res.send("Invalid ID");
                console.log("Id Not avaialble in database");
            } else
                res.send(result);
        }
    });

}); //end to find particular blog by id



//POST request to create a blog

app.post('/blog/create', function(req, res) {

    //to save info to schema
    var newBlog = new blogModel({

        title: req.body.title,
        subtitle: req.body.subtitle,
        blogBody: req.body.blogBody
    });
    var today = Date.now();
    newBlog.created = today;

    //to save author info
    newBlog.authorInfo = {
        authorName: req.body.name,
        authorEmail: req.body.email
    };

    //to split by , of all the tags
    newBlog.tags = (req.body.tags != undefined && req.body.tags != null) ? req.body.tags.split(',') : '';

    // save blog
    newBlog.save(function(err, result) {

        if (err) {
            //to check if error is due to unique title 
            if (err.errors.hasOwnProperty('title')) {
                if (err.errors.title.kind = "unique")
                    console.log(err);
            }
            res.send("Enter unique title ");
        } else
            res.send(newBlog);
    }); //end save blog

}); //end post request to create blog



//PUT request to Edit a blog
app.put('/blog/edit/:Id', function(req, res) {

    var update = req.body;

    //Find one blog and update it.
    blogModel.findOneAndUpdate({
        "_id": req.params.Id
    }, update, function(err, result) {

        if (err) {
            //checks type of error
            if (err.hasOwnProperty('path')) {
                console.log(err);
                res.send("Invalid Id");
            } else if (err.hasOwnProperty('codeName')) {
                console.log(err);
                res.send("Title Should be Unique");
            } else {
                console.log(err);
                res.send(err);
            }
        } else {
            //checks if result variable is null
            if (!result) {
                res.send("Invalid ID");
                console.log("Id Not avaialble in database");
            } else
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
            console.log("error in delete function")
            res.send(err);
        } else {

            res.json({
                Info: "aah! Blog Deleted Successfully! "
            });
            console.log("delete success");
            console.log(result);
        }
    }); //  remove blog ends

}); //POST request  ends


//route for commenting on a blog.
app.post('/blog/comment/:id', function(req, res, next) {

    blogModel.findOne({
        '_id': req.params.id
    }, function(err, result) {

        if (err) {
            console.log(err);
            res.send("Check Your ID");
        } else {

            //if result is not null 
            if (result) {
                var ddate = new Date();
                timendate = ddate.toString();

                result.comments.push({
                    Name: req.body.commentorName,
                    comment: req.body.commentBody,
                    commentTime: timendate
                });

                //save comment
                result.save(function(err) {
                    if (err) {
                        console.log("Save comment erorr");
                        res.send(err);
                    } else
                        res.send(result);
                });
            } else {
                res.send("check Your ID");
                console.log("Id not avaialble in database");
            }
        }

    })
});

//function for any other path for get request i.e Error handler
app.get('*', function(request, response, next) {

    response.status = 404;
    next("Error Occured");
});

//function for any other path for put request i.e Error handler
app.put('*', function(request, response, next) {

    response.status = 404;
    next("Error Occured");
});

//function for any other path for post request i.e Error handler
app.post('*', function(request, response, next) {

    response.status = 404;
    next("Error Occured");
});

//Error handling Middleware 
//application level middleware
app.use(function(err, req, res, next) {

    console.log("Error handler used");
    //console.error(err.stack);

    if (res.status == 404) {
        res.send("Check your Path , Please refer Documentation for API Info");
    } else {
        res.send(err);
    }
});



app.listen(3000, function() {
    console.log('Blog app listening on port 3000!');
});