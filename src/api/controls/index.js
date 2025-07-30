const express = require('express');
const router = express.Router();

// Placeholder for Controls module
router.get('/', (req, res) => {
  res.json({
    message: 'n.Controls - Catálogo de Controles de Segurança',
    endpoints: [
      '/frameworks - Frameworks de segurança',
      '/domains - Domínios de controle',
      '/controls - Controles específicos'
    ]
  });
});

module.exports = router; 