const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

  router.get("/:title", contentController.getScrapped);
//   router.post("/", categoryController.createCategoryPost);
//   router.get("/add", categoryController.createCategoryGet);
//   router.get("/:category/edit", categoryController.updateCategoryGet);
//   router.post("/:category/edit",  categoryController.updateCategoryPost);
  router.post('/:title', contentController.deleteScrapped);

module.exports = router;