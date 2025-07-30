const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.Tickets - Sistema de Suporte',
    endpoints: [
      '/tickets - Tickets',
      '/categories - Categorias',
      '/slas - SLAs'
    ]
  });
});

module.exports = router; 