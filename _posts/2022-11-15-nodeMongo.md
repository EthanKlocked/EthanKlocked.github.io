---
layout: post
title: "Node.js & MongoDB API"
subtitle: "NoSQL Express API server"
date: 2022-11-15 13:10:05 -0400
background: '/img/posts/node_bg.jpg'
tags: [nodejs]
---

### 서버 환경
* 개발환경 Centos7 
* NPM Express 서버
* MongoDB 스키마 연동

<br>

### 스크립트 로직

<br>

#### 1.서버 실행 파일

##### server.js

``` javascript
//init
require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8083;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./api/routes");

//Node Native Promise
mongoose.Promise = global.Promise; 

//mongodb connect
mongoose.connect(process.env.MONGO_URI).then(
    (res) => {
        console.log('Successfully connected to mongodb');
    }
).catch(e => {
    console.error(e);
});

//middleware
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

//route
app.use('/', routes);

//server ready
app.listen(port, () => {
    console.log(`API server started on : ${port}`);
});

```

<br>

#### 2.모델 (Example : User)

##### ./api/models/userModel.js

``` javascript
//init
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//schema
const UserSchema = new Schema({
    user_name:{
        type: String,
        required:true
    },
    user_regdate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", UserSchema);
```
<br>

#### 3.컨트롤러 (Example : User)

##### ./api/controller/userController.js

``` javascript
//init
const mongoose = require("mongoose");
const UserModel = mongoose.model("User");

//get users list
exports.all_users = (req, res) => {
    UserModel.find({}, (err, data) => {
        if(err) res.send(err);
        res.json(data);
    });
};

//add new user
exports.create_user = (req, res) => {
    const new_user = new UserModel(req.body);
    new_user.save((err, data) => {
        if(err) res.send(err);
        res.json(data);
    });
};

//get user
exports.load_user = (req, res) => {
    UserModel.findById(req.params.userId, (err, data) => {
        if(err) res.send(err);
        res.json(data);
    });
};

//update user
exports.update_user = (req, res) => {
    UserModel.findOneAndUpdate(
        { _id: req.params.userId },
        req.body,
        { new: true },
        (err, data) => {
            if(err) res.send(err);
            res.json(data);
        }
    );
};

//delete user
exports.delete_user = (req, res) => {
    UserModel.deleteOne(
        {
            _id: req.params.userId
        },
        (err, data) => {
            if(err) res.send(err);
            res.json({ message: "Data successfully deleted" });
        }
    );
};
```
<br>

#### 4.라우팅

##### ./api/routes/index.js

``` javascript
//init
const express = require('express');
const router = express.Router();

//indexing routes
const user = require('./userRoutes.js');

//connect
router.use('/user', user);

//export
module.exports = router;
```

<br>

##### ./api/routes/userRoutes.js

``` javascript
//init
const express = require('express');
const router = express.Router();

//activate schema
require("../models/userModel.js"); 

//controller
userController = require('../controller/userController.js');

//methods
router.route('/')
    .get(userController.all_users)
    .post(userController.create_user);

router.route('/:userId')
    .get(userController.load_user)
    .put(userController.update_user)
    .delete(userController.delete_user);

module.exports = router;
```

<br>

### CRUD TEST

#### Create
<img src="/img/posts/node_mongo_post.png" width="100%" height="100%"> 	

#### Read
<img src="/img/posts/node_mongo_get.png" width="100%" height="100%"> 	

#### Update
<img src="/img/posts/node_mongo_put.png" width="100%" height="100%"> 	

#### Delete
<img src="/img/posts/node_mongo_delete.png" width="100%" height="100%"> 	
