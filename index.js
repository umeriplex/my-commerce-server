const express = require('express');
const mongoose = require('mongoose');
const app = express();

// VARIABLES
const DB_NAME = 'my-commerce';
const DB = `mongodb://localhost:27017/${DB_NAME}`;
const PORT = 3000;

// IMPORTS FROM OTHER FILES
const authRouter =  require('./routes/auth');
const adminRouter =  require('./routes/admin');
const productRouter = require('./routes/product');
const userRouter = require('./routes/user')

// MIDDLE-WARE
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);


// CONNECTIONS
mongoose.connect(DB).then(()=>{
    console.log(`Connected to databasae at ${DB}`);
}).catch((e)=>{
    console.log(`Cannot connect to database due to ${e}`);
});

app.listen(PORT, "0.0.0.0", ()=> console.log(`Server started at ${PORT} Port`));

