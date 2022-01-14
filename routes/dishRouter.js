//this file will contain the implementation of handling of REST API endpoint
//for /dishes and /dishes:dishId endpoints

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();  //declares dishRouter as an ExpressRouter
dishRouter.use(bodyParser.json());

dishRouter.route('/')
// .all((req,res,next) => {    //we are declaring endpoint at 1 single location whereby you can chain
//                                                             //all the GET,PUT,POST,DEL          
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain'); //send plaintext replies back to the client 
//     next(); //the modified object gets passed to the next 'app.__'
// })   //parameters are the endpoints, and the callback func

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) => {     //this returns an array
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);      //this takes a json string as input and sends it to client
    }, (err) => next(err))
    .catch((err) => next(err));  
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {  //req.body will give access to whatever is inside the body of the msg
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created: ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403; //403 means operation not supported 
    res.end('PUT operation not supported on /dishes')   //req.body will give access to whatever is inside the body of the msg
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => { //quite dangerous, should only be done by priviledged users
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);   
    }, (err) => next(err)) 
    .catch((err) => next(err));   
});

/*-----------------------------------------------------*/

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .all((req,res,next) => {    //we are declaring endpoint at 1 single location whereby you can chain
//                                                             //all the GET,PUT,POST,DEL          
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain'); //send plaintext replies back to the client 
//     next(); //the modified object gets passed to the next 'app.__'
// })   //parameters are the endpoints, and the callback func

.get(cors.cors, (req,res,next) => {    //dishId can be found in params
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);   
    }, (err) => next(err)) 
    .catch((err) => next(err));  
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.end('POST operation not supported on /dishes/' + req.params.dishId)   //req.body will give access to whatever is inside the body of the msg
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {     //'res.write: used to add a line to the reply msg
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true }) 
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);   
    }, (err) => next(err)) 
    .catch((err) => next(err));   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => { //quite dangerous, should only be done by priviledged users
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);   
    }, (err) => next(err)) 
    .catch((err) => next(err));   
}),

/*-------------------------------------------------*/

dishRouter.route('/:dishId/comments')
// .all((req,res,next) => {    //we are declaring endpoint at 1 single location whereby you can chain
//                                                             //all the GET,PUT,POST,DEL          
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain'); //send plaintext replies back to the client 
//     next(); //the modified object gets passed to the next 'app.__'
// })   //parameters are the endpoints, and the callback func

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dishes.findById(req.params.dishId)      //search for a specific dish
    .populate('comments.author')
    .then((dish) => {     //this returns an array
        if (dish!=null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments); //this takes a json string as input and sends it to client
        }    //this is to account for: if the dish requested does not exist
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));  
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {  //req.body will give access to whatever is inside the body of the msg
    Dishes.findById(req.params.dishId) 
    .then((dish) => {
        if (dish!=null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish); //this takes a json string as input and sends it to client                        
                    })
            }, (err) => next(err));

        }    //this is to account for: if the dish requested does not exist
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403; //403 means operation not supported 
    res.end('PUT operation not supported on /dishes/' + req.params.dishId + ' /comments')   //req.body will give access to whatever is inside the body of the msg
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => { //quite dangerous, should only be done by priviledged users
    Dishes.findById(req.params.dishId) 
    .then((dish) => {
        if (dish!=null) {
            for (var i = (dish.comments.length-1);i>=0;i--) {
                dish.comments.id(dish.comments[i]._id).remove();    //accessing subdocument
            }   //remove each comment
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish); //this takes a json string as input and sends it to client
            }, (err) => next(err));
        }    //this is to account for: if the dish requested does not exist
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }  
    }, (err) => next(err)) 
    .catch((err) => next(err));   
});

/*-----------------------------------------------------*/

dishRouter.route('/:dishId/comments/:commentId')
// .all((req,res,next) => {    //we are declaring endpoint at 1 single location whereby you can chain
//                                                             //all the GET,PUT,POST,DEL          
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain'); //send plaintext replies back to the client 
//     next(); //the modified object gets passed to the next 'app.__'
// })   //parameters are the endpoints, and the callback func

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {    //dishId can be found in params
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {   //need to account for more scenarios in the 'If'!
        if (dish!=null && dish.comments.id(req.params.commentId) !=null) { 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId)); //this takes a json string as input and sends it to client
        }    //this is to account for: if the dish requested does not exist
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);          
        }
            
    }, (err) => next(err)) 
    .catch((err) => next(err));  
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.end('POST operation not supported on /dishes/' + req.params.dishId
    + '/comments/' + req.params.commentId)   //req.body will give access to whatever is inside the body of the msg
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {     //'res.write: used to add a line to the reply msg
    Dishes.findById(req.params.dishId)
    .then((dish) => {   //need to account for more scenarios in the 'If'!
        if (dish!=null && dish.comments.id(req.params.commentId) !=null
        && dish.comments.id(req.params.commentId).author.equals(req.user._id)) { 
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish); //this takes a json string as input and sends it to client
                })
            }, (err) => next(err));
        }    //this is to account for: if the dish requested does not exist
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else if (dish.comments.id(req.params.commentId) == null) {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
        else {
            err = new Error('You are not authorised to update this comment!');
            err.status = 403;
            return next(err);          
        }
            
    }, (err) => next(err)) 
    .catch((err) => next(err));   
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => { //quite dangerous, should only be done by priviledged users
    Dishes.findById(req.params.dishId) 
    .then((dish) => {
        if (dish!=null && dish.comments.id(req.params.commentId) !=null
        && dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish); //this takes a json string as input and sends it to client
                })
            }, (err) => next(err));
        }    //this is to account for: if the dish requested does not exist
        
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else if (dish.comments.id(req.params.commentId) == null) {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
        else {
            err = new Error('You are not authorised to delete this comment!');
            err.status = 403;
            return next(err);          
        }
    }, (err) => next(err)) 
    .catch((err) => next(err));   
})
module.exports = dishRouter;