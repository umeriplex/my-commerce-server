const express = require('express');
const adminRouter = express.Router();
const admin = require('../middlewares/admin_middleware');
const { Product } = require('../models/product');
const Order = require('../models/order');

// Add Product
adminRouter.post('/admin/add_product', admin , async (req, res) => {
    try{
        const { name, description, images, quantity, category, price } =  req.body;

        let product = new Product({
            name,
            description,
            images,
            quantity,
            category,
            price
        });

        product = await product.save();

        res.status(200).json({ statusCode: 200, success: true, message: 'Product Added!', data: product});

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Get Products
adminRouter.get('/admin/get_products', admin, async (req, res) => {
    try{
        const products =  await Product.find({});
        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: products }); 

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Delete Product
adminRouter.post('/admin/delete_product', admin, async (req, res) => {
    try{
        const { id } =  req.body;
        let product = await Product.findByIdAndDelete(id);
        if(!product) return res.status(400).json({ statusCode: 400, success: false, message: 'Product not found!'});
        res.status(200).json({ statusCode: 200, success: true, message: 'Product deleted!'}); 

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Get Orders
adminRouter.get('/admin/get_orders', admin, async (req, res) => {
    try{
        
       const orders = await Order.find();
       if(!orders) return res.status(400).json({ statusCode: 400, success: false, message: "No orders yet!"});

        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: orders});

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Change Order Status
adminRouter.post('/admin/change_order_status', admin, async (req, res) => {
    try{
        const { id, status } = req.body;
        let order = await Order.findById(id);
        if(!order) return res.status(400).json({ statusCode: 400, success: false, message: "Order not found!"});

        order.status = status;
        order = await order.save();

        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: order});

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Get Total Earnings
adminRouter.get('/admin/analytics', admin, async (req, res) => {
    try{
        let orders = await Order.find();
        if(!orders) return res.status(400).json({ statusCode: 400, success: false, message: "No orders yet!"});

        let totalEarning = 0;

        for(let i = 0; i < orders.length; i++){
            for(let j = 0; j < orders[i].products.length; j++){
                totalEarning += orders[i].products[j].quantity * orders[i].products[j].product.price;
            }
        }

        const electronicsEarnings = await fetchProductsByCategory('Electronics');
        const footwareEarnings = await fetchProductsByCategory('Footware');

        const earnings = {
            totalEarning,
            electronicsEarnings,
            footwareEarnings
        };

        res.status(200).json({ statusCode: 200, success: true, message: 'Success', data: earnings });

    }catch(ex){
        return res.status(500).json({ statusCode: 500, success: false, message: ex.message});
    }
});


// Get Category Wise Products
const fetchProductsByCategory = async (category) => {
    let earning = 0;
    let categoryOrders = await Order.find({ 
        'products.product.category': category
     });

     for(let i = 0; i < categoryOrders.length; i++){
         for(let j = 0; j < categoryOrders[i].products.length; j++){
            earning += categoryOrders[i].products[j].quantity * categoryOrders[i].products[j].product.price;
         }
     }

     return earning;

}


module.exports = adminRouter;