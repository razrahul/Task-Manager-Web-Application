function DarkModeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/85 text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:border-brand-500 dark:hover:text-brand-300"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

export default DarkModeToggle;
