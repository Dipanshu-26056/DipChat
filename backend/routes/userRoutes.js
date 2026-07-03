const express = require('express')
const {protect} = require("../middlewares/authMiddleware");

const router = express.Router()
const { registerUser,authUser,allUsers } = require("../controllers/userControllers");
router.route("/").post(registerUser).get(protect,allUsers);
router.post("/login",authUser);



module.exports = router;