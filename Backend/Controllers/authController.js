const { supabase, supabaseAdmin } = require('../Supabase/client');
const { validationResult } = require('express-validator');
require('dotenv').config();

exports.registercontroller = async (req, res) => {
    const { first_name, last_name, email, password } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
    const { data, error } = await supabase.auth.signUp({
      email, 
      password,
      options: {
        data: { name: `${first_name} ${last_name}` }
      }
    })
    if (error) return res.status(400).json({ error: error.message }) 
    
    res.json({
      message: 'Registration successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      },
      token: data.session.access_token
  })  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })  
  }
}

exports.logincontroller = async (req, res) => {
  const { email, password } = req.body
    const errors = validationResult(req);   
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
  try {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return res.status(400).json({ error: error.message })    
    
  res.json({
  message: 'Login successful',
  user: {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name
  },
  token: data.session.access_token
})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })  
  } 
}

exports.getCurrentUser = async (req, res) => {
      const user = req.user;
      res.json({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        avatar_url: user.user_metadata?.avatar_url,
        message: 'User fetched successfully'
      });
} 


exports.logoutcontroller = async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' });
    }
    const { error } = await supabaseAdmin.auth.admin.signOut(req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY' });
    }

    const updates = {};
    const metadata = {};
    if (first_name) metadata.first_name = first_name;
    if (last_name) metadata.last_name = last_name;
    if (Object.keys(metadata).length > 0) updates.data = metadata;
    if (email) updates.email = email;
    if (password) updates.password = password;

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
    if (error) return res.status(400).json({ error: error.message });
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.user_metadata?.first_name,
        last_name: data.user.user_metadata?.last_name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}