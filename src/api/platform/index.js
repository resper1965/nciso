const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initialize Supabase client (with fallback for development)
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware for tenant isolation
const validateTenant = async (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID required' });
  }

  // Verify user has access to this tenant
  if (req.user.tenant_id !== tenantId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }

  req.tenantId = tenantId;
  next();
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tenant_id } = req.body;

    // Validate input
    if (!email || !password || !name || !tenant_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // In development mode, simulate user creation
    if (!supabase) {
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      const mockUser = {
        id: 'dev-user-' + Date.now(),
        email,
        name,
        tenant_id,
        role: 'user',
        created_at: new Date().toISOString()
      };

      return res.status(201).json({
        message: 'User registered successfully (development mode)',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          tenant_id: mockUser.tenant_id,
          role: mockUser.role
        }
      });
    }

    // Production code with Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          tenant_id
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        tenant_id,
        role: 'user',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // In development mode, simulate login
    if (!supabase) {
      const mockUser = {
        id: 'dev-user-123',
        email,
        name: 'Development User',
        tenant_id: 'dev-tenant',
        role: 'user'
      };

      const token = jwt.sign(
        {
          user_id: mockUser.id,
          email: mockUser.email,
          tenant_id: mockUser.tenant_id,
          role: mockUser.role
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful (development mode)',
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          tenant_id: mockUser.tenant_id,
          role: mockUser.role
        }
      });
    }

    // Production code with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        tenant_id: user.tenant_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      // Development mode - return mock user
      return res.json({
        user: {
          id: req.user.user_id,
          email: req.user.email,
          name: 'Development User',
          tenant_id: req.user.tenant_id,
          role: req.user.role,
          created_at: new Date().toISOString()
        }
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.user_id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!supabase) {
      // Development mode
      return res.json({
        message: 'Profile updated successfully (development mode)',
        user: {
          id: req.user.user_id,
          email: email || req.user.email,
          name: name || 'Development User',
          tenant_id: req.user.tenant_id,
          role: req.user.role
        }
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: name || undefined,
        email: email || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.user_id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users (admin only)
router.get('/users', authenticateToken, validateTenant, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!supabase) {
      // Development mode - return mock users
      return res.json({
        users: [
          {
            id: 'dev-user-1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString()
          },
          {
            id: 'dev-user-2',
            email: 'user@example.com',
            name: 'Regular User',
            role: 'user',
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('tenant_id', req.tenantId);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({ users });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 