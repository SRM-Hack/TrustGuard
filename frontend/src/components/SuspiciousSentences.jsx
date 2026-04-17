function SuspiciousSentences({ sentences = [], isLoading = false }) {
  if (isLoading) {
    return (
      <section className="trust-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-100 rounded skeleton-shimmer" />
          <div className="h-5 w-16 bg-gray-100 rounded-full skeleton-shimmer" />
        </div>
        <div className="space-y-3">
          <div className="h-20 w-full bg-gray-50 rounded-xl skeleton-shimmer" />
          <div className="h-20 w-full bg-gray-50 rounded-xl skeleton-shimmer" />
        </div>
      </section>
    );
  }

  const count = sentences.length;

  return (
    <section className="trust-card space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔴</span>
          <h2 className="font-display font-semibold text-lg text-gray-900 tracking-tight">
            Suspicious Passages Detected
          </h2>
        </div>
        {count > 0 && (
          <span className="badge-red !bg-red-500/10 !text-red-600 font-black text-[10px] uppercase px-2.5 py-1">
            {count} found
          </span>
        )}
      </div>

      {!count ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50/50 border border-green-100 animate-fade-in">
          <span className="text-lg">✅</span>
          <p className="text-sm font-bold text-green-700">
            No suspicious passages identified
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentences.map((item, idx) => (
            <div 
              key={idx} 
              className="group relative rounded-xl border border-red-100 bg-red-50/30 p-4 border-l-4 border-l-red-400 transition-all hover:bg-red-50/50"
            >
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                "{item.sentence}"
              </p>
              <div className="mt-3 flex items-start gap-1.5 text-red-600/80">
                <span className="text-xs">⚠</span>
                <p className="text-xs font-semibold italic">
                  Reason: {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SuspiciousSentences;
