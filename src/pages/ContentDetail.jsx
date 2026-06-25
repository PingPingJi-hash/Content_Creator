import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateContent } from '../lib/gemini';
import { Save, ArrowLeft, Image as ImageIcon, BarChart3, MessageSquare, Target, Settings2, Trash2, RefreshCcw, Loader2 } from 'lucide-react';

export default function ContentDetail({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Form State
  const [topic, setTopic] = useState('');
  const [captions, setCaptions] = useState({});
  const [artworkWording, setArtworkWording] = useState('');
  const [masterPrompt, setMasterPrompt] = useState('');
  const [status, setStatus] = useState('Draft');
  const [imageUrl, setImageUrl] = useState('');
  const [metrics, setMetrics] = useState({ views: 0, reach: 0, clicks: 0, engRate: '' });
  
  // Gen and Note Fields
  const [idea, setIdea] = useState('');
  const [keyAgenda, setKeyAgenda] = useState('');
  const [objective, setObjective] = useState('');
  const [contentPillar, setContentPillar] = useState('');
  const [funnelStage, setFunnelStage] = useState('');
  const [adsStrategy, setAdsStrategy] = useState('');
  const [audience, setAudience] = useState('');
  const [cta, setCta] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [budget, setBudget] = useState('');
  const [kpis, setKpis] = useState('');
  const [platforms, setPlatforms] = useState([]);

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase.from('content_logs').select('*').eq('id', id).single();
      if (error) throw error;
      
      setContent(data);
      setTopic(data.topic || '');
      setCaptions(data.captions || {});
      setArtworkWording(data.artwork_wording || '');
      setMasterPrompt(data.master_prompt || '');
      setStatus(data.status || 'Draft');
      setImageUrl(data.image_url || '');
      setMetrics(data.metrics || { views: 0, reach: 0, clicks: 0, engRate: '' });
      setComments(data.comments || []);

      setIdea(data.idea || '');
      setKeyAgenda(data.key_agenda || '');
      setObjective(data.objective || '');
      setContentPillar(data.content_pillar || '');
      setFunnelStage(data.funnel_stage || '');
      setAdsStrategy(data.ads_strategy || '');
      setAudience(data.target_audience || '');
      setCta(data.cta || '');
      setPrecautions(data.precautions || '');
      setLaunchDate(data.launch_date || '');
      setMediaType(data.media_type || '');
      setBudget(data.estimated_budget || '');
      setKpis(data.kpis || '');
      
      // Infer platforms from captions if possible
      if (data.captions) {
        setPlatforms(Object.keys(data.captions));
      }

    } catch (err) {
      console.error('Error fetching content:', err);
      alert("Error loading content. ID may be invalid.");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create update payload carefully, ensuring we handle potential null/empty fields gracefully
      const updatePayload = {
        topic, captions, status, image_url: imageUrl, metrics,
        artwork_wording: artworkWording,
        master_prompt: masterPrompt,
        idea, key_agenda: keyAgenda, objective, content_pillar: contentPillar,
        funnel_stage: funnelStage, ads_strategy: adsStrategy,
        target_audience: audience, cta, precautions,
        launch_date: launchDate || null, media_type: mediaType,
        estimated_budget: budget, kpis
      };

      const { error } = await supabase.from('content_logs').update(updatePayload).eq('id', id);

      if (error) throw error;
      alert("Saved successfully!");
    } catch (err) {
      console.error('Error saving content:', err);
      alert("Error saving. Please check your Supabase schema configuration. Make sure all columns exist.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase.from('content_logs').delete().eq('id', id);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Error deleting:', err);
      alert("Failed to delete content.");
      setDeleting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("This will overwrite the current Topic, Captions, Artwork Wording, and Master Prompt. Do you want to proceed?")) return;
    
    setRegenerating(true);
    
    // Ensure we have at least one platform fallback
    const targetPlatforms = platforms.length > 0 ? platforms : ['LinkedIn', 'Facebook'];
    
    const payload = {
      idea, key_agenda: keyAgenda, objective, content_pillar: contentPillar,
      funnel_stage: funnelStage, ads_strategy: adsStrategy, target_audience: audience,
      cta, precautions, platforms: targetPlatforms
    };

    try {
      const result = await generateContent(payload);
      setTopic(result.topic);
      setCaptions(result.captions);
      setArtworkWording(result.artwork_wording || '');
      setMasterPrompt(result.master_prompt || '');
      alert("Regeneration complete! Don't forget to Save your changes.");
    } catch (err) {
      console.error("Regeneration failed:", err);
      alert("Failed to regenerate. Check console or API key.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const commentObj = { user: session?.user?.email, text: newComment, date: new Date().toISOString() };
    const updatedComments = [...comments, commentObj];
    setComments(updatedComments);
    setNewComment('');
    try { await supabase.from('content_logs').update({ comments: updatedComments }).eq('id', id); } 
    catch (e) { console.error("Error saving comment"); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading content...</div>;
  if (!content) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Content & Strategy</h2>
            <p className="text-gray-500 text-sm">ID: {id.slice(0, 8)}...</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleDelete} disabled={deleting}
            className="flex-1 md:flex-none border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition flex justify-center items-center gap-2"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
          </button>

          <button 
            onClick={handleRegenerate} disabled={regenerating || status !== 'Draft'}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition flex justify-center items-center gap-2 ${
              status === 'Draft' 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title={status !== 'Draft' ? "Must be in Draft status to regenerate" : ""}
          >
            {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />} Regenerate
          </button>

          <button 
            onClick={handleSave} disabled={saving}
            className="flex-1 md:flex-none bg-gradient-to-r from-[#2BAA99] to-[#0AACFF] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition flex justify-center items-center gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Content Edits */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-gray-900">Content Copy</h3>
               <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-gray-500">Status:</span>
                 <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:border-[#2BAA99] w-48 text-sm font-medium shadow-sm">
                    <option value="Draft">Draft</option>
                    <option value="Waiting for Approval">Waiting for Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                 </select>
               </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generated Topic / Headline</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-[#2BAA99] focus:ring-1 focus:ring-[#2BAA99]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-1">Artwork Wording (Text for Poster)</label>
                <input type="text" value={artworkWording} onChange={(e) => setArtworkWording(e.target.value)} className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-semibold" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Platform Captions</label>
                <div className="space-y-4">
                  {Object.keys(captions).map(platform => (
                    <div key={platform}>
                      <span className="text-xs font-bold text-[#8126F4] uppercase block mb-1">{platform}</span>
                      <textarea value={captions[platform]} onChange={(e) => setCaptions({...captions, [platform]: e.target.value})} className="w-full h-32 bg-white border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:border-[#8126F4] focus:ring-1 focus:ring-[#8126F4] resize-none leading-relaxed" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Details (Gen Fields) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Target className="w-5 h-5 text-[#8126F4]" /> Strategy Setup (Gen Data)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Key Message & Context</label><textarea value={idea} onChange={(e) => setIdea(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm h-20 resize-none" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Headline/วาระสำคัญ</label><input type="text" value={keyAgenda} onChange={(e) => setKeyAgenda(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Objective</label><input type="text" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Content Pillar</label><input type="text" value={contentPillar} onChange={(e) => setContentPillar(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Funnel Stage</label><input type="text" value={funnelStage} onChange={(e) => setFunnelStage(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Audience</label><input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Ads Strategy</label><input type="text" value={adsStrategy} onChange={(e) => setAdsStrategy(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">CTA</label><input type="text" value={cta} onChange={(e) => setCta(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-amber-600 mb-1">Precautions</label><input type="text" value={precautions} onChange={(e) => setPrecautions(e.target.value)} className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-900 text-sm" /></div>
             </div>
          </div>
          
          {/* Comments Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0AACFF]" /> Approval & Comments
            </h3>
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
              {comments.map((c, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-700">{c.user}</span>
                    <span className="text-xs text-gray-400">{new Date(c.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-800">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:border-[#0AACFF] focus:ring-1 focus:ring-[#0AACFF]" onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
              <button onClick={handleAddComment} className="bg-[#2BAA99] hover:bg-[#208a7b] text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">Send</button>
            </div>
          </div>
        </div>

        {/* Sidebar Column (Tracking & Info) */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#0AACFF]" /> Internal Info
            </h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Launch Date</label><input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#0AACFF] focus:ring-1 focus:ring-[#0AACFF]" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Media Type</label><input type="text" value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#0AACFF] focus:ring-1 focus:ring-[#0AACFF]" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Budget (Est.)</label><input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#0AACFF] focus:ring-1 focus:ring-[#0AACFF]" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">KPIs</label><input type="text" value={kpis} onChange={(e) => setKpis(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#0AACFF] focus:ring-1 focus:ring-[#0AACFF]" /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#8126F4]" /> Artwork Link
            </h3>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm mb-3 focus:border-[#8126F4] focus:ring-1 focus:ring-[#8126F4]" />
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-lg border border-gray-200 object-cover shadow-sm" />}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-gray-700 mb-2">Master Prompt Info</h3>
             <textarea 
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                className="w-full bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-gray-700 whitespace-pre-wrap h-32 resize-none focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
             />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2BAA99]" /> Tracking Metrics
            </h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Views / Impressions</label><input type="number" value={metrics.views || 0} onChange={(e) => setMetrics({...metrics, views: parseInt(e.target.value) || 0})} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#2BAA99] focus:ring-1 focus:ring-[#2BAA99]" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Reach</label><input type="number" value={metrics.reach || 0} onChange={(e) => setMetrics({...metrics, reach: parseInt(e.target.value) || 0})} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#2BAA99] focus:ring-1 focus:ring-[#2BAA99]" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Actions / Clicks</label><input type="number" value={metrics.clicks || 0} onChange={(e) => setMetrics({...metrics, clicks: parseInt(e.target.value) || 0})} className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#2BAA99] focus:ring-1 focus:ring-[#2BAA99]" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Engagement Rate (%)</label><input type="text" value={metrics.engRate || ''} onChange={(e) => setMetrics({...metrics, engRate: e.target.value})} placeholder="e.g. 5.2%" className="w-full bg-white border border-gray-300 rounded-lg p-2 text-gray-900 text-sm focus:border-[#2BAA99] focus:ring-1 focus:ring-[#2BAA99]" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
