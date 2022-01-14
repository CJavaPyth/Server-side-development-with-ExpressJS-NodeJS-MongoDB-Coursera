const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();  //declares dishRouter as an ExpressRouter
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
// .all((req,res,next) => {    //we are declaring endpoint at 1 single location whereby you can chain
//                                                             //all the GET,PUT,POST,DEL          
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain'); //send plaintext replies back to the client 
//     next(); //the modified object gets passed to the next 'app.__'
// })   //parameters are the endpoints, and the callback func

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Leaders.find({}) 
    .then((leaders) => {     //this returns an array
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);      //this takes a json string as input and sends it to client
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.create(req.body)
    .then((leader) => {
        console.log('Dish Created: ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403; //403 means operation not supported 
    res.end('PUT operation not supported on /leaders')   //req.body will give access to whatever is inside the body of the msg
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promos.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);   
    }, (err) => next(err)) 
    .catch((err) => next(err));  
});

/*-----------------------------------------------------*/

leaderRouter.route('/:leaderId')
// .all((req,res,next) => {    //we are declaring endpoint at 1 single location whereby you can chain
//                                                             //all the GET,PUT,POST,DEL          
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain'); //send plaintext replies back to the client 
//     next(); //the modified object gets passed to the next 'app.__'
// })   //parameters are the endpoints, and the callback func

.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promos.findById(req.params.dishId)
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);   
    }, (err) => next(err)) 
    .catch((err) => next(err));  
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.end('POST operation not supported on /leaders/' + req.params.promoId)   //req.body will give access to whatever is inside the body of the msg
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, { new: true }) 
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);   
    }, (err) => next(err)) 
    .catch((err) => next(err)); 
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promos.findByIdAndRemove(req.params.promoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);   
    }, (err) => next(err)) 
    .catch((err) => next(err));  
})

module.exports = leaderRouter;