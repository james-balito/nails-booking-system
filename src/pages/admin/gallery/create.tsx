import { useNavigate} from "react-router-dom";
import DesignForm from "../../../components/layout/form/gallery/design-form";

export default function GalleryCreate() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Design</h1>
          <p className="text-gray-400 text-sm mt-1">Add a new nail design set to your gallery.</p>
        </div>
        <button
          onClick={() => navigate("/admin/gallery")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-left preview-icon"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> Back
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <DesignForm
          onSaved={() => navigate("/admin/gallery")}
          onCancel={() => navigate("/admin/gallery")}
        />
      </div>
    </div>
  );
}