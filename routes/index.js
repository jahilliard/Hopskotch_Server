var express = require('express');
var router = express.Router();
 
var auth = require('./auth.js');
var menus = require("../controllers/menus.js");
var queues = require("../controllers/queues.js");
var requests = require("../controllers/requests.js");
var restaurants = require("../controllers/restaurants.js");
var users = require("../controllers/users.js");
 
/*
 * Routes that can be accessed by any one
 */
router.post('/login', auth.login);
 
/*
 * Routes that can be accessed only by autheticated users
 */
router.get('/api/v1/menus', menus.getAll);
router.get('/api/v1/menu/:id', menus.getOne);
router.post('/api/v1/menu/', menus.create);
router.put('/api/v1/menu/:id', menus.update);
router.delete('/api/v1/menu/:id', menus.delete);

 
/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/v1/admin/users', users.getAll);
router.get('/api/v1/admin/user/:id', users.getOne);
router.post('/api/v1/admin/user/', users.create);
router.put('/api/v1/admin/user/:id', users.update);
router.delete('/api/v1/admin/user/:id', users.delete);
 
module.exports = router;