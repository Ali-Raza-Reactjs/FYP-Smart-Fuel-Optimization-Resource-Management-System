const express = require('express');
const { optimizeRoute } = require('../controllers/route.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/optimize')
  .post(optimizeRoute);

module.exports = router;
