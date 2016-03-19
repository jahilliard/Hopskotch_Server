var express = require('express');
var router = express.Router();
 
var AuthController = require('../controllers/AuthController.js');
var RoomController = require("../controllers/RoomController.js");
var MatchController = require("../controllers/MatchController.js");
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
router.get('/api/v1/users/', UserController.getAll);
router.get('/api/v1/users/:id', UserController.getById);
router.post('/api/v1/users/update/:id', UserController.update);
router.delete('/api/v1/users/:id', UserController.delete);

router.get('/api/v1/locations/', LocationController.getAll);
router.get('/api/v1/locations/:id', LocationController.getById);
router.post('/api/v1/locations/', LocationController.create);
router.post('/api/v1/locations/:id', LocationController.update);
router.delete('/api/v1/locations/:id', LocationController.delete);
router.get('/api/v1/locations/search/radius', LocationController.getInRadius);

router.post('/api/v1/locations/:id/menu/', LocationController.addMenuItems);
router.delete('/api/v1/locations/:id/menu/', LocationController.deleteMenuItems);

router.get('/api/v1/matches/', MatchController.getAll);
router.get('/api/v1/matches/:id', MatchController.getById);
router.post('/api/v1/matches/', MatchController.createIfNotExists);
router.post('/api/v1/matches/:id', MatchController.update);
router.delete('/api/v1/matches/:id', MatchController.delete);

router.get('/api/v1/room/locations/:id', RoomController.getByLocationId);
router.post('/api/v1/addMember/room/locations/', RoomController.addMembersToRoomByLocation);
router.get('/api/v1/rooms/', RoomController.getAll);
router.get('/api/v1/rooms/:id', RoomController.getById);
router.post('/api/v1/rooms/', RoomController.create);
router.post('/api/v1/rooms/:id', RoomController.update);
router.delete('/api/v1/rooms/:id', RoomController.delete);

router.post('/api/v1/rooms/:id/members/', RoomController.addMembersToRoom);
router.delete('/api/v1/rooms/:id/members/', RoomController.removeMembersFromRoom);

module.exports = router;