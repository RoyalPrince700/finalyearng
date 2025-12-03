import { useState, useEffect } from 'react';
import { savedContentAPI } from '../api/api';
import { handleDownloadDocx, handleDownloadPdf } from '../utils/downloadUtils';
import { LuFileText, LuDownload, LuChevronDown, LuChevronRight } from 'react-icons/lu';

const SavedContent = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    loadProjectAndContents();
  }, []);

  const loadProjectAndContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all saved contents for the user, regardless of project
      const contentRes = await savedContentAPI.getSavedContents();
      setContents(contentRes.data.data || []);
      
    } catch (err) {
      console.error('Failed to load saved content:', err);
      setError('Failed to load saved content.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (category) => {
    setExpandedItems(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Sort order for categories
  const categoryOrder = [
    'Preliminary',
    'Chapter 1',
    'Chapter 2',
    'Chapter 3',
    'Chapter 4',
    'Chapter 5',
    'Reference'
  ];

  const sortedContents = [...contents].sort((a, b) => {
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-50 text-neutral-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-hidden">
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-neutral-900">Saved Content</h1>
        <p className="text-sm text-neutral-500">View and manage your saved project sections.</p>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {sortedContents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LuFileText className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No saved content yet</h3>
              <p className="text-neutral-500 max-w-sm mx-auto">
                When you're chatting with the AI, use the "Save" button to save specific sections here.
              </p>
            </div>
          ) : (
            sortedContents.map((item) => (
              <div 
                key={item.category} 
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all hover:shadow-md"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-neutral-50 transition-colors"
                  onClick={() => toggleExpand(item.category)}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-neutral-400">
                      {expandedItems[item.category] ? (
                        <LuChevronDown className="w-5 h-5" />
                      ) : (
                        <LuChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{item.category}</h3>
                      <p className="text-xs text-neutral-500">
                        Last saved: {new Date(item.savedAt).toLocaleDateString()} {new Date(item.savedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadDocx(item.content, item.category)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-neutral-200"
                    >
                      <LuDownload className="w-3 h-3" />
                      DOCX
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(item.content, item.category)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-neutral-200"
                    >
                      <LuDownload className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                </div>

                {expandedItems[item.category] && (
                  <div className="border-t border-neutral-100 p-4 bg-neutral-50/50">
                    <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap font-sans">
                      {item.content}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedContent;

