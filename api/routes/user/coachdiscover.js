const express = require('express');
const router = express.Router();
const { getMentors } = require('../../controller/user/coachdiscover');

router.get('/', getMentors);

module.exports = router;
