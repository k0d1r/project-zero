import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/news', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setNews(response.data.articles);
    } catch (err) {
      setError('Haberler yüklenirken bir hata oluştu');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNews();
    }
  }, [user]);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home">
      <h1>Haberler</h1>
      <div className="news-grid">
        {news.map((article, index) => (
          <div key={index} className="news-card">
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} />
            )}
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Devamını Oku
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 