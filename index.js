const http = require('http');
const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routerNews = require('./router/news');
const routerUser = require('./router/user');
const routerCart = require('./router/cart');
const routerProduct = require('./router/product');

let app = express();
http.createServer(app).listen(3000);

app.use(bodyparser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(cors({
    origin:['http://127.0.0.1','http://localhost','http://127.0.0.1:8080','http://localhost:8080'],
    methods:['PUT','DELETE','POST','GET'],
}));
app.use('/news',routerNews);
app.use('/cart',routerCart);
app.use('/user',routerUser);
app.use('/product',routerProduct);