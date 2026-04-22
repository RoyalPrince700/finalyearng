import { Link } from 'react-router-dom';

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {year} FinalYearNG. Built to support academic project work.</p>
        <div className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="font-medium text-accent-600 transition-colors hover:text-accent-700"
          >
            Privacy Policy
          </Link>
          <Link
            to="/login"
            className="transition-colors hover:text-neutral-900"
          >
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
