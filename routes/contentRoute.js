const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

  router.get("/:title", contentController.getScrapped);
  router.get("/:title/edit", contentController.editScrappedGet);
  router.put("/:title/edit",contentController.editScrappedPost);
  router.delete('/:title', contentController.deleteScrapped);

module.exports = router;