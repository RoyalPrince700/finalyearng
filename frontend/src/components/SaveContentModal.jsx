import { useState, useEffect } from 'react';
import { savedContentAPI, projectAPI } from '../api/api';
import { LuX, LuInfo, LuCheck } from 'react-icons/lu';

const SaveContentModal = ({ isOpen, onClose, projectId, contentToSave }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [existingContents, setExistingContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);

  const categories = [
    'Preliminary',
    'Chapter 1',
    'Chapter 2',
    'Chapter 3',
    'Chapter 4',
    'Chapter 5',
    'Reference'
  ];

  useEffect(() => {
    if (isOpen) {
      loadSavedContents();
      setSelectedCategory('');
      setShowOverwriteWarning(false);
    }
  }, [isOpen, projectId]);

  const loadSavedContents = async () => {
    try {
      setLoading(true);
      // Use the new general savedContentAPI instead of project-specific
      // We can pass projectId if it exists to filter, or get all user content
      const response = await savedContentAPI.getSavedContents({ projectId });
      setExistingContents(response.data.data || []);
    } catch (error) {
      console.error('Failed to load saved contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const exists = existingContents.some(item => item.category === category);
    setShowOverwriteWarning(exists);
  };

  const handleSave = async () => {
    if (!selectedCategory) return;

    try {
      setSaving(true);
      await savedContentAPI.saveContent({
        category: selectedCategory,
        content: contentToSave,
        projectId // Optional: undefined/null is fine now
      });
      onClose();
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 flex-shrink-0">
          <h3 className="font-semibold text-lg text-neutral-900">Save Content</h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1 rounded-full transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-neutral-600 mb-4">
            Select a category to save this content to. You can view all saved content in the "Saved Content" section.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const exists = existingContents.some(item => item.category === category);
                return (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg border text-left transition-all ${
                      selectedCategory === category
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                        : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${selectedCategory === category ? 'text-primary-900' : 'text-neutral-700'}`}>
                      {category}
                    </span>
                    {exists && (
                      <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded border border-neutral-200">
                        Existing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showOverwriteWarning && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
              <LuInfo className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Warning: Content for <strong>{selectedCategory}</strong> already exists. Saving will overwrite the existing content.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCategory || saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
            {!saving && <LuCheck className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveContentModal;

