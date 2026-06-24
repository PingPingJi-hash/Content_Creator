import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateContent } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, Bot, Database } from 'lucide-react';

export default function Generator() {
  const navigate = useNavigate();
  
  // Gen Info
  const [idea, setIdea] = useState('');
  const [keyAgenda, setKeyAgenda] = useState('');
  const [objective, setObjective] = useState('');
  const [contentPillar, setContentPillar] = useState('Educate');
  const [funnelStage, setFunnelStage] = useState('Awareness (top of funnel)');
  const [adsStrategy, setAdsStrategy] = useState('');
  const [audience, setAudience] = useState('Mass (General Audience)');
  const [cta, setCta] = useState('อ่านรายละเอียดเพิ่มเติมได้ที่หน้าเว็บไซต์');
  const [precautions, setPrecautions] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['LinkedIn', 'Facebook']);
  
  // Note Info (No Gen)
  const [launchDate, setLaunchDate] = useState('');
  const [mediaType, setMediaType] = useState('Single Image');
  const [budget, setBudget] = useState('');
  const [kpis, setKpis] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform.");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedResult(null);

    const payload = {
      idea, key_agenda: keyAgenda, objective, content_pillar: contentPillar,
      funnel_stage: funnelStage, ads_strategy: adsStrategy, target_audience: audience,
      cta, precautions, platforms: selectedPlatforms
    };

    try {
      const result = await generateContent(payload);
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
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('content_logs')
        .insert([{
          // Generated Content
          idea: idea,
          topic: generatedResult.topic,
          captions: generatedResult.captions,
          master_prompt: generatedResult.master_prompt,
          status: 'Draft',
          user_id: user?.id,
          // Gen Fields
          key_agenda: keyAgenda,
          objective: objective,
          content_pillar: contentPillar,
          funnel_stage: funnelStage,
          ads_strategy: adsStrategy,
          target_audience: audience,
          cta: cta,
          precautions: precautions,
          // Note Fields
          launch_date: launchDate || null,
          media_type: mediaType,
          estimated_budget: budget,
          kpis: kpis
        }])
        .select()
        .single();

      if (error) throw error;
      navigate(`/content/${data.id}`);
      
    } catch (err) {
      console.error("Error saving to Supabase:", err);
      alert("Failed to save. Check Supabase connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Content Generator</h2>
        <p className="text-gray-400">Plan your strategy and let AI generate the content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: AI Generation Info */}
          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <h3 className="text-xl font-bold text-[#8126F4] mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5" /> AI Generation Settings (Gen)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Key Message & Context</label>
                <textarea
                  className="w-full h-24 bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4] resize-none"
                  placeholder="Tell the AI the main story or context..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Headline / วาระสำคัญ</label>
                <input 
                  type="text" value={keyAgenda} onChange={(e) => setKeyAgenda(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Objective</label>
                <input 
                  type="text" value={objective} onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Content Pillar</label>
                <select value={contentPillar} onChange={(e) => setContentPillar(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]">
                  {['Company Culture', 'Product Showcase', 'Educate', 'Solutions', 'Help Content', 'PR', 'Seasonal', 'Testimonial, Case Study', 'Activity, Successfully'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Funnel Stage</label>
                <select value={funnelStage} onChange={(e) => setFunnelStage(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]">
                  {['Awareness (top of funnel)', 'Consideration', 'Conversion', 'PR', 'Brand'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]">
                  {['Executive / C-Level', 'Facility Manager', 'Mass (General Audience)', 'B2B Partners'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ads Strategy / Targeting</label>
                <input 
                  type="text" value={adsStrategy} onChange={(e) => setAdsStrategy(e.target.value)} placeholder="e.g. Lookalike 1%, Retargeting"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Call To Action (CTA)</label>
                <input 
                  type="text" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="e.g. ทัก Inbox เพื่อรับคำปรึกษา"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#8126F4]"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-yellow-500 mb-1">Precautions (ข้อควรระวัง)</label>
                <input 
                  type="text" value={precautions} onChange={(e) => setPrecautions(e.target.value)} placeholder="e.g. ห้ามเคลมเกินจริง, หลีกเลี่ยงคำว่า 'ที่สุด'"
                  className="w-full bg-[#18181b] border border-yellow-500/50 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Platforms</label>
                <div className="flex gap-4">
                  {['LinkedIn', 'Facebook', 'Website/Blog'].map(platform => (
                    <label key={platform} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={selectedPlatforms.includes(platform)} onChange={(e) => {
                        if (e.target.checked) setSelectedPlatforms([...selectedPlatforms, platform]);
                        else setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                      }} className="accent-[#2BAA99]" /> {platform}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !idea.trim()}
              className="w-full mt-6 bg-gradient-to-r from-[#8126F4] via-[#2BAA99] to-[#0AACFF] text-white font-medium py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : 'Generate Content'}
            </button>
          </div>

          {/* Section 2: Internal Note Info */}
          <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg">
            <h3 className="text-xl font-bold text-[#0AACFF] mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" /> Internal Notes (No Gen)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exp. Launch Date</label>
                <input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#0AACFF] style-color-scheme-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Media Type</label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#0AACFF]">
                  {['Single Image', 'Video', 'Carousel', 'Article', 'Document'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Budget (Est.)</label>
                <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 5,000 THB" className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#0AACFF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">KPIs</label>
                <input type="text" value={kpis} onChange={(e) => setKpis(e.target.value)} placeholder="e.g. 10k Reach, 5 Leads" className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-gray-200 focus:outline-none focus:border-[#0AACFF]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272a] shadow-lg flex flex-col h-fit sticky top-8">
          <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
          
          {!generatedResult && !isGenerating && (
            <div className="flex-1 flex items-center justify-center text-gray-500 border-2 border-dashed border-[#27272a] rounded-lg h-64">
              Waiting for input...
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#2BAA99]" />
              <p>Analyzing context & crafting copy...</p>
            </div>
          )}

          {generatedResult && (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              <div>
                <h4 className="text-[#2BAA99] text-sm font-semibold uppercase tracking-wider mb-2">Generated Topic</h4>
                <p className="text-white text-lg bg-[#18181b] p-3 rounded-lg border border-[#27272a]">{generatedResult.topic}</p>
              </div>
              <div>
                <h4 className="text-[#0AACFF] text-sm font-semibold uppercase tracking-wider mb-2">Master Image Prompt</h4>
                <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a]">
                  <p className="text-gray-300 text-sm italic whitespace-pre-wrap">{generatedResult.master_prompt}</p>
                </div>
              </div>
              <div>
                <h4 className="text-[#8126F4] text-sm font-semibold uppercase tracking-wider mb-2">Platform Captions</h4>
                <div className="space-y-3">
                  {Object.entries(generatedResult.captions).map(([platform, text]) => (
                    <div key={platform} className="bg-[#18181b] p-3 rounded-lg border border-[#27272a]">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">{platform}</span>
                      <p className="text-gray-200 text-sm whitespace-pre-wrap">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveToLog}
                disabled={isSaving}
                className="w-full bg-[#18181b] border border-[#2BAA99] text-[#2BAA99] font-medium py-3 rounded-lg hover:bg-[#2BAA99] hover:text-white transition flex justify-center items-center gap-2 mt-4 sticky bottom-0"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save & Edit Details'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
