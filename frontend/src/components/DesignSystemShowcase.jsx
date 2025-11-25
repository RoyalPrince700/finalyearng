import { useState } from 'react';

const DesignSystemShowcase = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Design System Showcase</h1>
        <p className="text-lg text-neutral-600">ChatGPT-inspired design system for FinalYearNG</p>
      </div>

      {/* Colors */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-900 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Primary 900</p>
            <p className="text-xs text-neutral-500">#1a1a1a</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-lg mx-auto mb-2 border"></div>
            <p className="text-sm font-medium">Neutral 50</p>
            <p className="text-xs text-neutral-500">#ffffff</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-900 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Neutral 900</p>
            <p className="text-xs text-neutral-500">#111827</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-500 rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Accent 500</p>
            <p className="text-xs text-neutral-500">#3b82f6</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-success rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium">Success</p>
            <p className="text-xs text-neutral-500">#10b981</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Typography Scale</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">text-xs (12px)</p>
            <p className="text-xs">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">text-sm (14px)</p>
            <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <p className="text-base text-neutral-500 mb-1">text-base (16px) - Body text</p>
            <p className="text-base">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <p className="text-lg text-neutral-500 mb-1">text-lg (18px)</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <p className="text-xl text-neutral-500 mb-1">text-xl (20px)</p>
            <p className="text-xl">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <p className="text-2xl text-neutral-500 mb-1">text-2xl (24px)</p>
            <p className="text-2xl">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-ghost">Ghost Button</button>
          <button className="btn btn-danger">Danger Button</button>
          <button className="btn btn-success">Success Button</button>
        </div>
      </section>

      {/* Form Elements */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Form Elements</h2>
        <div className="space-y-6">
          <div className="form-group">
            <label className="label">Input Field</label>
            <input type="text" className="input" placeholder="Enter text..." />
          </div>
          <div className="form-group">
            <label className="label">Textarea</label>
            <textarea className="textarea" rows={3} placeholder="Enter longer text..."></textarea>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Alert Messages</h2>
        <div className="space-y-4">
          <div className="alert alert-error">This is an error message</div>
          <div className="alert alert-success">This is a success message</div>
          <div className="alert alert-warning">This is a warning message</div>
          <div className="alert alert-info">This is an info message</div>
        </div>
      </section>

      {/* Badges and Avatars */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Badges & Avatars</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="avatar">JD</div>
          <div className="avatar avatar-lg">JD</div>
          <div className="flex gap-2">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-secondary">Secondary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-error">Error</span>
          </div>
        </div>
      </section>

      {/* Message Bubbles */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Chat Messages</h2>
        <div className="space-y-4 max-w-lg">
          <div className="flex justify-end">
            <div className="message-bubble message-user">
              Hello! I need help with my final year project.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="message-bubble message-assistant">
              I'd be happy to help you with your final year project! What topic are you working on?
            </div>
          </div>
        </div>
      </section>

      {/* Modal Demo */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Modal & Interactions</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Open Modal
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Modal Title</h3>
                <p className="text-base text-neutral-700 mb-6">
                  This is a modal dialog using the design system components.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(false)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Spacing Scale */}
      <section className="card">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Spacing Scale (8px increments)</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 8, 12].map((space) => (
            <div key={space} className="flex items-center">
              <span className="w-16 text-sm text-neutral-600">space-{space}</span>
              <div
                className={`bg-primary-200 border border-primary-300`}
                style={{ width: `${space * 8}px`, height: '24px' }}
              ></div>
              <span className="ml-3 text-sm text-neutral-600">{space * 8}px</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DesignSystemShowcase;
