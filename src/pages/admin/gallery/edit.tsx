import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDesign, getDesignBySlug } from "../../../api/designs";
import type { Design } from "../../../interfaces/interface"
import DesignForm from "../../../components/layout/form/gallery/design-form";
import { useBreadcrumbLabel } from "../../../context/breadcrumbContext";

export default function GalleryEdit() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  useEffect(() => {
    if (!slug) {
      setError("Missing design slug in the URL.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const isId = UUID_RE.test(slug);
    setLoading(true);
    setError(null);

    (isId ? getDesign(slug) : getDesignBySlug(slug)) // getDesign = lookup by id
      .then((d) => {
        if (cancelled) return;
        setDesign(d);
        if (isId) {
          navigate(`/admin/gallery/${encodeURIComponent(d.slug)}/edit`, {
            replace: true,
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Failed to load design.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  useBreadcrumbLabel(`/admin/gallery/${slug}`, design?.title);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading design...</div>
    );
  if (error || !design)
    return (
      <div className="p-8 text-center text-red-400">
        Error: {error ?? "Design not found."}
      </div>
    );

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Edit Design
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Update the details for "{design.title}".
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/gallery")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <DesignForm
          initial={design}
          onSaved={() => navigate("/admin/gallery")}
          onCancel={() => navigate("/admin/gallery")}
        />
      </div>
    </div>
  );
}
