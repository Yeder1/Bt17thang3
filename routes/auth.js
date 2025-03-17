var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
const { check_authentication } = require('../Utils/check_auth');

router.post('/signup', async function(req, res, next) {
    try {
        let body = req.body;
        let result = await userController.createUser(
          body.username,
          body.password,
          body.email,
         'user'
        )
        res.status(200).send({
          success:true,
          data:result
        })
      } catch (error) {
        next(error);
      }

})
router.post('/login', async function(req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userController.checkLogin(username,password);
        res.status(200).send({
            success:true,
            data:result
        })
      } catch (error) {
        next(error);
      }

})
router.get('/me',check_authentication, async function(req, res, next){
    try {
      res.status(200).send({
        success:true,
        data:req.user
    })
    } catch (error) {
        next();
    }
})
router.get("/resetPassword/:id", check_authentication, check_admin, async (req, res) => {
  try {
      const userId = req.params.id;
      const newPassword = await bcrypt.hash("123456", 10);

      const user = await User.findByIdAndUpdate(userId, { password: newPassword });

      if (!user) {
          return res.status(404).json({ message: "khong tim thay nguoi dung" });
      }

      res.json({ message: "mat khau reset thanh cong thanh '123456'" });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
})
router.post("/changePassword", verifyToken, async (req, res) => {
  try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
          return res.status(404).json({ message: "khong tim thay nguoi dung" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "mat khau khong chinh xac" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "thay doi mat khau thanh cong" });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router