const router = require('express').Router();
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const swaggerFile = JSON.parse(fs.readFileSync('./swagger/swagger.json'));
router.use(swaggerUi.serve, swaggerUi.setup(swaggerFile));
module.exports = router;
