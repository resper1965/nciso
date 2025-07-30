const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.Audit - Gestão de Auditorias',
    endpoints: [
      '/audits - Auditorias',
      '/findings - Achados',
      '/evidence - Evidências'
    ]
  });
});

module.exports = router; 