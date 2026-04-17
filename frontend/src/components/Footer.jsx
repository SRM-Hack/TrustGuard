function Footer() {
  return (
    <footer className="mt-10 w-full border-t border-white/60 bg-white/65 backdrop-blur-xl py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-blue-600"
              aria-hidden="true"
            >
              <path d="M12 2.4 4 5.9v6.5c0 5.4 3.4 9.9 8 11.2 4.6-1.3 8-5.8 8-11.2V5.9L12 2.4Z" />
            </svg>
            <span className="text-sm font-bold text-gray-900">TruthGuard</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Built for CodeWizards 2.0 · Problem Statement #5
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">SRMIST Delhi-NCR Campus, Ghaziabad</p>
          <p className="text-xs text-gray-300">April 17-18, 2026</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
