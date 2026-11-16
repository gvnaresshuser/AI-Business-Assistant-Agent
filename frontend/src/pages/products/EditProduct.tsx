import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { getProductByIdApi, updateProductApi } from "../../api/productApi";

import type { CreateProductInput } from "../../api/productApi";

import { getCategoriesApi, type Category } from "../../api/categoryApi";

import { showSuccessToast, showErrorToast } from "../../utils/swal";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!id) {
          showErrorToast("Product ID is missing.");
          navigate("/products");
          return;
        }

        const product = await getProductByIdApi(id);

        setForm({
          product_name: product.product_name,
          sku: product.sku,
          category_id: product.category_id ?? "",
          brand: product.brand ?? "",
          model_number: product.model_number ?? "",
          description: product.description ?? "",
          unit_price: String(product.unit_price),
          unit_cost: String(product.unit_cost),
          reorder_level: String(product.reorder_level ?? 10),
          is_active: product.is_active ?? true,
        });
      } catch {
        showErrorToast("Unable to load product details.");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await getCategoriesApi();

        setCategories(data.filter((category) => category.is_active !== false));
      } catch {
        showErrorToast("Unable to load product categories.");
      }
    };

    void loadProduct();
    void loadCategories();
  }, [id, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      showErrorToast("Product ID is missing.");
      return;
    }

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

    const payload: CreateProductInput = {
      product_name: form.product_name.trim(),
      sku: form.sku.trim(),
      category_id: form.category_id || null,
      brand: form.brand.trim() || null,
      model_number: form.model_number.trim() || null,
      description: form.description.trim() || null,
      unit_price: unitPrice,
      unit_cost: unitCost,
      reorder_level: reorderLevel,
      is_active: form.is_active,
    };

    try {
      setSaving(true);

      await updateProductApi(id, payload);

      showSuccessToast("Product updated successfully.");
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

      showErrorToast(message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading product details...
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-800">Edit Product</h1>
          <p className="text-sm text-slate-500">Update product information.</p>
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
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select category (optional)</option>

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
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Reorder Level
            </label>
            <input
              type="number"
              min="0"
              step="1"
              name="reorder_level"
              value={form.reorder_level}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Unit Price (INR) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="unit_price"
              value={form.unit_price}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Unit Cost (INR) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="unit_cost"
              value={form.unit_cost}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            {saving ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
