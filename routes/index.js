var express = require('express');
var router = express.Router();
 
var auth = require('../controllers/auth.js');
var menus = require("../controllers/menus.js");
var queues = require("../controllers/queues.js");
var requests = require("../controllers/requests.js");
var restaurants = require("../controllers/restaurants.js");
var users = require("../controllers/users.js");

/*
 * Routes that can be accessed by any one
 */


router.post('/login', auth.authenticate);

 
router.post('/users', users.create);
/*
 * Routes that can be accessed only by autheticated users
 */

 
/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/v1/admin/users/', users.getAll);
router.get('/api/v1/admin/user/:id', users.getOne);
router.put('/api/v1/admin/user/:id', users.update);
router.delete('/api/v1/admin/user/:id', users.delete);

router.get('/api/v1/admin/restaurants/', restaurants.getAll);
router.get('/api/v1/admin/restaurants/:id', restaurants.getOne);
router.post('/api/v1/admin/restaurants/', restaurants.create);
router.put('/api/v1/admin/restaurants/:id', restaurants.update);
router.delete('/api/v1/admin/restaurants/:id', restaurants.delete);

router.post('/api/v1/admin/restaurants/:id/menu/', restaurants.addMenuItems);
router.delete('/api/v1/admin/restaurants/:id/menu/', restaurants.deleteMenuItems);

router.get('/api/v1/admin/requests/', requests.getAll);
router.get('/api/v1/admin/requests/:id', requests.getOne);
router.post('/api/v1/admin/requests/', requests.create);
router.put('/api/v1/admin/requests/:id', requests.update);
router.delete('/api/v1/admin/requests/:id', requests.delete);

router.post('/api/v1/admin/requests/:id/matches/', requests.addMatch);
router.delete('/api/v1/admin/requests/:id/matches/', requests.removeMatch);

router.get('/api/v1/admin/queues/', queues.getAll);
router.get('/api/v1/admin/queues/:id', queues.getOne);
router.post('/api/v1/admin/queues/', queues.create);
router.put('/api/v1/admin/queues/:id', queues.update);
router.delete('/api/v1/admin/queues/:id', queues.delete);

router.post('/api/v1/admin/queues/:id/queue/', queues.addUserToQueue);
router.delete('/api/v1/admin/queues/:id/queue/', queues.removeUserFromQueue);

module.exports = router;