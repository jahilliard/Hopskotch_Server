var express = require('express');
var router = express.Router();
 
var AuthController = require('../controllers/AuthController.js');
var RoomController = require("../controllers/RoomController.js");
//var RequestController = require("../controllers/RequestController.js");
var LocationController = require("../controllers/LocationController.js");
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
router.get('/api/v1/admin/users/:id', UserController.getById);
router.post('/api/v1/admin/users/:id', UserController.update);
router.delete('/api/v1/admin/users/:id', UserController.delete);

router.get('/api/v1/admin/locations/', LocationController.getAll);
router.get('/api/v1/admin/locations/:id', LocationController.getById);
router.post('/api/v1/admin/locations/', LocationController.create);
router.post('/api/v1/admin/locations/:id', LocationController.update);
router.delete('/api/v1/admin/locations/:id', LocationController.delete);

router.post('/api/v1/admin/locations/:id/menu/', LocationController.addMenuItems);
router.delete('/api/v1/admin/locations/:id/menu/', LocationController.deleteMenuItems);
/*
router.get('/api/v1/admin/requests/', RequestController.getAll);
router.get('/api/v1/admin/requests/:id', RequestController.getOne);
router.post('/api/v1/admin/requests/', RequestController.create);
router.post('/api/v1/admin/requests/:id', RequestController.update);
router.delete('/api/v1/admin/requests/:id', RequestController.delete);

router.post('/api/v1/admin/requests/:id/matches/', RequestController.addMatch);
router.delete('/api/v1/admin/requests/:id/matches/', RequestController.removeMatch);*/

router.get('/api/v1/admin/rooms/', RoomController.getAll);
router.get('/api/v1/admin/rooms/:id', RoomController.getById);
router.post('/api/v1/admin/rooms/', RoomController.create);
router.post('/api/v1/admin/rooms/:id', RoomController.update);
router.delete('/api/v1/admin/rooms/:id', RoomController.delete);

router.post('/api/v1/admin/rooms/:id/members/', RoomController.addMembersToRoom);
router.delete('/api/v1/admin/rooms/:id/members/', RoomController.removeMembersFromRoom);

module.exports = router;