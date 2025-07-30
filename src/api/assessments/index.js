const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.Assessments - Avaliações Estruturadas',
    endpoints: [
      '/templates - Templates',
      '/responses - Respostas',
      '/reports - Relatórios'
    ]
  });
});

module.exports = router; 