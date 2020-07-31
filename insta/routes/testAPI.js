var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const results = {
        name : "Nitin Chakre",
        School : "M.S.S. High School"
      }
      res.json(results);
});

module.exports = router;