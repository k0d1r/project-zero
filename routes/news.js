const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Test endpoint'i
router.get('/test', async (req, res) => {
  try {
    // Test için farklı parametrelerle deneme yapalım
    const testParams = [
      'q=ekonomi&language=tr',
      'q=teknoloji&language=tr',
      'q=spor&language=tr',
      'q=siyaset&language=tr',
      'q=sağlık&language=tr'
    ];

    const results = [];
    
    for (const params of testParams) {
      const url = `https://newsapi.org/v2/everything?${params}&apiKey=${process.env.NEWS_API_KEY}`;
      console.log('Testing URL:', url);
      
      const response = await axios.get(url);
      results.push({
        params,
        status: response.status,
        data: response.data
      });
    }

    res.json(results);
  } catch (err) {
    console.error('API Error:', err.message);
    if (err.response) {
      console.error('API Error Details:', err.response.data);
    }
    res.status(500).json({ error: err.message });
  }
});

// Haberleri getir
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const categories = user.preferences.join(',');
    
    console.log('API Key:', process.env.NEWS_API_KEY);
    console.log('Categories:', categories);
    
    // Her kategori için ayrı arama yapalım
    const searchTerms = {
      general: 'gündem',
      business: 'ekonomi',
      technology: 'teknoloji',
      sports: 'spor',
      entertainment: 'eğlence',
      health: 'sağlık',
      science: 'bilim'
    };

    let allArticles = [];
    
    for (const category of user.preferences) {
      const searchTerm = searchTerms[category] || category;
      const url = `https://newsapi.org/v2/everything?q=${searchTerm}&language=tr&apiKey=${process.env.NEWS_API_KEY}`;
      console.log('Searching URL:', url);
      
      const response = await axios.get(url);
      console.log(`${category} Response:`, JSON.stringify(response.data, null, 2));
      
      if (response.data.articles && response.data.articles.length > 0) {
        allArticles = [...allArticles, ...response.data.articles];
      }
    }

    if (allArticles.length === 0) {
      console.log('Haber bulunamadı');
      return res.json({ status: 'ok', totalResults: 0, articles: [] });
    }

    // Sonuçları karıştır ve en fazla 20 haber döndür
    allArticles = allArticles.sort(() => Math.random() - 0.5).slice(0, 20);
    
    res.json({
      status: 'ok',
      totalResults: allArticles.length,
      articles: allArticles
    });
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('API Error Details:', err.response.data);
    }
    res.status(500).send('Server Error');
  }
});

// Kullanıcı tercihlerini güncelle
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 