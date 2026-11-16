import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createProductApi } from "../../api/productApi";
import { showSuccessToast, showErrorToast } from "../../utils/swal";
import { getCategoriesApi, type Category } from "../../api/categoryApi";

const CreateProduct = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "",
    sku: "",
    category_id: "",
    brand: "",
    model_number: "",
    description: "",
    unit_price: "0",
    unit_cost: "0",
    reorder_level: "10",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoriesApi();

        setCategories(data.filter((category) => category.is_active !== false));
      } catch {
        showErrorToast("Unable to load product categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

const handleSubmit = async (
  e: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0],
) => {
  e.preventDefault();

  if (!form.product_name.trim() || !form.sku.trim()) {
    showErrorToast("Product name and SKU are required.");
    return;
  }

  const unitPrice = Number(form.unit_price);
  const unitCost = Number(form.unit_cost);
  const reorderLevel = Number(form.reorder_level);

  if (
    !Number.isFinite(unitPrice) ||
    !Number.isFinite(unitCost) ||
    unitPrice < 0 ||
    unitCost < 0
  ) {
    showErrorToast("Enter valid non-negative prices and costs.");
    return;
  }

  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
    showErrorToast("Reorder level must be a non-negative integer.");
    return;
  }

  try {
    setSaving(true);

    await createProductApi({
      product_name: form.product_name.trim(),
      sku: form.sku.trim(),
      category_id: form.category_id.trim() || null,
      brand: form.brand.trim() || null,
      model_number: form.model_number.trim() || null,
      description: form.description.trim() || null,
      unit_price: unitPrice,
      unit_cost: unitCost,
      reorder_level: reorderLevel,
      is_active: form.is_active,
    });

    showSuccessToast("Product created successfully.");
    navigate("/products");
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "response" in error
        ? (
            error as {
              response?: {
                data?: { message?: string };
              };
            }
          ).response?.data?.message
        : undefined;

    showErrorToast(message || "Unable to create product.");
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Product</h1>
          <p className="text-sm text-slate-500">
            Add a new product to your inventory.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Product Name *
            </label>
            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              SKU *
            </label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Enter unique SKU"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>

            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              disabled={loadingCategories}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category (optional)"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Brand
            </label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Enter brand"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Model Number
            </label>
            <input
              name="model_number"
              value={form.model_number}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Enter model number"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Reorder Level
            </label>
            <input
              type="number"
              name="reorder_level"
              min="0"
              step="1"
              value={form.reorder_level}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Unit Price (INR) *
            </label>
            <input
              type="number"
              name="unit_price"
              min="0"
              step="0.01"
              value={form.unit_price}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Unit Cost (INR) *
            </label>
            <input
              type="number"
              name="unit_cost"
              min="0"
              step="0.01"
              value={form.unit_cost}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Product Status
            </label>
            <select
              name="is_active"
              value={String(form.is_active)}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Enter product description"
          />
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
