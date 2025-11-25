import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const Editor = ({ content, onChange, placeholder = "Start writing your project content..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  // TODO: Replace with React-Quill or TipTap with full rich text features
  // This is a basic placeholder implementation

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar - Basic placeholder */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex space-x-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200'}`}
        >
          • List
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[400px] p-4 focus-within:outline-none"
      />

      {/* Word Count - Placeholder */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-600">
        Words: {content ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0}
      </div>
    </div>
  );
};

export default Editor;
