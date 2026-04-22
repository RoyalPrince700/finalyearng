import { Link } from 'react-router-dom';
import PublicFooter from '../components/PublicFooter';

const PrivacyPolicy = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 text-neutral-900">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Link
              to="/login"
              className="text-sm font-medium text-accent-600 transition-colors hover:text-accent-700"
            >
              Back to sign in
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mt-3 text-base text-neutral-600">
              This page explains what information FinalYearNG uses, why it is needed,
              and the measures used in the app to help protect it.
            </p>
          </div>

          <div className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Information we use</h2>
              <p className="text-neutral-700">
                FinalYearNG uses the details you provide during registration, such as
                your name, email address, university, faculty, and department, to
                create and manage your account.
              </p>
              <p className="text-neutral-700">
                The app also uses the project content, saved drafts, generated topics,
                conversations, and other writing inputs you create so features like
                project editing, saved content, and AI-assisted generation can work as
                expected.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">How your data is used</h2>
              <ul className="list-disc space-y-2 pl-5 text-neutral-700">
                <li>To create your account and sign you in securely.</li>
                <li>To personalize your workspace with your academic profile details.</li>
                <li>To save your projects, drafts, and saved content for later access.</li>
                <li>To process AI requests when you ask the platform to generate topics, outlines, chapters, or chat responses.</li>
                <li>To support administration features such as account and project oversight for authorized admins.</li>
              </ul>
              <p className="text-neutral-700">
                We do not sell, share, or disclose your personal information to third
                parties or to anyone outside the platform except where disclosure is
                required by law. Your information is used only to provide and support
                the FinalYearNG service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">How your data is protected</h2>
              <p className="text-neutral-700">
                FinalYearNG uses authenticated requests for protected areas of the app.
                After sign in, an access token is stored on your device and sent with
                authorized API requests so restricted pages and account data are only
                available to signed-in users.
              </p>
              <p className="text-neutral-700">
                The app removes invalid sessions automatically when authorization fails,
                which helps prevent continued access with expired or rejected tokens.
              </p>
              <p className="text-neutral-700">
                Protection in transit also depends on how the app is deployed. Using a
                secure HTTPS connection for production deployments is strongly
                recommended so data sent between your browser and the server stays
                encrypted in transit.
              </p>
              <p className="text-neutral-700">
                You can rest assured that we take the safety of your data seriously
                and work to keep your information secure within the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Your choices</h2>
              <p className="text-neutral-700">
                You can review and update some account information from your profile
                settings. Logging out removes the stored session token from this device.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Contact and updates</h2>
              <p className="text-neutral-700">
                If your privacy practices change, this page should be updated to reflect
                the latest handling of user data and security protections.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicy;
