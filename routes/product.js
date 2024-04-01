const express = require('express');
const productRoute = express.Router();
const auth = require('../middlewares/auth_middleware');
const { Product } = require('../models/product');

// Get Products by Category ("/api/products?category=electronics")
productRoute.get('/api/products', auth, async (req, res) => {
    try{
        const products = await Product.find({ category: req.query.category });
        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: products});
    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Serach Product
productRoute.get('/api/products/search/:name', auth, async (req, res) => {
    try{
        const products = await Product.find({ 
            name: { $regex: req.params.name, $options: "i" }
         });
        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: products});
    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Rating Product
productRoute.post('/api/product/rate', auth, async (req, res) => {
    try{
        const { id, rating } = req.body;
        let product = await Product.findById(id);
        if(!product) return res.status(400).json({ statusCode: 400, success: false, message: "Product not found!"});

        for(let i = 0; i < product.ratings.length; i++){
            if(product.ratings[i].userId == req.user){
                product.ratings.splice(i, 1);
                break;
            }
        }

        const ratingSchema = {
            userId: req.user,
            rating
        };

        product.ratings.push(ratingSchema);
        product = await product.save();
        res.status(200).json({ statusCode: 200, success: true, messahe: "Success", data: product })

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Get Deal Of The Day
productRoute.get('/api/product/get_deal_of_the_day', auth, async (req, res)=>{
    try{
        let product = await Product.find();
        product = product.sort((productOne, productTwo) => {
            let productOneSum = 0;
            let productTwoSum = 0;

            for(let i = 0; i < productOne.ratings.length; i++){
                productOneSum += productOne.ratings[i].rating;
            }

            for(let i = 0; i < productTwo.ratings.length; i++){
                productTwoSum += productTwo.ratings[i].rating;
            }
            return productOneSum < productTwoSum ? 1 : -1;
        });

        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: product[0]});
    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});

module.exports = productRoute;
