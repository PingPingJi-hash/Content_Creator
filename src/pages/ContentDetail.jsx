import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, Image as ImageIcon, BarChart3, MessageSquare, Target, Settings2 } from 'lucide-react';

export default function ContentDetail({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [topic, setTopic] = useState('');
  const [captions, setCaptions] = useState({});
  const [status, setStatus] = useState('Draft');
  const [imageUrl, setImageUrl] = useState('');
  const [metrics, setMetrics] = useState({ views: 0, reach: 0, clicks: 0, engRate: '' });
  
  // New Gen and Note Fields
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
      setStatus(data.status || 'Draft');
      setImageUrl(data.image_url || '');
      setMetrics(data.metrics || { views: 0, reach: 0, clicks: 0, engRate: '' });
      setComments(data.comments || []);

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

    } catch (err) {
      console.error('Error fetching content:', err);
      alert("Error loading content.");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('content_logs')
        .update({
          topic, captions, status, image_url: imageUrl, metrics,
          key_agenda: keyAgenda, objective, content_pillar: contentPillar,
          funnel_stage: funnelStage, ads_strategy: adsStrategy,
          target_audience: audience, cta, precautions,
          launch_date: launchDate || null, media_type: mediaType,
          estimated_budget: budget, kpis
        })
        .eq('id', id);

      if (error) throw error;
      alert("Saved successfully!");
    } catch (err) {
      console.error('Error saving content:', err);
      alert("Error saving.");
    } finally {
      setSaving(false);
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

  if (loading) return <div className="p-8 text-center text-gray-400">Loading content...</div>;
  if (!content) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#27272a] rounded-full text-gray-400 transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Content & Strategy</h2>
            <p className="text-gray-400 text-sm">ID: {id.slice(0, 8)}...</p>
          </div>
        </div>
        <button 
          onClick={handleSave} disabled={saving}
          className="bg-gradient-to-r from-[#2BAA99] to-[#0AACFF] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Content Edits */}
          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-white">Content Copy</h3>
               <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white focus:outline-none focus:border-[#2BAA99] w-48 text-sm">
                  <option value="Draft">Draft</option>
                  <option value="Waiting for Approval">Waiting for Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
               </select>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Generated Topic / Headline</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-white focus:outline-none focus:border-[#2BAA99]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Platform Captions</label>
                <div className="space-y-4">
                  {Object.keys(captions).map(platform => (
                    <div key={platform}>
                      <span className="text-xs font-bold text-[#8126F4] uppercase block mb-1">{platform}</span>
                      <textarea value={captions[platform]} onChange={(e) => setCaptions({...captions, [platform]: e.target.value})} className="w-full h-32 bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4] resize-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Details (Gen Fields) */}
          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <Target className="w-5 h-5 text-[#8126F4]" /> Strategy Setup (Gen)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Headline/วาระสำคัญ</label><input type="text" value={keyAgenda} onChange={(e) => setKeyAgenda(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Objective</label><input type="text" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Content Pillar</label><input type="text" value={contentPillar} onChange={(e) => setContentPillar(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Funnel Stage</label><input type="text" value={funnelStage} onChange={(e) => setFunnelStage(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Audience</label><input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-400 mb-1">Ads Strategy</label><input type="text" value={adsStrategy} onChange={(e) => setAdsStrategy(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">CTA</label><input type="text" value={cta} onChange={(e) => setCta(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-yellow-500 mb-1">Precautions</label><input type="text" value={precautions} onChange={(e) => setPrecautions(e.target.value)} className="w-full bg-[#18181b] border border-yellow-500/50 rounded-lg p-2 text-white text-sm" /></div>
             </div>
          </div>
          
          {/* Comments Section */}
          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0AACFF]" /> Approval & Comments
            </h3>
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
              {comments.map((c, i) => (
                <div key={i} className="bg-[#18181b] p-3 rounded-lg border border-[#27272a]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-300">{c.user}</span>
                    <span className="text-xs text-gray-500">{new Date(c.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-200">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white focus:outline-none focus:border-[#0AACFF]" onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
              <button onClick={handleAddComment} className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-sm transition">Send</button>
            </div>
          </div>
        </div>

        {/* Sidebar Column (Tracking & Info) */}
        <div className="space-y-6">

          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#0AACFF]" /> Internal Info
            </h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Launch Date</label><input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm style-color-scheme-dark" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Media Type</label><input type="text" value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Budget (Est.)</label><input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">KPIs</label><input type="text" value={kpis} onChange={(e) => setKpis(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
            </div>
          </div>

          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#8126F4]" /> Artwork Link
            </h3>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm mb-3" />
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-lg border border-[#27272a] object-cover" />}
          </div>

          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2BAA99]" /> Tracking Metrics
            </h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Views / Impressions</label><input type="number" value={metrics.views || 0} onChange={(e) => setMetrics({...metrics, views: parseInt(e.target.value) || 0})} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Reach</label><input type="number" value={metrics.reach || 0} onChange={(e) => setMetrics({...metrics, reach: parseInt(e.target.value) || 0})} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Actions / Clicks</label><input type="number" value={metrics.clicks || 0} onChange={(e) => setMetrics({...metrics, clicks: parseInt(e.target.value) || 0})} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Engagement Rate (%)</label><input type="text" value={metrics.engRate || ''} onChange={(e) => setMetrics({...metrics, engRate: e.target.value})} placeholder="e.g. 5.2%" className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-2 text-white text-sm" /></div>
            </div>
          </div>
          
          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
             <h3 className="text-sm font-semibold text-gray-300 mb-2">Master Prompt Info</h3>
             <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a] max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-500 whitespace-pre-wrap">{content.master_prompt}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
