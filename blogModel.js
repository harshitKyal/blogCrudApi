// Defining a mongoose schema
// including mongoose
var mongoose = require('mongoose');
//declaring the module 'mongoose-unique-validator'(plugin).
var uniqueValidator = require('mongoose-unique-validator');

// declaring a schema (or) database structure

var Schema = mongoose.Schema;

// blogSchema is an instance of Schema

var blogSchema = new Schema({

    //blogId:{type:String,default:''},

    title: {
        type: String,
        default: '',
        required: true,
        unique:true
    },
    
    subtitle: {
        type: String,
        default: ''
    },  
    
    blogBody: {
        type: String,
        default: '',
        required: true
    },
    comments: [],
    created : {type:Date},
    //lastModified : {type:Date},
    author: {},
    tags: []
}); //for createdAt and updatedAt

// connect model and schema
mongoose.model('Blog', blogSchema);
blogSchema.plugin(uniqueValidator);