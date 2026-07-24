import { useCallback, useEffect, useState } from "react";
import { 
  History, 
  AlertCircle, 
  Loader2, 
  X,
  Image as ImageIcon,
  Search,
  Filter
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { listGeneratedImages } from "../../api/generatedImages";

export default function AdminImageHistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalImage, setModalImage] = useState(null);

  const fetchImages = useCallback(() => {
    setLoading(true);
    setError("");
    listGeneratedImages()
      .then((res) => setRows(res.data))
      .catch(() =>
        setError("Couldn't load generated images. Check your connection and try again.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setModalImage(null);
    };
    
    if (modalImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [modalImage]);

  const getImageUrls = (row) => {
    const meta = row.request_meta;
    if (!meta || typeof meta === "string") return {};
    const external = meta.external_response || {};
    return {
      person: external.personImagePath || null,
      garment: external.garmentImagePath || null,
      output: external.outputImagePath || row.output_image_url || null,
    };
  };

  // Dedicated thumbnail component for table cells
  const TableThumbnail = ({ src, label }) => {
    if (!src) {
      return (
        <div 
          className="mx-auto flex h-16 w-12 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50"
          title={`No ${label} image`}
        >
          <ImageIcon className="h-4 w-4 text-gray-400" />
        </div>
      );
    }

    return (
      <button
        onClick={() => setModalImage(src)}
        className="group relative mx-auto block h-16 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
        title={`View ${label}`}
      >
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f8fafc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='10' fill='%2394a3b8'%3EX%3C/text%3E%3C/svg%3E";
          }}
        />
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col ">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader
          title="Generation Logs"
          description="Admin view of all virtual try-on requests."
        />
      </div>

      {/* CRM Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or User ID..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <span className="text-sm text-gray-500">
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {/* Main Data Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading records...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 bg-red-50 text-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">Failed to load data</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <History className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">No generations found</p>
            <p className="text-xs text-gray-500">New requests will appear here automatically.</p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {/* Left Side: Data */}
                  <th className="px-6 py-4 font-medium">User Details</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  {/* Right Side: Images */}
                  <th className="px-6 py-4 text-center font-medium">Person</th>
                  <th className="px-6 py-4 text-center font-medium">Garment</th>
                  <th className="px-6 py-4 text-center font-medium text-brand-600">Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row) => {
                  const images = getImageUrls(row);
                  const date = row.created_at ? new Date(row.created_at) : null;
                  
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-gray-50/50">
                      {/* User Column */}
                      <td className="whitespace-nowrap px-6 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {row.user_email || "Unknown Email"}
                          </span>
                          <span className="font-mono text-[11px] text-gray-500">
                            ID: {row.user_id || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="whitespace-nowrap px-6 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {date ? date.toLocaleDateString() : "—"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                      </td>

                      {/* Image Columns */}
                      <td className="px-6 py-3 align-middle">
                        <TableThumbnail src={images.person} label="Person" />
                      </td>
                      
                      <td className="px-6 py-3 align-middle">
                        <TableThumbnail src={images.garment} label="Garment" />
                      </td>
                      
                      <td className="px-6 py-3 align-middle bg-brand-50/20">
                        <TableThumbnail src={images.output} label="Output" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox / Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
            onClick={() => setModalImage(null)}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 flex max-h-full max-w-5xl flex-col overflow-hidden rounded-xl bg-black shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 z-20 flex p-4">
              <button
                onClick={() => setModalImage(null)}
                className="group rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div 
              className="relative flex flex-1 items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalImage}
                alt="Full resolution view"
                className="max-h-[85vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}