import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, RefreshCw } from "lucide-react";
import { getProductByIdApi, type Product } from "../../api/productApi";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getProductByIdApi(id);
        setProduct(data);
      } catch {
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  const formatCurrency = (value: string) =>
    Number(value).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
        <RefreshCw size={18} className="animate-spin" />
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <Package size={36} className="mx-auto mb-3 text-red-400" />
        <p className="text-red-600">{error || "Product not found."}</p>

        <button
          onClick={() => navigate("/products")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const details = [
    { label: "Product Name", value: product.product_name },
    { label: "SKU", value: product.sku },
    { label: "Brand", value: product.brand || "—" },
    { label: "Model Number", value: product.model_number || "—" },
    { label: "Category ID", value: product.category_id || "—" },
    { label: "Unit Price", value: formatCurrency(product.unit_price) },
    { label: "Unit Cost", value: formatCurrency(product.unit_cost) },
    { label: "Reorder Level", value: product.reorder_level ?? "—" },
    {
      label: "Created At",
      value: product.created_at
        ? new Date(product.created_at).toLocaleString("en-IN")
        : "—",
    },
    {
      label: "Last Updated",
      value: product.updated_at
        ? new Date(product.updated_at).toLocaleString("en-IN")
        : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/products")}
          className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
          title="Back to Products"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Details</h1>
          <p className="text-sm text-slate-500">
            View complete product information.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {product.product_name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">SKU: {product.sku}</p>
          </div>

          {product.is_active ? (
            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Active
            </span>
          ) : (
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Inactive
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium uppercase text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium uppercase text-slate-500">
            Description
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {product.description || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
