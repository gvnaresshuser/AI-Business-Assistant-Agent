import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  RefreshCw,
  ShoppingBag,
  Pencil,
} from "lucide-react";

import {
  getCustomerByIdApi,
  getCustomerPurchaseHistoryApi,
  type Customer,
  type CustomerPurchase,
} from "../../api/customerApi";

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [purchases, setPurchases] = useState<CustomerPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseError, setPurchaseError] = useState("");

  // ============================================
  // LOAD CUSTOMER AND PURCHASE HISTORY
  // ============================================

  useEffect(() => {
    const loadCustomerDetails = async () => {
      if (!id) {
        setError("Invalid customer ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setPurchaseError("");

        const customerData = await getCustomerByIdApi(id);
        setCustomer(customerData);

        try {
          const purchaseData = await getCustomerPurchaseHistoryApi(id);

          setPurchases(purchaseData);
        } catch {
          setPurchaseError("Unable to load purchase history.");
        }
      } catch {
        setError("Unable to load customer details.");
      } finally {
        setLoading(false);
      }
    };

    void loadCustomerDetails();
  }, [id]);

  // ============================================
  // FORMAT CURRENCY
  // ============================================

  const formatCurrency = (value: string | null) => {
    const amount = Number(value ?? 0);

    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (value: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
        <RefreshCw size={18} className="animate-spin" />
        Loading customer details...
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error || !customer) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <UserRound size={36} className="mx-auto mb-3 text-red-400" />

        <p className="text-red-600">{error || "Customer not found."}</p>

        <button
          onClick={() => navigate("/customers")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // ============================================
  // CUSTOMER DETAILS
  // ============================================

  const details = [
    { label: "Customer Name", value: customer.customer_name },
    { label: "Email", value: customer.email || "—" },
    { label: "Phone", value: customer.phone || "—" },
    { label: "Customer Type", value: customer.customer_type || "Regular" },
    { label: "City", value: customer.city || "—" },
    { label: "State", value: customer.state || "—" },
    { label: "Pincode", value: customer.pincode || "—" },
    {
      label: "Created At",
      value: customer.created_at
        ? new Date(customer.created_at).toLocaleString("en-IN")
        : "—",
    },
    {
      label: "Last Updated",
      value: customer.updated_at
        ? new Date(customer.updated_at).toLocaleString("en-IN")
        : "—",
    },
  ];

  const totalPurchases = purchases.length;

  const totalPurchaseAmount = purchases.reduce(
    (total, purchase) => total + Number(purchase.total_amount || 0),
    0,
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/customers")}
          className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
          title="Back to Customers"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-800">
            Customer Details
          </h1>

          <p className="text-sm text-slate-500">
            View customer information and purchase history.
          </p>
        </div>

        <button
          onClick={() => navigate(`/customers/${customer.id}/edit`)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Pencil size={16} />
          <span className="hidden sm:inline">Edit Customer</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      {/* CUSTOMER PROFILE */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UserRound size={25} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {customer.customer_name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {customer.email || "No email available"}
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {customer.customer_type || "Regular"}
          </span>
        </div>

        {/* CUSTOMER INFORMATION */}

        <div className="mt-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>

        {/* ADDRESS */}

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium uppercase text-slate-500">
            Complete Address
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {[customer.address, customer.city, customer.state, customer.pincode]
              .filter(Boolean)
              .join(", ") || "No address available."}
          </p>
        </div>
      </div>

      {/* PURCHASE SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <ShoppingBag size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Orders</p>

              <h3 className="text-2xl font-bold text-slate-800">
                {totalPurchases}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <ShoppingBag size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Order Value</p>

              <h3 className="text-2xl font-bold text-slate-800">
                {formatCurrency(String(totalPurchaseAmount))}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* PURCHASE HISTORY */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Purchase History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Orders placed by this customer.
          </p>
        </div>

        <div className="overflow-x-auto">
          {purchaseError ? (
            <p className="p-6 text-center text-sm text-red-600">
              {purchaseError}
            </p>
          ) : purchases.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingBag size={36} className="mx-auto mb-3 text-slate-300" />

              <p className="font-medium text-slate-700">
                No purchase history found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                This customer has not placed any orders yet.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order Number</th>

                  <th className="px-5 py-3 font-semibold">Order Date</th>

                  <th className="px-5 py-3 font-semibold">Subtotal</th>

                  <th className="px-5 py-3 font-semibold">Total Amount</th>

                  <th className="px-5 py-3 font-semibold">Order Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {purchase.order_number}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(purchase.order_date)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatCurrency(purchase.subtotal)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatCurrency(purchase.total_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {purchase.order_status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
