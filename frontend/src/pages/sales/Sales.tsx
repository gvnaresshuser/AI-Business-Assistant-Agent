import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingCart,
  Eye,
  X,
  CalendarDays,
  CreditCard,
  Package,
} from "lucide-react";

import {
  getSalesOrdersApi,
  getSalesOrderItemsApi,
  getSalesPaymentsApi,
  getSalesRefundsApi,
  type SalesOrder,
  type SalesOrderItem,
  type SalesPayment,
  type SalesRefund,
} from "../../api/salesApi";

import { getCustomersApi, type Customer } from "../../api/customerApi";
import { getProductsApi, type Product } from "../../api/productApi";

interface SalesData {
  orders: SalesOrder[];
  items: SalesOrderItem[];
  payments: SalesPayment[];
  refunds: SalesRefund[];
  customers: Customer[];
  products: Product[];
}

const formatCurrency = (amount: string | number) =>
  Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

const formatDate = (date: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status: string | null) => {
  const value = (status ?? "").toLowerCase();

  if (
    ["completed", "paid", "success", "successful", "delivered"].includes(value)
  ) {
    return "bg-green-100 text-green-700";
  }

  if (["pending", "processing", "partial"].includes(value)) {
    return "bg-amber-100 text-amber-700";
  }

  if (["cancelled", "canceled", "failed", "rejected"].includes(value)) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
};

const Sales = () => {
  const [salesData, setSalesData] = useState<SalesData>({
    orders: [],
    items: [],
    payments: [],
    refunds: [],
    customers: [],
    products: [],
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const limit = 10;

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const [orders, items, payments, refunds, customers, products] =
        await Promise.all([
          getSalesOrdersApi(),
          getSalesOrderItemsApi(),
          getSalesPaymentsApi(),
          getSalesRefundsApi(),
          getCustomersApi(),
          getProductsApi(),
        ]);

      setSalesData({
        orders,
        items,
        payments,
        refunds,
        customers,
        products,
      });
    } catch {
      setError("Unable to load sales transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSales();
  }, []);

  const customerMap = useMemo(
    () =>
      new Map(
        salesData.customers.map((customer) => [
          customer.id,
          customer.customer_name,
        ]),
      ),
    [salesData.customers],
  );

  const productMap = useMemo(
    () =>
      new Map(
        salesData.products.map((product) => [product.id, product.product_name]),
      ),
    [salesData.products],
  );

  const itemsByOrder = useMemo(() => {
    const map = new Map<string, SalesOrderItem[]>();

    salesData.items.forEach((item) => {
      const existing = map.get(item.order_id) ?? [];
      existing.push(item);
      map.set(item.order_id, existing);
    });

    return map;
  }, [salesData.items]);

  const paymentsByOrder = useMemo(() => {
    const map = new Map<string, SalesPayment[]>();

    salesData.payments.forEach((payment) => {
      const existing = map.get(payment.order_id) ?? [];
      existing.push(payment);
      map.set(payment.order_id, existing);
    });

    return map;
  }, [salesData.payments]);

  const refundsByOrder = useMemo(() => {
    const map = new Map<string, SalesRefund[]>();

    salesData.refunds.forEach((refund) => {
      const existing = map.get(refund.order_id) ?? [];
      existing.push(refund);
      map.set(refund.order_id, existing);
    });

    return map;
  }, [salesData.refunds]);

  const filteredOrders = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return salesData.orders.filter((order) => {
      const customerName = customerMap.get(order.customer_id) ?? "";

      const matchesSearch =
        !searchTerm ||
        order.order_number.toLowerCase().includes(searchTerm) ||
        customerName.toLowerCase().includes(searchTerm);

      const matchesStatus =
        status === "all" ||
        (order.order_status ?? "").toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [salesData.orders, search, status, customerMap]);

  const totalPages = Math.ceil(filteredOrders.length / limit);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page]);

  const orderStatuses = useMemo(
    () =>
      Array.from(
        new Set(
          salesData.orders
            .map((order) => order.order_status)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [salesData.orders],
  );

  const totalSales = salesData.orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0,
  );

  const totalPayments = salesData.payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const totalRefunds = salesData.refunds.reduce(
    (total, refund) => total + Number(refund.amount || 0),
    0,
  );

  const getPaymentStatus = (orderId: string) => {
    const payments = paymentsByOrder.get(orderId) ?? [];

    if (payments.length === 0) return "Unpaid";

    return payments[0].payment_status || "Recorded";
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const selectedItems = selectedOrder
    ? (itemsByOrder.get(selectedOrder.id) ?? [])
    : [];

  const selectedPayments = selectedOrder
    ? (paymentsByOrder.get(selectedOrder.id) ?? [])
    : [];

  const selectedRefunds = selectedOrder
    ? (refundsByOrder.get(selectedOrder.id) ?? [])
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Sales Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor customer orders, payments and refunds.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Orders</p>
            <ShoppingCart className="text-blue-600" size={22} />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {salesData.orders.length.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Sales</p>
            <CreditCard className="text-green-600" size={22} />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalSales)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Payments Recorded</p>
            <CreditCard className="text-indigo-600" size={22} />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalPayments)}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Refunds</p>
            <RefreshCw className="text-orange-600" size={22} />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalRefunds)}
          </h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500">Sales Orders</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {filteredOrders.length.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order number or customer..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {orderStatuses.map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {orderStatus}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void loadSales()}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
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
                Loading Sales Transactions...
              </p>
              <p className="text-sm text-slate-500">
                Fetching the latest sales transaction records
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void loadSales()}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-700">
              No sales transactions found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Order Number</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Order Date</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="p-4 font-medium text-slate-800">
                        {order.order_number}
                      </td>

                      <td className="p-4 text-slate-600">
                        {customerMap.get(order.customer_id) ||
                          "Unknown Customer"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatDate(order.order_date)}
                      </td>

                      <td className="p-4 text-slate-600">
                        {(itemsByOrder.get(order.id) ?? []).length}
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {formatCurrency(order.total_amount)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.order_status)}`}
                        >
                          {order.order_status || "Unknown"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(getPaymentStatus(order.id))}`}
                        >
                          {getPaymentStatus(order.id)}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-3 md:hidden">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {order.order_number}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {customerMap.get(order.customer_id) ||
                          "Unknown Customer"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(order.order_status)}`}
                    >
                      {order.order_status || "Unknown"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-xs text-slate-500">Order Date</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatDate(order.order_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Items</p>
                      <p className="text-sm font-medium text-slate-700">
                        {(itemsByOrder.get(order.id) ?? []).length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Total Amount</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Payment</p>
                      <p className="text-sm font-medium text-slate-700">
                        {getPaymentStatus(order.id)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Eye size={16} />
                    View Order Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * limit + 1}
            {" – "}
            {Math.min(page * limit, filteredOrders.length)}
            {" of "}
            {filteredOrders.length} orders
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Order Details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.order_number}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close order details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* Order Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {customerMap.get(selectedOrder.customer_id) ||
                      "Unknown Customer"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Order Date</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatDate(selectedOrder.order_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Order Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(selectedOrder.order_status)}`}
                  >
                    {selectedOrder.order_status || "Unknown"}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Payment Status</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(getPaymentStatus(selectedOrder.id))}`}
                  >
                    {getPaymentStatus(selectedOrder.id)}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                  <Package size={18} />
                  Order Items
                </h3>

                {selectedItems.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No order items found.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Unit Price</th>
                          <th className="p-3">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3 font-medium text-slate-800">
                              {productMap.get(item.product_id) ||
                                "Unknown Product"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="p-3 text-slate-600">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="p-3 font-medium text-slate-800">
                              {formatCurrency(item.line_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Order Amounts */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(selectedOrder.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Discount</span>
                    <span>
                      {formatCurrency(selectedOrder.discount_amount ?? 0)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax</span>
                    <span>{formatCurrency(selectedOrder.tax_amount ?? 0)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span>
                      {formatCurrency(selectedOrder.shipping_amount ?? 0)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                    <span>Order Total</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                  <CreditCard size={18} />
                  Payments
                </h3>

                {selectedPayments.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No payment records found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {payment.payment_reference || "Payment"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {payment.payment_method || "—"} ·{" "}
                            {formatDate(payment.payment_date)}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="font-semibold text-slate-800">
                            {formatCurrency(payment.amount)}
                          </p>
                          <span
                            className={`text-xs font-medium ${getStatusStyle(payment.payment_status)}`}
                          >
                            {payment.payment_status || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refunds */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                  <CalendarDays size={18} />
                  Refunds
                </h3>

                {selectedRefunds.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No refund records found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedRefunds.map((refund) => (
                      <div
                        key={refund.id}
                        className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {refund.refund_reference || "Refund"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {refund.refund_reason || "No reason provided"} ·{" "}
                            {formatDate(refund.refund_date)}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="font-semibold text-slate-800">
                            {formatCurrency(refund.amount)}
                          </p>
                          <span
                            className={`text-xs font-medium ${getStatusStyle(refund.refund_status)}`}
                          >
                            {refund.refund_status || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-800">
                    Order Notes
                  </h3>
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 text-right">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
