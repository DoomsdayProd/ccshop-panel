export function AdminHeader() {
  return (
    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-b border-white/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-instrument font-medium text-white dark:text-gray-100">
            Data Marketplace Admin
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 dark:border-white/10">
            <span className="text-sm font-inter font-medium text-white/90 dark:text-gray-300">
              Admin Panel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
