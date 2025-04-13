import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiMoon, FiSun, FiStar, FiClock, FiExternalLink, FiBookmark } from 'react-icons/fi';
import { FaStar, FaRegStar } from 'react-icons/fa';

const App = () => {
  const [query, setQuery] = useState('');
  const [topN, setTopN] = useState(5);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [theme, setTheme] = useState('light');
  const [expandedItems, setExpandedItems] = useState({});
  const [savedPapers, setSavedPapers] = useState([]);
  const [activeTab, setActiveTab] = useState('search');

  // Load saved searches and papers from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    const savedPapersData = localStorage.getItem('savedPapers');
    
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    if (savedPapersData) {
      setSavedPapers(JSON.parse(savedPapersData));
    }
  }, []);

  // Toggle dark/light theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  // Save a search to history
  const saveSearch = (searchQuery) => {
    const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle search functionality
  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/recommend/', {
        query,
        top_n: topN
      });
      
      setRecommendations(response.data.recommendations);
      saveSearch(query);
    } catch (err) {
      setError('Error fetching recommendations. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Handle applying a previous search
  const applySearch = (searchQuery) => {
    setQuery(searchQuery);
    document.getElementById('search-input')?.focus();
  };

  // Toggle expanded state for a paper
  const toggleExpand = (index) => {
    setExpandedItems({
      ...expandedItems,
      [index]: !expandedItems[index]
    });
  };

  // Save or unsave a paper
  const toggleSavePaper = (paper) => {
    const paperExists = savedPapers.some(p => p.title === paper.title);
    
    let updatedSavedPapers;
    if (paperExists) {
      updatedSavedPapers = savedPapers.filter(p => p.title !== paper.title);
    } else {
      updatedSavedPapers = [...savedPapers, paper];
    }
    
    setSavedPapers(updatedSavedPapers);
    localStorage.setItem('savedPapers', JSON.stringify(updatedSavedPapers));
  };

  // Check if a paper is saved
  const isPaperSaved = (paper) => {
    return savedPapers.some(p => p.title === paper.title);
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format terms as tags
  const formatTerms = (terms) => {
    if (!terms) return [];
    return terms.split(',').map(term => term.trim());
  };

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-indigo-50 to-purple-50 text-gray-900'} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gradient-to-r from-purple-800 to-indigo-900' : 'bg-gradient-to-r from-violet-600 to-indigo-600'} text-white shadow-lg`}>
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/20'}`}>
                <FiBookmark className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">ResearchHub</h1>
                <p className="text-sm opacity-90">Discover relevant academic papers instantly</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-full transition-all ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex border-b mb-8 justify-center">
          <button 
            className={`px-6 py-3 font-medium text-sm tracking-wide flex items-center space-x-2 transition-all ${
              activeTab === 'search' 
                ? (theme === 'dark' ? 'border-b-2 border-purple-400 text-purple-400' : 'border-b-2 border-indigo-600 text-indigo-600') 
                : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
            }`}
            onClick={() => setActiveTab('search')}
          >
            <FiSearch />
            <span>Search</span>
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm tracking-wide flex items-center space-x-2 transition-all ${
              activeTab === 'saved' 
                ? (theme === 'dark' ? 'border-b-2 border-purple-400 text-purple-400' : 'border-b-2 border-indigo-600 text-indigo-600') 
                : (theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
            }`}
            onClick={() => setActiveTab('saved')}
          >
            <FiStar />
            <span>Saved Papers ({savedPapers.length})</span>
          </button>
        </div>

        {activeTab === 'search' && (
          <>
            {/* Search Box */}
            <div className={`p-6 rounded-xl shadow-lg mb-8 transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-indigo-100/50'}`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <label className="block text-sm font-medium mb-2">Research Topic</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className={`${theme === 'dark' ? 'text-purple-400' : 'text-indigo-500'}`} />
                    </div>
                    <input
                      id="search-input"
                      type="text"
                      placeholder="E.g., machine learning in healthcare, quantum computing..."
                      className={`pl-10 pr-4 py-3 border rounded-lg w-full focus:ring-2 focus:outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 focus:ring-purple-500 focus:border-purple-400' 
                          : 'bg-gray-50 border-gray-300 focus:ring-indigo-300 focus:border-indigo-500'
                      }`}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium mb-2">Results</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className={`p-3 border rounded-lg w-full focus:ring-2 focus:outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 focus:ring-purple-500 focus:border-purple-400' 
                        : 'bg-gray-50 border-gray-300 focus:ring-indigo-300 focus:border-indigo-500'
                    }`}
                    value={topN}
                    onChange={(e) => setTopN(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                    } ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <FiSearch />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center space-x-2">
                    <FiClock className={`${theme === 'dark' ? 'text-purple-400' : 'text-indigo-500'}`} />
                    <span>Recent Searches</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => applySearch(search)}
                        className={`text-xs px-3 py-1 rounded-full transition-all flex items-center space-x-1 ${
                          theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-purple-300 border border-purple-700' 
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                theme === 'dark' ? 'bg-red-900/30 border border-red-800 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <div className="mt-0.5">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 tracking-tight text-center">Recommendations</h2>
                <div className="grid gap-6">
                  {recommendations.map((paper, index) => (
                    <div 
                      key={index} 
                      className={`rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                          : 'bg-white hover:bg-gray-50 border border-indigo-100'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold mb-2 truncate">{paper.title}</h3>
                            {paper.authors && (
                              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {paper.authors}
                              </p>
                            )}
                          </div>
                          <button 
                            onClick={() => toggleSavePaper(paper)}
                            className={`p-2 rounded-full transition-colors ml-4 ${
                              isPaperSaved(paper) 
                                ? (theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-500 hover:text-yellow-600') 
                                : (theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500')
                            }`}
                            aria-label={isPaperSaved(paper) ? "Remove from saved" : "Save paper"}
                          >
                            {isPaperSaved(paper) ? <FaStar className="text-lg" /> : <FaRegStar className="text-lg" />}
                          </button>
                        </div>
                        
                        <div className="mt-3">
                          <p className={`${expandedItems[index] ? '' : 'line-clamp-3'} ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {paper.summary}
                          </p>
                          {paper.summary && paper.summary.length > 150 && (
                            <button 
                              onClick={() => toggleExpand(index)}
                              className={`mt-2 text-sm font-medium flex items-center space-x-1 ${
                                theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-600 hover:text-indigo-500'
                              }`}
                            >
                              <span>{expandedItems[index] ? 'Show less' : 'Show more'}</span>
                            </button>
                          )}
                        </div>
                        
                        {paper.terms && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {formatTerms(paper.terms).map((term, idx) => (
                              <span 
                                key={idx} 
                                className={`text-xs px-3 py-1 rounded-full ${
                                  theme === 'dark' 
                                    ? 'bg-purple-900/40 text-purple-300 border border-purple-800 hover:bg-purple-800/40' 
                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                                } transition-colors`}
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
                          {paper.year && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              Published: {paper.year}
                            </span>
                          )}
                          {paper.url && (
                            <a 
                              href={paper.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-sm font-medium flex items-center space-x-1 px-4 py-1.5 rounded-lg ${
                                theme === 'dark' 
                                  ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-800' 
                                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
                              }`}
                            >
                              <span>View Paper</span>
                              <FiExternalLink className="text-xs" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-center w-full">Saved Papers</h2>
              {savedPapers.length > 0 && (
                <span className={`text-sm px-3 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {savedPapers.length} {savedPapers.length === 1 ? 'paper' : 'papers'}
                </span>
              )}
            </div>
            
            {savedPapers.length === 0 ? (
              <div className={`p-12 text-center rounded-xl ${theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-indigo-100'} shadow-md`}>
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-4">
                  <FiStar className="text-2xl" />
                </div>
                <h3 className="text-lg font-medium mb-2">No saved papers yet</h3>
                <p className={`max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  When you find interesting papers during your search, click the star icon to save them here for future reference.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {savedPapers.map((paper, index) => (
                  <div 
                    key={index} 
                    className={`rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                        : 'bg-white hover:bg-gray-50 border border-indigo-100'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-2 truncate">{paper.title}</h3>
                          {paper.authors && (
                            <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {paper.authors}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => toggleSavePaper(paper)}
                          className={`p-2 rounded-full transition-colors ml-4 ${
                            theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-500 hover:text-yellow-600'
                          }`}
                          aria-label="Remove from saved"
                        >
                          <FaStar className="text-lg" />
                        </button>
                      </div>
                      <p className={`mt-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{paper.summary}</p>
                      {paper.terms && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {formatTerms(paper.terms).map((term, idx) => (
                            <span 
                              key={idx} 
                              className={`text-xs px-3 py-1 rounded-full ${
                                theme === 'dark' 
                                  ? 'bg-purple-900/40 text-purple-300 border border-purple-800 hover:bg-purple-800/40' 
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                              } transition-colors`}
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between">
                        {paper.year && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Published: {paper.year}
                          </span>
                        )}
                        {paper.url && (
                          <a 
                            href={paper.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-sm font-medium flex items-center space-x-1 px-4 py-1.5 rounded-lg ${
                              theme === 'dark' 
                                ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-800' 
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
                            }`}
                          >
                            <span>View Paper</span>
                            <FiExternalLink className="text-xs" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-8 ${theme === 'dark' ? 'bg-gray-800 text-gray-400 border-t border-gray-700' : 'bg-indigo-100 text-indigo-800 border-t border-indigo-200'}`}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <FiBookmark className="text-xl" />
                <span className="font-bold">ResearchHub</span>
              </div>
              <p className="text-sm mt-1">Find academic papers that matter to your research</p>
            </div>
            <div className="text-sm">
              <p>© {new Date().getFullYear()} ResearchHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;