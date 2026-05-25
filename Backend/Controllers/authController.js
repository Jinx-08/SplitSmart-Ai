const supabase = require('../Supabase/client')
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
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
    
    // Generate JWT token
    const token = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

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
    
    // Generate JWT token
    const token = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
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
      const userId = req.user.id;
      try {
        const { data, error } = await supabase.auth.getUserById(userId);
        if (error) return res.status(400).json({ error: error.message });
        res.json({
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.user_metadata?.first_name,
          last_name: data.user.user_metadata?.last_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          message: 'User fetched successfully'
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
} 


exports.logoutcontroller = async (req, res) => {
  const token = req.headers.authorization || req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const { error } = await supabase.auth.signOut();
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
    const updates = {};
    if (first_name) updates['user_metadata.first_name'] = first_name;
    if (last_name) updates['user_metadata.last_name'] = last_name;
    if (email) updates.email = email;
    if (password) updates.password = password;
    const { data, error } = await supabase.auth.update(updates);
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