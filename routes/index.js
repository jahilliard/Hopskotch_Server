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

router.get('/api/v1/admin/matches/', MatchController.getAll);
router.get('/api/v1/admin/matches/:id', MatchController.getById);
router.post('/api/v1/admin/matches/', MatchController.create);
router.post('/api/v1/admin/matches/:id', MatchController.update);
router.delete('/api/v1/admin/matches/:id', MatchController.delete);

router.post('/api/v1/admin/matches/:id/matchList/', MatchController.addMatches);
router.delete('/api/v1/admin/matches/:id/matchList/', MatchController.removeMatches);

router.get('/api/v1/admin/rooms/', RoomController.getAll);
router.get('/api/v1/admin/rooms/:id', RoomController.getById);
router.post('/api/v1/admin/rooms/', RoomController.create);
router.post('/api/v1/admin/rooms/:id', RoomController.update);
router.delete('/api/v1/admin/rooms/:id', RoomController.delete);

router.post('/api/v1/admin/rooms/:id/members/', RoomController.addMembersToRoom);
router.delete('/api/v1/admin/rooms/:id/members/', RoomController.removeMembersFromRoom);

module.exports = router;