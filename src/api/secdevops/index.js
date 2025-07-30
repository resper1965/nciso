const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.SecDevOps - Testes de Segurança',
    endpoints: [
      '/projects - Projetos',
      '/scans - Scans de segurança',
      '/reports - Relatórios'
    ]
  });
});

module.exports = router; 