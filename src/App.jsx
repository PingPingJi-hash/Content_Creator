import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { generateContent } from './lib/gemini';

function App() {
  const [currentView, setCurrentView] = useState('trace'); // 'trace' or 'build'
  
  // Build Form State
  const [idea, setIdea] = useState('');
  const [platforms, setPlatforms] = useState({
    linkedin: true,
    facebook: false,
    website: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  
  // Trace State
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (currentView === 'trace') {
      fetchLogs();
    }
  }, [currentView]);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    if (!supabase) {
      console.warn("Supabase not configured, using mock data");
      setLogs([{ id: 1, topic: 'Mock Topic', status: 'Draft', idea: 'Mock Idea', created_at: new Date().toISOString() }]);
      setIsLoadingLogs(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('content_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      alert("Failed to load logs. Is Supabase configured correctly?");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!idea) return alert('Please enter an idea.');
    
    const selectedPlatforms = Object.keys(platforms).filter(k => platforms[k]);
    if (selectedPlatforms.length === 0) return alert('Please select at least one platform.');

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const result = await generateContent(idea, selectedPlatforms);
      setGeneratedResult(result);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Check console or API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLog = async () => {
    if (!generatedResult) return;
    
    if (!supabase) {
      alert("Supabase not configured. Cannot save.");
      return;
    }

    try {
      const { error } = await supabase.from('content_logs').insert([{
        idea: idea,
        topic: generatedResult.topic,
        captions: generatedResult.captions,
        master_prompt: generatedResult.master_prompt,
        status: 'Draft'
      }]);

      if (error) throw error;
      alert("Saved to Content Log!");
      setCurrentView('trace');
      setIdea('');
      setGeneratedResult(null);
    } catch (err) {
      console.error("Error saving log:", err);
      alert("Failed to save. Check Supabase connection.");
    }
  };

  const handlePlatformChange = (platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <div className="logo-bar purple"></div>
            <div className="logo-bar teal"></div>
            <div className="logo-bar blue"></div>
          </div>
          <div className="logo-text">Nexza</div>
        </div>
        
        <ul className="nav-menu">
          <li 
            className={`nav-item ${currentView === 'trace' ? 'active' : ''}`}
            onClick={() => setCurrentView('trace')}
          >
            📋 Content Log (Trace)
          </li>
          <li 
            className={`nav-item ${currentView === 'build' ? 'active' : ''}`}
            onClick={() => setCurrentView('build')}
          >
            ✨ Generator (Build)
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {currentView === 'trace' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Content Log</h1>
              <p className="page-subtitle">Track and manage your marketing content</p>
            </div>

            <div className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                <h3>All Contents</h3>
                <button className="btn btn-primary" onClick={() => setCurrentView('build')}>+ New Content</button>
              </div>

              {isLoadingLogs ? (
                <p>Loading logs...</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Topic</th>
                        <th>Original Idea</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>No content found. Start building!</td></tr>
                      ) : logs.map(log => (
                        <tr key={log.id}>
                          <td style={{fontWeight: 500, color: 'var(--nexza-purple)'}}>{log.topic}</td>
                          <td>{log.idea.length > 50 ? log.idea.substring(0, 50) + '...' : log.idea}</td>
                          <td>
                            <span className={`status-badge status-${log.status ? log.status.toLowerCase() : 'draft'}`}>
                              {log.status || 'Draft'}
                            </span>
                          </td>
                          <td>{new Date(log.created_at).toLocaleDateString('th-TH')}</td>
                          <td>
                            {/* In a real app, clicking this would open a modal/page to edit */}
                            <button className="copy-btn">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'build' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Content Generator</h1>
              <p className="page-subtitle">Turn your ideas into Nexza-branded content & master prompts</p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              {/* Input Area */}
              <div className="card">
                <form onSubmit={handleGenerate}>
                  <div className="form-group">
                    <label className="form-label">What's the idea or objective?</label>
                    <textarea 
                      className="form-control" 
                      placeholder="e.g. We want to promote our new predictive maintenance feature for smart buildings..."
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Platforms</label>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={platforms.linkedin} onChange={() => handlePlatformChange('linkedin')} /> LinkedIn
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" checked={platforms.facebook} onChange={() => handlePlatformChange('facebook')} /> Facebook
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" checked={platforms.website} onChange={() => handlePlatformChange('website')} /> Website/Blog
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : '✨ Generate Content'}
                  </button>
                </form>
              </div>

              {/* Output Area */}
              <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h2 style={{margin: 0}}>Results</h2>
                  {generatedResult && (
                    <button className="btn btn-primary" onClick={handleSaveToLog}>Save to Log</button>
                  )}
                </div>

                {!generatedResult && !isGenerating && (
                  <p style={{color: 'var(--text-muted)', marginTop: '20px'}}>Your generated topic, captions, and master prompt will appear here.</p>
                )}

                {isGenerating && (
                  <div style={{marginTop: '20px'}}>
                    <p>Analyzing idea and applying Nexza Brand CI...</p>
                    {/* Simple loader */}
                    <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                      <div className="logo-bar purple" style={{animation: 'pulse 1s infinite alternate'}}></div>
                      <div className="logo-bar teal" style={{animation: 'pulse 1s infinite alternate 0.2s'}}></div>
                      <div className="logo-bar blue" style={{animation: 'pulse 1s infinite alternate 0.4s'}}></div>
                    </div>
                  </div>
                )}

                {generatedResult && (
                  <div style={{marginTop: '20px'}}>
                    <div className="output-section">
                      <h3>
                        Headline / Topic
                        <button className="copy-btn" onClick={() => copyToClipboard(generatedResult.topic)}>Copy</button>
                      </h3>
                      <p style={{fontWeight: 500}}>{generatedResult.topic}</p>
                    </div>

                    <div className="output-section">
                      <h3>Captions</h3>
                      {Object.keys(generatedResult.captions).map(platform => (
                        <div key={platform} style={{marginBottom: '16px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <strong style={{textTransform: 'capitalize'}}>{platform}:</strong>
                            <button className="copy-btn" onClick={() => copyToClipboard(generatedResult.captions[platform])}>Copy</button>
                          </div>
                          <p style={{whiteSpace: 'pre-wrap', marginTop: '8px', fontSize: '14px'}}>{generatedResult.captions[platform]}</p>
                        </div>
                      ))}
                    </div>

                    <div className="output-section" style={{borderColor: 'var(--nexza-purple)'}}>
                      <h3>
                        🖼️ Image Master Prompt
                        <button className="copy-btn" onClick={() => copyToClipboard(generatedResult.master_prompt)}>Copy Prompt</button>
                      </h3>
                      <p style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}>Copy this into Midjourney, DALL-E, or Gemini to generate your CI-compliant artwork.</p>
                      <div style={{backgroundColor: '#f0f0f0', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap'}}>
                        {generatedResult.master_prompt}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 0.3; transform: scaleX(0.8); }
          100% { opacity: 1; transform: scaleX(1); }
        }
      `}} />
    </div>
  );
}

export default App;
