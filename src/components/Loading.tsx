export const Loading = () => {
  return (
    <div className="login-bg min-h-screen flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 glass-card p-8 max-w-md mx-4">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>

          <h2 className="mt-6 text-2xl font-semibold tracking-wide text-white animate-pulse">
            ローディング中...
          </h2>
          <p className="text-gray-400 mt-2">少々お待ちください</p>
        </div>
      </div>
    </div>
  );
};
