import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", code: "", color: "#ff0000", icon: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/disaster-categories");
      setCategories(data);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/disaster-categories", newCat);
      toast.success("Category created");
      setNewCat({ name: "", code: "", color: "#ff0000", icon: "" });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating category");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/disaster-categories/toggle/${id}`);
      fetchCategories();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This might affect existing zones.")) return;
    try {
      await api.delete(`/disaster-categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Create Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -z-0"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-6 relative z-10">Manage Categories</h2>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end relative z-10">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Name</label>
            <input
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="e.g. Earthquake"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Code</label>
            <input
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={newCat.code}
              onChange={(e) => setNewCat({ ...newCat, code: e.target.value })}
              placeholder="e.g. eq"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Color</label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                    value={newCat.color}
                    onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                />
                <span className="text-sm font-mono text-gray-500">{newCat.color}</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Icon (Emoji)</label>
            <input
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-center text-xl"
              value={newCat.icon}
              onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
              placeholder="🌊"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full h-12 bg-[#003049] hover:bg-[#002133] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0">
              Add New
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
             <h3 className="font-bold text-gray-800">Existing Categories</h3>
             <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-500">{categories.length} Total</span>
        </div>
        
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl shadow-sm border border-black/5" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                            {cat.icon || "📦"}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.code}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cat.isActive ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                Active
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                                Inactive
                            </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => handleToggle(cat._id)} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {cat.isActive ? "Disable" : "Enable"}
                      </button>
                      <button 
                        onClick={() => handleDelete(cat._id)} 
                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                     <tr>
                         <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                             No categories found. Create one above.
                         </td>
                     </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
