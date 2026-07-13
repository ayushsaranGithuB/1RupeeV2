const LoadingCoin = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <img
        src="/1rp-illus-logo.svg"
        alt="Loading..."
        className="animate-bounce"
      />
      <span className="animate-pulse text-slate-500 text-xs tracking-widest pl-1">
        LOADING...
      </span>
    </div>
  );
};

export default LoadingCoin;
