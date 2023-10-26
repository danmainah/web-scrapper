var express = require('express');
var router = express.Router();
const contentController = require("../controllers/contentController");

/* GET home page. */
router.get('/', contentController.getContent);

router.post('/scrape', contentController.scrape);

module.exports = router;
