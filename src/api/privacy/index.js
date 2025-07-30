const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'n.Privacy - LGPD e GDPR',
    endpoints: [
      '/consents - Consentimentos',
      '/data-subjects - Titulares',
      '/processing-activities - Atividades de processamento'
    ]
  });
});

module.exports = router; 