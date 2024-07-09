const express = require('express');
const router = express.Router();

/* Router made for testing purposes */
router.route('/echo')
  .get(function (req, res) {
    const response = { body: { ...req.body }, files: { ...req.files } };
    console.log(response)
    res.status(200).send(response);
  })
  .post(function (req, res) {
    const response = { body: { ...req.body }, files: { ...req.files } };
    console.log(response)
    res.status(200).send(response);
  });

router.route('/echo/:param')
  .get(function (req, res) {
    const response = { body: { ...req.body }, files: { ...req.files }, param: req.params.param };
    console.log(response);
    res.status(200).send(response);
  })
  .post(function (req, res) {
    const response = { body: { ...req.body }, files: { ...req.files }, param: req.params.param };
    console.log(response);
    res.status(200).send(response);
  });

module.exports = router;
