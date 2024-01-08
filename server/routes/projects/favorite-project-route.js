const express = require('express');
const router = express.Router();
const verifyToken = require("../../verify-token/verify-token");
var favoriteProjectController = require('../../controllers/project/favorite-project-controller');
const verifyAppLevelAccess = require("../../verify-app-level-access/verify-app-level-access");

// create favorite Project
router.post('/',verifyToken ,favoriteProjectController.addFavoriteProject);

//get All Favorite Project
router.get('/',verifyToken, favoriteProjectController.getFavoriteProjects);

//get Favorite Projects -
router.post('/projects', verifyToken,verifyAppLevelAccess, favoriteProjectController.getAllProjects);

//delete/update favorite

router.post('/updatefavoriteprojects', verifyToken, favoriteProjectController.updateFavoriteProject);

module.exports = router;