import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, Clock, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('content_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Published': return 'bg-green-100 text-green-700 border-green-200';
      case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ready': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Draft
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Dashboard</h2>
          <p className="text-gray-500">Track and manage all generated content</p>
        </div>
        <Link 
          to="/build" 
          className="bg-gradient-to-r from-[#2BAA99] to-[#0AACFF] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
        >
          + New Content
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Topic / Idea</th>
                <th className="px-6 py-4 font-medium">Audience & Media</th>
                <th className="px-6 py-4 font-medium">Launch Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No content logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-gray-900 font-medium line-clamp-1 max-w-sm" title={log.topic}>{log.topic}</p>
                          <p className="text-gray-500 text-xs line-clamp-1 max-w-sm">{log.key_agenda || log.idea}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-xs w-fit text-gray-600">{log.target_audience || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{log.media_type || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {log.launch_date ? new Date(log.launch_date).toLocaleDateString() : 'TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/content/${log.id}`}
                        className="inline-flex items-center gap-2 text-[#0AACFF] hover:text-[#2BAA99] font-medium transition"
                      >
                        View & Edit <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
