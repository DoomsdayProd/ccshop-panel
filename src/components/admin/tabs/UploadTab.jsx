export function UploadTab({
  defaultPrice,
  setDefaultPrice,
  bulkData,
  setBulkData,
  handleBulkUpload,
  uploadMutation,
  uploadSuccess,
  uploadError,
}) {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-xl font-instrument font-medium text-white dark:text-gray-100 mb-6">
        Upload Data Entries
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
            Default Price (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
            placeholder="15.00"
          />
        </div>
        <div>
          <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
            Bulk Data (Pipe-separated format)
          </label>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent font-mono text-sm"
            placeholder="Paste your data here, one entry per line..."
          />
          <div className="mt-2 text-xs text-white/60 dark:text-gray-500">
            Supports both formats: Full format (17+ fields) and simplified format (8+ fields)
          </div>
        </div>
        {uploadSuccess && (
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="text-green-300 text-sm">{uploadSuccess}</div>
          </div>
        )}
        {uploadError && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <div className="text-red-300 text-sm">{uploadError}</div>
          </div>
        )}
        <button
          onClick={handleBulkUpload}
          disabled={uploadMutation.isPending}
          className="w-full bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-6 py-4 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] active:bg-[#B8E845] dark:active:bg-[#94C92D] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Data"}
        </button>
      </div>
    </div>
  );
}
