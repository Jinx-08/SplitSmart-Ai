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

