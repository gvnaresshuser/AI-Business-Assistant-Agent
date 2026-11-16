import { useEffect, useMemo, useState } from "react";
import { Search, Package, Plus, Trash2 } from "lucide-react";

import {
  getProductsPaginatedApi,
  deleteProductApi,
  type Product,
  type ProductPagination,
} from "../../api/productApi";

import {
  showSuccessToast,
  showErrorToast,
  showDeleteConfirm,
} from "../../utils/swal";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<ProductPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const navigate = useNavigate();
  const handleDelete = async (product: Product) => {
    const result = await showDeleteConfirm(
      "Delete Product?",
      `Are you sure you want to permanently delete ${product.product_name}?`,
    );

    if (!result.isConfirmed) return;

    try {
      await deleteProductApi(product.id);

      showSuccessToast("Product deleted successfully.");

      // Reload the current product list
      const response = await getProductsPaginatedApi(
        page,
        limit,
        debouncedSearch,
        status,
      );

      // If the deleted product was the last item on the page,
      // move to the previous page.
      if (response.data.length === 0 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }

      setProducts(response.data);
      setPagination(response.pagination);
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

      showErrorToast(message || "Unable to delete product.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

       const response = await getProductsPaginatedApi(
         page,
         limit,
         debouncedSearch,
         status,
       );

        setProducts(response.data);
        setPagination(response.pagination);
      } catch {
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [page, limit, debouncedSearch, status]);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) return products;

    return products.filter(
      (product) =>
        product.product_name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        (product.brand ?? "").toLowerCase().includes(searchTerm) ||
        (product.model_number ?? "").toLowerCase().includes(searchTerm),
    );
  }, [products, search]);

  // More implementation follows in the next step.

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and view your business products.
          </p>
        </div>

        <button
          onClick={() => navigate("/products/create")}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Product
        </button>
      </div>

      {/* Search and Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Total Products</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {pagination.total.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, brand..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatus("all");
            setPage(1);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === "all"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          All Products
        </button>

        <button
          onClick={() => {
            setStatus("active");
            setPage(1);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === "active"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Active Products
        </button>

        <button
          onClick={() => {
            setStatus("inactive");
            setPage(1);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === "inactive"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Inactive Products
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-[5px] border-indigo-100" />
              <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-[5px] border-transparent border-t-blue-600 border-r-violet-600" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10" />
            </div>

            <div className="text-center space-y-1.5">
              <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Loading Products...
              </p>
              <p className="text-sm text-slate-500">
                Fetching the latest products for you
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Package size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-700">No products found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search term.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Unit Cost</th>
                    <th className="p-4">Reorder Level</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <p className="font-medium text-slate-800">
                          {product.product_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {product.model_number || "—"}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">{product.sku}</td>

                      <td className="p-4 text-slate-600">
                        {product.brand || "—"}
                      </td>

                      <td className="p-4 font-medium text-slate-800">
                        {Number(product.unit_price).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>

                      <td className="p-4 text-slate-600">
                        {Number(product.unit_cost).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>

                      <td className="p-4 text-slate-600">
                        {product.reorder_level ?? "—"}
                      </td>

                      <td className="p-4">
                        {product.is_active ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/products/${product.id}/edit`)
                            }
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => void handleDelete(product)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Product Cards */}
            <div className="space-y-3 p-3 md:hidden">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800">
                        {product.product_name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.model_number || "—"}
                      </p>
                    </div>

                    {product.is_active ? (
                      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-xs text-slate-500">SKU</p>
                      <p className="text-sm font-medium text-slate-700">
                        {product.sku}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Brand</p>
                      <p className="text-sm font-medium text-slate-700">
                        {product.brand || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Unit Price</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {Number(product.unit_price).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Unit Cost</p>
                      <p className="text-sm font-medium text-slate-700">
                        {Number(product.unit_cost).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">Reorder Level</p>
                    <p className="text-sm font-medium text-slate-700">
                      {product.reorder_level ?? "—"}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="rounded-lg bg-blue-600 px-2 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="rounded-lg bg-amber-500 px-2 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => void handleDelete(product)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-red-600 px-2 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-500">
          Showing {products.length === 0 ? 0 : (page - 1) * limit + 1}
          {" – "}
          {Math.min((page - 1) * limit + products.length, pagination.total)}
          {" of "}
          {pagination.total} products
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-slate-700">
            Page {page} of {pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, pagination.totalPages))
            }
            disabled={page >= pagination.totalPages || loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
