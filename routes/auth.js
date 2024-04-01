const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth_middleware');
const authRouter = express.Router();

// SignUp Route
authRouter.post('/api/signup', async (req, res) => {
    try{
        const {name, email, password} = req.body;
    
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ statusCode: 400, success: false, message: 'User already exist with same email address!'});
        }

        const hashPassword = await bcrypt.hash(password,8);

        let newUser = new User({
            email,
            password: hashPassword,
            name
        });

        newUser = await  newUser.save();
        res.status(200).json({ statusCode: 200, success: true, message: 'User created!', data: newUser});
        
    
    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }

});


// SignIn Route
authRouter.post('/api/signin', async (req, res) => {
    try{
        const { email, password } =  req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ statusCode: 400, success: false, message: 'User does not exist with this email address!'});
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
            return res.status(400).json({ statusCode: 400, success: false, message: 'Incorrect password!'});
        }


        const expiresIn = 24 * 60 * 60; // One day in seconds
        // const expiresIn = 2 * 60; // Two minutes in seconds
        const token = jwt.sign({ id: user._id }, "passwordKey", { expiresIn });
        res.status(200).json({ statusCode: 200, success: true, message: 'User logged in!', data: user, bearerToken: token});

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Check Token Route
authRouter.post('/api/check_token', async (req, res) => {
    try{
        const token = req.header('x-auth-token');
        if(!token) return res.status(401).json({ statusCode: 401, success: false, message: 'Unauthorized!'});

        const isVerified = jwt.verify(token, "passwordKey");
        if(!isVerified) return res.status(401).json({ statusCode: 401, success: false, message: 'Unauthorized!'});

        const user = await User.findById(isVerified.id);
        if(!user) return res.status(401).json({ statusCode: 401, success: false, message: 'Unauthorized!'});

        return res.status(200).json({ statusCode: 200, success: true, message: 'User Exist'});
        

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Get User Route
authRouter.get('/api/get_user', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user);
        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: user, bearerToken: req.token});

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});

module.exports = authRouter;