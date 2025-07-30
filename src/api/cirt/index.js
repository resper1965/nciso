const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.CIRT - Resposta a Incidentes',
    endpoints: [
      '/incidents - Incidentes',
      '/tasks - Tarefas',
      '/playbooks - Playbooks'
    ]
  });
});

module.exports = router; 