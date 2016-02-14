var express = require('express');
var router = express.Router();
 
var AuthController = require('../controllers/AuthController.js');
var QueueController = require("../controllers/QueueController.js");
var RequestController = require("../controllers/RequestController.js");
var RestaurantController = require("../controllers/RestaurantController.js");
var UserController = require("../controllers/UserController.js");

/*
 * Routes that can be accessed by any one
 */

router.post('/login', AuthController.authenticate);
router.post('/users', UserController.create);
router.get('/login/facebook', AuthController.fbAuthenticate);

/*
 * Routes that can be accessed only by autheticated users
 */

 
/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/v1/admin/users/', UserController.getAll);
router.get('/api/v1/admin/user/:id', UserController.getById);
router.put('/api/v1/admin/user/:id', UserController.update);
router.delete('/api/v1/admin/user/:id', UserController.delete);

router.get('/api/v1/admin/restaurants/', RestaurantController.getAll);
router.get('/api/v1/admin/restaurants/:id', RestaurantController.getById);
router.post('/api/v1/admin/restaurants/', RestaurantController.create);
router.put('/api/v1/admin/restaurants/:id', RestaurantController.update);
router.delete('/api/v1/admin/restaurants/:id', RestaurantController.delete);

router.post('/api/v1/admin/restaurants/:id/menu/', RestaurantController.addMenuItems);
router.delete('/api/v1/admin/restaurants/:id/menu/', RestaurantController.deleteMenuItems);

router.get('/api/v1/admin/requests/', RequestController.getAll);
router.get('/api/v1/admin/requests/:id', RequestController.getOne);
router.post('/api/v1/admin/requests/', RequestController.create);
router.put('/api/v1/admin/requests/:id', RequestController.update);
router.delete('/api/v1/admin/requests/:id', RequestController.delete);

router.post('/api/v1/admin/requests/:id/matches/', RequestController.addMatch);
router.delete('/api/v1/admin/requests/:id/matches/', RequestController.removeMatch);

router.get('/api/v1/admin/queues/', QueueController.getAll);
router.get('/api/v1/admin/queues/:id', QueueController.getOne);
router.post('/api/v1/admin/queues/', QueueController.create);
router.put('/api/v1/admin/queues/:id', QueueController.update);
router.delete('/api/v1/admin/queues/:id', QueueController.delete);

router.post('/api/v1/admin/queues/:id/queue/', QueueController.addUserToQueue);
router.delete('/api/v1/admin/queues/:id/queue/', QueueController.removeUserFromQueue);

module.exports = router;