import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, aiAPI } from '../api/api';
import Editor from '../components/Editor';
import ChatUI from '../components/ChatUI';

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'chat'
  const [chatMessagesByChapter, setChatMessagesByChapter] = useState({});

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getProject(id);
      const loadedProject = response.data.data;
      setProject(loadedProject);

      // Hydrate chat messages grouped by chapter from persisted chatHistory
      if (Array.isArray(loadedProject.chatHistory)) {
        const grouped = loadedProject.chatHistory.reduce((acc, msg) => {
          const chapterKey = Number.isInteger(msg.chapterNumber) ? msg.chapterNumber : 0;
          if (!acc[chapterKey]) acc[chapterKey] = [];
          acc[chapterKey].push(msg);
          return acc;
        }, {});
        setChatMessagesByChapter(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async (chapterNumber) => {
    if (!project) return;

    setGenerating(true);
    setError('');

    try {
      const response = await aiAPI.generateChapter({
        topic: project.topic,
        chapterNumber: chapterNumber,
        department: project.department,
        existingContent: getCurrentChapterContent()
      });

      const newChapter = {
        chapterNumber: chapterNumber,
        title: `Chapter ${chapterNumber}: ${getChapterTitle(chapterNumber)}`,
        content: response.data.data.content,
        wordCount: response.data.data.wordCount,
        lastModified: new Date()
      };

      // Update project with new chapter
      const updatedChapters = [...(project.chapters || [])];
      const existingIndex = updatedChapters.findIndex(c => c.chapterNumber === chapterNumber);

      if (existingIndex >= 0) {
        updatedChapters[existingIndex] = newChapter;
      } else {
        updatedChapters.push(newChapter);
      }

      const updatedProject = { ...project, chapters: updatedChapters };
      setProject(updatedProject);

      // Auto-save
      await saveProject(updatedProject);
    } catch (error) {
      console.error('Failed to generate chapter:', error);
      setError('Failed to generate chapter. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getCurrentChapterContent = () => {
    if (!project?.chapters) return '';
    const chapter = project.chapters.find(c => c.chapterNumber === currentChapter);
    return chapter?.content || '';
  };

  const getChapterTitle = (chapterNumber) => {
    const titles = {
      1: 'Introduction',
      2: 'Literature Review',
      3: 'Methodology',
      4: 'Results and Analysis',
      5: 'Conclusion and Recommendations'
    };
    return titles[chapterNumber] || `Chapter ${chapterNumber}`;
  };

  const handleContentChange = (content) => {
    if (!project) return;

    const updatedChapters = [...(project.chapters || [])];
    const existingIndex = updatedChapters.findIndex(c => c.chapterNumber === currentChapter);

    if (existingIndex >= 0) {
      updatedChapters[existingIndex] = {
        ...updatedChapters[existingIndex],
        content: content,
        wordCount: content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length,
        lastModified: new Date()
      };
    } else {
      updatedChapters.push({
        chapterNumber: currentChapter,
        title: `Chapter ${currentChapter}: ${getChapterTitle(currentChapter)}`,
        content: content,
        wordCount: content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length,
        lastModified: new Date()
      });
    }

    setProject({ ...project, chapters: updatedChapters });
  };

  const saveProject = async (projectData = project) => {
    if (!projectData) return;

    setSaving(true);
    try {
      await projectAPI.saveDraft(id, {
        chapters: projectData.chapters || [],
        chatHistory: projectData.chatHistory || []
      });
      setProject({ ...projectData, lastSaved: new Date() });
    } catch (error) {
      console.error('Failed to save project:', error);
      setError('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality (DOCX, PDF)
    alert(`${format.toUpperCase()} export will be implemented soon!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600">{project.topic}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => saveProject()}
            className="btn btn-secondary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            className="btn btn-secondary"
          >
            Export DOCX
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="btn btn-secondary"
          >
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Chapter Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[1, 2, 3, 4, 5].map((chapterNum) => {
          const chapter = project.chapters?.find(c => c.chapterNumber === chapterNum);
          const hasContent = chapter && chapter.content;

          return (
            <button
              key={chapterNum}
              onClick={() => setCurrentChapter(chapterNum)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                currentChapter === chapterNum
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {chapterNum}. {getChapterTitle(chapterNum)}
              {hasContent && <span className="ml-1 text-green-600">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'editor'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          AI Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor/Chat Area */}
        <div className="lg:col-span-2">
          {activeTab === 'editor' ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Chapter {currentChapter}: {getChapterTitle(currentChapter)}
                </h2>
                <button
                  onClick={() => handleGenerateChapter(currentChapter)}
                  className="btn btn-primary"
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Content'}
                </button>
              </div>
              <Editor
                content={getCurrentChapterContent()}
                onChange={handleContentChange}
                placeholder={`Start writing Chapter ${currentChapter}: ${getChapterTitle(currentChapter)}...`}
              />
            </div>
          ) : (
            <ChatUI
              projectId={id}
              projectContent={getCurrentChapterContent()}
              chapterNumber={currentChapter}
              initialMessages={chatMessagesByChapter[currentChapter]}
              onMessagesChange={(messages) => {
                // Update local grouped chat state for this chapter
                setChatMessagesByChapter((prev) => ({
                  ...prev,
                  [currentChapter]: messages
                }));

                // Also mirror into project.chatHistory so manual saves keep chats
                if (project) {
                  const otherMessages = Object.entries(chatMessagesByChapter)
                    .filter(([key]) => Number(key) !== currentChapter)
                    .flatMap(([, msgs]) => msgs);
                  const mergedHistory = [...otherMessages, ...messages];
                  setProject({
                    ...project,
                    chatHistory: mergedHistory
                  });
                }
              }}
              onContentUpdate={handleContentChange}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Outline / Plan */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Project Outline</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  try {
                    setError('');
                    const response = await aiAPI.generateOutline(id);
                    const outline = response.data.data;
                    const updatedProject = { ...project, outline };
                    setProject(updatedProject);
                    // Persist outline on the project
                    await projectAPI.updateProject(id, { outline });
                  } catch (err) {
                    console.error('Failed to generate outline:', err);
                    setError('Failed to generate project outline. Please try again.');
                  }
                }}
              >
                {project.outline ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {project.outline ? (
              <div className="space-y-3 text-sm">
                {project.outline.overview && (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {project.outline.overview}
                  </p>
                )}
                {Array.isArray(project.outline.chapters) && project.outline.chapters.length > 0 && (
                  <div className="space-y-2">
                    {project.outline.chapters.map((plan) => (
                      <button
                        key={plan.chapterNumber}
                        type="button"
                        onClick={() => {
                          setCurrentChapter(plan.chapterNumber);
                          setActiveTab('chat');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 text-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {plan.chapterNumber}. {plan.title}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {plan.status || 'not-started'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {plan.summary}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Generate an outline to see how the project will flow from Chapter 1 to 5.
              </p>
            )}
          </div>

          {/* AI Chats (shortcuts to active chats, ChatGPT-style) */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">AI Chats</h3>
            <div className="space-y-2 text-sm">
              {[1, 2, 3, 4, 5].map((chapterNum) => {
                const msgs = chatMessagesByChapter[chapterNum] || [];
                if (!msgs.length) return null;

                const lastMessage = msgs[msgs.length - 1];
                const preview =
                  typeof lastMessage?.content === 'string'
                    ? lastMessage.content.slice(0, 60)
                    : '';

                const isActive = activeTab === 'chat' && currentChapter === chapterNum;

                return (
                  <button
                    key={chapterNum}
                    type="button"
                    onClick={() => {
                      setCurrentChapter(chapterNum);
                      setActiveTab('chat');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors ${
                      isActive
                        ? 'border-primary-200 bg-primary-50 text-primary-800'
                        : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        Chapter {chapterNum} chat
                      </p>
                      {preview && (
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {preview}
                          {lastMessage?.content?.length > 60 ? '…' : ''}
                        </p>
                      )}
                    </div>
                    <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary-400" />
                  </button>
                );
              })}
              {!Object.values(chatMessagesByChapter).some(
                (msgs) => Array.isArray(msgs) && msgs.length > 0
              ) && (
                <p className="text-xs text-gray-500">
                  Start chatting in the <span className="font-medium">AI Chat</span> tab
                  for any chapter and a shortcut will appear here.
                </p>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Project Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="text-gray-900">{project.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-gray-900 capitalize">{project.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Words:</span>
                <span className="text-gray-900">{project.totalWordCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Saved:</span>
                <span className="text-gray-900">
                  {project.lastSaved ? new Date(project.lastSaved).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => saveProject()}
                className="w-full btn btn-secondary text-left"
                disabled={saving}
              >
                💾 Save Draft
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full btn btn-secondary text-left"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
