const experss = require("express");
const router = experss.Router();

const {signup,signin,adminsignin,signout} = require("../controllers/authcontroller");

router.post("/register", signup);
router.post("/signin", signin);
router.post("/adminsignin", adminsignin);
router.get("/signout", signout);

module.exports = router;
