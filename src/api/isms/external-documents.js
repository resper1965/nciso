const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Initialize Supabase client
let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('⚠️ Supabase not configured. Running in development mode.');
  }
} catch (error) {
  console.warn('⚠️ Supabase not available. Running in development mode.');
}

// Middleware for authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware for role validation (admin or manager only)
const validateRole = async (req, res, next) => {
  const userRole = req.user?.role || req.user?.permissions?.role;
  
  if (!userRole || !['admin', 'manager'].includes(userRole)) {
    return res.status(403).json({ 
      error: 'Insufficient permissions. Admin or manager role required.' 
    });
  }
  
  next();
};

// Middleware for tenant isolation
const validateTenant = async (req, res, next) => {
  const tenantId = req.body.tenant_id || req.params.tenant_id || req.query.tenant_id;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  // Validate tenant access
  if (req.user?.tenant_id && req.user.tenant_id !== tenantId) {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }
  
  req.tenantId = tenantId;
  next();
};

/**
 * Download file from URL
 */
async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete file on error
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

/**
 * Calculate SHA256 checksum of file
 */
function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => {
      hash.update(data);
    });
    
    stream.on('end', () => {
      resolve(`sha256:${hash.digest('hex')}`);
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * POST /api/v1/isms/external-documents/ingest
 * Ingest external document
 */
router.post('/ingest', 
  authenticateToken, 
  validateRole, 
  validateTenant,
  async (req, res) => {
    try {
      const {
        tenant_id,
        source,
        external_id,
        title,
        version = '1.0',
        document_url,
        checksum,
        lang = 'pt-BR',
        policy_id = null,
        description = '',
        tags = []
      } = req.body;

      // Validate required fields
      if (!tenant_id || !source || !external_id || !title || !document_url) {
        return res.status(400).json({
          error: 'Missing required fields: tenant_id, source, external_id, title, document_url'
        });
      }

      // Validate language
      const validLanguages = ['pt-BR', 'en-US', 'es'];
      if (!validLanguages.includes(lang)) {
        return res.status(400).json({
          error: 'Invalid language. Supported: pt-BR, en-US, es'
        });
      }

      // Create temporary file path
      const tempDir = path.join(__dirname, '../../../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `${external_id}_${Date.now()}.pdf`;
      const tempFilePath = path.join(tempDir, fileName);

      console.log(`📥 Downloading document from: ${document_url}`);

      // Download file
      try {
        await downloadFile(document_url, tempFilePath);
      } catch (error) {
        return res.status(400).json({
          error: `Failed to download document: ${error.message}`
        });
      }

      // Calculate checksum
      let calculatedChecksum;
      try {
        calculatedChecksum = await calculateChecksum(tempFilePath);
      } catch (error) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).json({
          error: `Failed to calculate checksum: ${error.message}`
        });
      }

      // Validate checksum if provided
      if (checksum && calculatedChecksum !== checksum) {
        fs.unlinkSync(tempFilePath);
        return res.status(400).json({
          error: 'Checksum validation failed',
          expected: checksum,
          calculated: calculatedChecksum
        });
      }

      // Get file info
      const fileStats = fs.statSync(tempFilePath);
      const fileSize = fileStats.size;

      // Upload to Supabase Storage
      let storagePath = null;
      if (supabase) {
        try {
          const storageBucket = 'isms-documents';
          const storagePath = `${tenant_id}/${external_id}/${version}/document.pdf`;
          
          const fileBuffer = fs.readFileSync(tempFilePath);
          const { data, error } = await supabase.storage
            .from(storageBucket)
            .upload(storagePath, fileBuffer, {
              contentType: 'application/pdf',
              upsert: true
            });

          if (error) {
            throw new Error(`Storage upload failed: ${error.message}`);
          }

          console.log(`✅ Document uploaded to storage: ${storagePath}`);
        } catch (error) {
          fs.unlinkSync(tempFilePath);
          return res.status(500).json({
            error: `Storage upload failed: ${error.message}`
          });
        }
      }

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      // Create external document record
      const externalDocumentData = {
        tenant_id,
        source,
        external_id,
        title,
        version,
        document_url,
        document_path: storagePath,
        checksum: calculatedChecksum,
        lang,
        policy_id,
        description,
        tags,
        file_size: fileSize,
        created_by: req.user.id || req.user.email,
        created_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      };

      // Insert into database
      let documentRecord;
      if (supabase) {
        const { data, error } = await supabase
          .from('isms_external_documents')
          .insert(externalDocumentData)
          .select()
          .single();

        if (error) {
          throw new Error(`Database insert failed: ${error.message}`);
        }

        documentRecord = data;
      } else {
        // Development mode - return mock data
        documentRecord = {
          id: crypto.randomUUID(),
          ...externalDocumentData
        };
      }

      // Create audit log
      if (supabase) {
        await supabase
          .from('isms_sync_audit_logs')
          .insert({
            tenant_id,
            action: 'document_ingested',
            source,
            external_id,
            document_id: documentRecord.id,
            status: 'success',
            details: {
              title,
              version,
              file_size: fileSize,
              checksum: calculatedChecksum
            },
            created_by: req.user.id || req.user.email,
            created_at: new Date().toISOString()
          });
      }

      console.log(`✅ External document ingested successfully: ${documentRecord.id}`);

      res.status(201).json({
        success: true,
        message: 'External document ingested successfully',
        data: {
          id: documentRecord.id,
          title,
          version,
          source,
          external_id,
          checksum: calculatedChecksum,
          file_size: fileSize,
          storage_path: storagePath,
          created_at: documentRecord.created_at
        }
      });

    } catch (error) {
      console.error('❌ Error ingesting external document:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/v1/isms/external-documents
 * List external documents
 */
router.get('/', 
  authenticateToken, 
  validateTenant,
  async (req, res) => {
    try {
      const { tenant_id, policy_id, source, lang, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('isms_external_documents')
        .select('*')
        .eq('tenant_id', tenant_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (policy_id) {
        query = query.eq('policy_id', policy_id);
      }

      if (source) {
        query = query.eq('source', source);
      }

      if (lang) {
        query = query.eq('lang', lang);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      res.json({
        success: true,
        data: data || [],
        count: data?.length || 0,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: data?.length || 0
        }
      });

    } catch (error) {
      console.error('❌ Error listing external documents:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/v1/isms/external-documents/:id
 * Get external document by ID
 */
router.get('/:id', 
  authenticateToken, 
  validateTenant,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tenant_id } = req.query;

      const { data, error } = await supabase
        .from('isms_external_documents')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'External document not found'
          });
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('❌ Error getting external document:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

/**
 * GET /api/v1/isms/external-documents/:id/download
 * Download external document
 */
router.get('/:id/download', 
  authenticateToken, 
  validateTenant,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tenant_id } = req.query;

      const { data, error } = await supabase
        .from('isms_external_documents')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          error: 'External document not found'
        });
      }

      if (!data.document_path) {
        return res.status(404).json({
          error: 'Document file not found in storage'
        });
      }

      // Get signed URL for download
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from('isms-documents')
        .createSignedUrl(data.document_path, 3600); // 1 hour

      if (urlError) {
        throw new Error(`Failed to generate download URL: ${urlError.message}`);
      }

      res.json({
        success: true,
        data: {
          download_url: signedUrl.signedUrl,
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          file_name: `${data.title}_v${data.version}.pdf`
        }
      });

    } catch (error) {
      console.error('❌ Error generating download URL:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

/**
 * DELETE /api/v1/isms/external-documents/:id
 * Delete external document
 */
router.delete('/:id', 
  authenticateToken, 
  validateRole, 
  validateTenant,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tenant_id } = req.query;

      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('isms_external_documents')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant_id)
        .single();

      if (fetchError || !document) {
        return res.status(404).json({
          error: 'External document not found'
        });
      }

      // Delete from storage if exists
      if (document.document_path) {
        try {
          await supabase.storage
            .from('isms-documents')
            .remove([document.document_path]);
        } catch (storageError) {
          console.warn('⚠️ Failed to delete from storage:', storageError.message);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('isms_external_documents')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant_id);

      if (deleteError) {
        throw new Error(`Database delete failed: ${deleteError.message}`);
      }

      // Create audit log
      await supabase
        .from('isms_sync_audit_logs')
        .insert({
          tenant_id,
          action: 'document_deleted',
          source: document.source,
          external_id: document.external_id,
          document_id: id,
          status: 'success',
          details: {
            title: document.title,
            version: document.version
          },
          created_by: req.user.id || req.user.email,
          created_at: new Date().toISOString()
        });

      res.json({
        success: true,
        message: 'External document deleted successfully'
      });

    } catch (error) {
      console.error('❌ Error deleting external document:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

module.exports = router; 