const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.get('/', (req, res, next) => {
    User.find()
    .select('_id email password')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                return {
                    email: doc.email,
                    password: doc.password,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/user/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:user_id', (req, res, next) => {
    const id = req.params.user_id;
    User.findById(id)
    .select('_id email password')
    .exec()
    .then(doc => {
        if(doc) {
            res.status(200).json({
                user: doc,
                request: {
                    type: 'GET',
                    description: 'GET_ALL_PRODUCTS',
                    url: 'http://localhost:3000/users'
                }
            });
        } else {
            res.status(404).json({
                message: 'No valid entry found for provided ID'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/:user_id', (req, res, next) => {
    const id = req.params.user_id;
    User.update({_id: id}, { email: req.body.email, password: bcrypt.hash(req.body.password, 10) })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User updated!',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/user/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: "This email exists!"
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash   
                    });
                    user.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created succesfully!'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email}).exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed!'
            });
        }

        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed!'
                }); 
            }

            if (result) {
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        user_id: user[0]._id
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    message: 'Auth succesful!',
                    token: token
                });
            }

            res.status(401).json({
                message: 'Auth failed!'
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}); 

router.delete('/:user_id', (req, res, next) => {
    User.remove({ _id: req.params.user_id}).exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'User deleted succesfully!'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;