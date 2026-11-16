import { useEffect, useState } from "react";
import { Search, Users, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getCustomersPaginatedApi,
  getCustomerStatsApi,
  deleteCustomerApi,
  type Customer,
  type CustomerPagination,
} from "../../api/customerApi";

import {
  showSuccessToast,
  showErrorToast,
  showDeleteConfirm,
} from "../../utils/swal";

const Customers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerType, setCustomerType] = useState("all");

  // Dynamic customer types from database
  const [customerTypes, setCustomerTypes] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState<CustomerPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // ============================================
  // LOAD CUSTOMER TYPES
  // ============================================

  useEffect(() => {
    const loadCustomerTypes = async () => {
      try {
        const stats = await getCustomerStatsApi();

        const types = [
          ...new Set(
            stats.customerTypes
              .map((item) => item.customer_type?.trim())
              .filter((type): type is string => Boolean(type)),
          ),
        ].sort((a, b) => a.localeCompare(b));

        setCustomerTypes(types);

        // Reset filter if its type no longer exists
        if (customerType !== "all" && !types.includes(customerType)) {
          setCustomerType("all");
          setPage(1);
        }
      } catch {
        showErrorToast("Unable to load customer types.");
      }
    };

    void loadCustomerTypes();
  }, []);

  // ============================================
  // DELETE CUSTOMER
  // ============================================

  const handleDelete = async (customer: Customer) => {
    const result = await showDeleteConfirm(
      "Delete Customer?",
      `Are you sure you want to delete ${customer.customer_name}?`,
    );

    if (!result.isConfirmed) return;

    try {
      await deleteCustomerApi(customer.id);

      showSuccessToast("Customer deleted successfully.");

      const response = await getCustomersPaginatedApi(
        page,
        limit,
        debouncedSearch,
        customerType,
      );

      if (response.data.length === 0 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }

      setCustomers(response.data);
      setPagination(response.pagination);

      // Refresh customer types after deletion
      const stats = await getCustomerStatsApi();

      const types = [
        ...new Set(
          stats.customerTypes
            .map((item) => item.customer_type?.trim())
            .filter((type): type is string => Boolean(type)),
        ),
      ].sort((a, b) => a.localeCompare(b));

      setCustomerTypes(types);

      if (customerType !== "all" && !types.includes(customerType)) {
        setCustomerType("all");
        setPage(1);
      }
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

      showErrorToast(message || "Unable to delete customer.");
    }
  };

  // ============================================
  // SEARCH DEBOUNCE
  // ============================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ============================================
  // LOAD CUSTOMERS
  // ============================================

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCustomersPaginatedApi(
          page,
          limit,
          debouncedSearch,
          customerType,
        );

        setCustomers(response.data);
        setPagination(response.pagination);
      } catch {
        setError("Unable to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadCustomers();
  }, [page, limit, debouncedSearch, customerType]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Page Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and view your business customers.
          </p>
        </div>

        <button
          onClick={() => navigate("/customers/create")}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Customer
        </button>
      </div>

      {/* Search and Summary */}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Total Customers</p>

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
              placeholder="Search name, email, phone..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Customer Type Filters */}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setCustomerType("all");
            setPage(1);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            customerType === "all"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All Customers
        </button>

        {customerTypes.map((type) => (
          <button
            key={type}
            onClick={() => {
              setCustomerType(type);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              customerType === type
                ? "bg-blue-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Customers Table */}

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
            Loading Customers...
          </p>
          <p className="text-sm text-slate-500">
            Fetching customer details for you
          </p>
        </div>
      </div>

        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={36} className="mx-auto mb-3 text-slate-300" />

            <p className="font-medium text-slate-700">No customers found</p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search or create a new customer.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Customer Type</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <p className="font-medium text-slate-800">
                          {customer.customer_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {customer.pincode || "—"}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {customer.email || "—"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {customer.phone || "—"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {[customer.city, customer.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {customer.customer_type || "Unspecified"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/customers/${customer.id}`)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/customers/${customer.id}/edit`)
                            }
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => void handleDelete(customer)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            title="Delete Customer"
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

            {/* Mobile Customer Cards */}

            <div className="space-y-3 p-3 md:hidden">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800">
                        {customer.customer_name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {customer.email || "No email provided"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {customer.customer_type || "Unspecified"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm font-medium text-slate-700">
                        {customer.phone || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">City</p>
                      <p className="text-sm font-medium text-slate-700">
                        {customer.city || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">State</p>
                      <p className="text-sm font-medium text-slate-700">
                        {customer.state || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Pincode</p>
                      <p className="text-sm font-medium text-slate-700">
                        {customer.pincode || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="rounded-lg bg-blue-600 px-2 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </button>

                    <button
                      onClick={() => navigate(`/customers/${customer.id}/edit`)}
                      className="rounded-lg bg-amber-500 px-2 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => void handleDelete(customer)}
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
          Showing {customers.length === 0 ? 0 : (page - 1) * limit + 1}
          {" – "}
          {Math.min((page - 1) * limit + customers.length, pagination.total)}
          {" of "}
          {pagination.total} customers
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

export default Customers;
