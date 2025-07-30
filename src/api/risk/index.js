const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.Risk - Gestão de Riscos',
    endpoints: [
      '/risks - Riscos',
      '/assessments - Avaliações',
      '/kris - Indicadores de risco'
    ]
  });
});

module.exports = router; 