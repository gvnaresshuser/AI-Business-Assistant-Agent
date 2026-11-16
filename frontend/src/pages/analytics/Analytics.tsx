import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Boxes,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,  
  Wallet,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getDailySalesApi,
  getTopCustomersApi,
  getCategorySalesApi,
  getPaymentMethodSummaryApi,
  getInventoryValuationApi,
  getStockMovementSummaryApi,
  getPurchaseSummaryApi,
  getVendorPurchaseSummaryApi,
  getExpenseSummaryApi,
  getRefundSummaryApi,
  type DailySales,
  type TopCustomer,
  type CategorySales,
  type PaymentMethodSummary,
  type InventoryValuation,
  type StockMovementSummary,
  type PurchaseSummaryReport,
  type VendorPurchaseSummary,
  type ExpenseSummaryReport,
  type RefundSummaryReport,
} from "../../api/analyticsApi";

// =====================================================
// CONSTANTS
// =====================================================

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#64748B",
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const formatCurrency = (value: string | number): string => {
  return currencyFormatter.format(Number(value) || 0);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-IN").format(value || 0);
};

const formatDate = (date: string): string => {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

interface SectionHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const SectionHeader = ({
  title,
  description,
  icon: Icon,
}: SectionHeaderProps) => (
  <div className="mb-5 flex items-center gap-3">
    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
      <Icon size={22} />
    </div>

    <div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}: CardProps) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-4 break-words text-2xl font-bold text-slate-800">
        {value}
      </h3>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

interface PanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Panel = ({ title, description, children }: PanelProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>

    {children}
  </div>
);

const EmptyState = () => (
  <div className="flex h-64 flex-col items-center justify-center text-slate-400">
    <BarChart3 size={34} className="mb-3" />
    <p className="text-sm">No data available</p>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
    {children}
  </td>
);

// =====================================================
// MAIN ANALYTICS COMPONENT
// =====================================================

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sales
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>(
    [],
  );

  // Inventory
  const [inventory, setInventory] = useState<InventoryValuation | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovementSummary[]>(
    [],
  );

  // Purchases
  const [purchaseSummary, setPurchaseSummary] =
    useState<PurchaseSummaryReport | null>(null);
  const [vendorPurchases, setVendorPurchases] = useState<
    VendorPurchaseSummary[]
  >([]);

  // Finance
  const [expenseSummary, setExpenseSummary] =
    useState<ExpenseSummaryReport | null>(null);
  const [refundSummary, setRefundSummary] =
    useState<RefundSummaryReport | null>(null);

  // ===================================================
  // LOAD ANALYTICS DATA
  // ===================================================

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        daily,
        customers,
        categories,
        payments,
        valuation,
        movements,
        purchases,
        vendors,
        expenses,
        refunds,
      ] = await Promise.all([
        getDailySalesApi(),
        getTopCustomersApi(),
        getCategorySalesApi(),
        getPaymentMethodSummaryApi(),
        getInventoryValuationApi(),
        getStockMovementSummaryApi(),
        getPurchaseSummaryApi(),
        getVendorPurchaseSummaryApi(),
        getExpenseSummaryApi(),
        getRefundSummaryApi(),
      ]);

      setDailySales(daily);
      setTopCustomers(customers);
      setCategorySales(categories);
      setPaymentMethods(payments);
      setInventory(valuation);
      setStockMovements(movements);
      setPurchaseSummary(purchases);
      setVendorPurchases(vendors);
      setExpenseSummary(expenses);
      setRefundSummary(refunds);
    } catch (err) {
      console.error("Analytics loading error:", err);

      setError(
        "Unable to load analytics data. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  // ===================================================
  // PREPARE CHART DATA
  // ===================================================

  const dailySalesChart = [...dailySales].reverse().map((item) => ({
    date: formatDate(item.sales_date),
    sales: Number(item.total_sales),
    orders: item.total_orders,
  }));

  const categoryChart = categorySales.map((item) => ({
    category: item.category_name,
    revenue: Number(item.total_revenue),
    quantity: item.total_quantity_sold,
  }));

  const paymentChart = paymentMethods.map((item) => ({
    name: item.payment_method,
    value: Number(item.total_amount),
  }));

  const stockMovementChart = stockMovements.map((item) => ({
    type: item.movement_type,
    movements: item.total_movements,
    quantity: item.total_quantity,
  }));

  const purchaseStatusChart =
    purchaseSummary?.status_breakdown.map((item) => ({
      status: item.status,
      orders: item.total_orders,
      amount: Number(item.total_amount),
    })) ?? [];

  const expenseChart =
    expenseSummary?.category_breakdown.map((item) => ({
      category: item.expense_category,
      amount: Number(item.total_amount),
    })) ?? [];

  const refundStatusChart =
    refundSummary?.status_breakdown.map((item) => ({
      status: item.refund_status,
      amount: Number(item.total_amount),
      records: item.total_records,
    })) ?? [];

  const refundReasonChart =
    refundSummary?.reason_breakdown.map((item) => ({
      reason: item.refund_reason,
      amount: Number(item.total_amount),
    })) ?? [];

  // ===================================================
  // LOADING STATE
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-[5px] border-indigo-100" />

          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-[5px] border-transparent border-t-blue-600 border-r-violet-600" />

          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10" />
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Loading Business Analytics...
          </p>

          <p className="text-sm text-slate-500">
            Fetching your latest business reports
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // ERROR STATE
  // ===================================================

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-3 text-red-500" size={36} />

        <h2 className="text-lg font-semibold text-slate-800">
          Analytics unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">{error}</p>

        <button
          type="button"
          onClick={() => void loadAnalytics()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="space-y-10">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Business Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Detailed insights into your business performance
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAnalytics()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh Reports
        </button>
      </div>

      {/* =================================================
          1. SALES ANALYTICS
      ================================================= */}

      <section>
        <SectionHeader
          title="Sales Performance"
          description="Daily sales trends, customer performance and payment analysis"
          icon={TrendingUp}
        />

        {/* Daily Sales KPIs */}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Daily Sales Records"
            value={formatNumber(dailySales.length)}
            subtitle="Days with recorded sales"
            icon={Activity}
            color="blue"
          />

          <MetricCard
            title="Total Daily Revenue"
            value={formatCurrency(
              dailySales.reduce(
                (sum, item) => sum + Number(item.total_sales),
                0,
              ),
            )}
            subtitle="Sum of daily sales returned by API"
            icon={DollarSign}
            color="green"
          />

          <MetricCard
            title="Total Orders"
            value={formatNumber(
              dailySales.reduce((sum, item) => sum + item.total_orders, 0),
            )}
            subtitle="Orders across returned daily records"
            icon={ShoppingCart}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Daily Sales Chart */}

          <Panel
            title="Daily Sales Trend"
            description="Revenue and order count by day"
          >
            {dailySalesChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySalesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />

                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value: number) =>
                        `₹${formatNumber(value)}`
                      }
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number" ? formatNumber(value) : value
                      }
                    />

                    <Legend />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      name="Sales (₹)"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Category Sales Chart */}

          <Panel
            title="Category-wise Sales"
            description="Revenue generated by product category"
          >
            {categoryChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />

                    <YAxis
                      tickFormatter={(value: number) =>
                        `₹${formatNumber(value)}`
                      }
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#3B82F6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Payment Methods */}

          <Panel
            title="Payment Method Analysis"
            description="Distribution of completed payments by amount"
          >
            {paymentChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                      }
                    >
                      {paymentChart.map((_, index) => (
                        <Cell
                          key={`payment-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number"
                          ? formatCurrency(value)
                          : value
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Top Customers */}

          <Panel
            title="Top 5 Customers"
            description="Customers ranked by total sales revenue"
          >
            {topCustomers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHeader>Customer</TableHeader>
                      <TableHeader>Orders</TableHeader>
                      <TableHeader>Revenue</TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {topCustomers.map((customer, index) => (
                      <tr key={customer.customer_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                              {index + 1}
                            </span>

                            <div>
                              <p className="font-medium text-slate-800">
                                {customer.customer_name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {customer.email || customer.phone || "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {formatNumber(customer.total_orders)}
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(customer.total_revenue)}
                          </span>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* =================================================
          2. INVENTORY ANALYTICS
      ================================================= */}

      <section>
        <SectionHeader
          title="Inventory Insights"
          description="Stock valuation and inventory movement analysis"
          icon={Boxes}
        />

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Inventory Products"
            value={formatNumber(inventory?.total_products ?? 0)}
            icon={Package}
            color="blue"
          />

          <MetricCard
            title="Total Stock Units"
            value={formatNumber(inventory?.total_units ?? 0)}
            icon={Boxes}
            color="purple"
          />

          <MetricCard
            title="Inventory Cost Value"
            value={formatCurrency(inventory?.total_cost_value ?? "0")}
            icon={DollarSign}
            color="orange"
          />

          <MetricCard
            title="Potential Selling Value"
            value={formatCurrency(inventory?.total_selling_value ?? "0")}
            icon={TrendingUp}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Inventory Valuation Table */}

          <Panel
            title="Product-wise Inventory Valuation"
            description="Products ranked by inventory cost value"
          >
            {!inventory?.products.length ? (
              <EmptyState />
            ) : (
              <div className="max-h-96 overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      <TableHeader>Product</TableHeader>
                      <TableHeader>Stock</TableHeader>
                      <TableHeader>Cost Value</TableHeader>
                      <TableHeader>Selling Value</TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {inventory.products.map((product) => (
                      <tr key={product.product_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">
                              {product.product_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {product.sku}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {formatNumber(product.quantity_on_hand)}
                        </TableCell>

                        <TableCell>
                          {formatCurrency(product.inventory_cost_value)}
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-emerald-700">
                            {formatCurrency(product.potential_selling_value)}
                          </span>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Stock Movement */}

          <Panel
            title="Stock Movement Analysis"
            description="Movement count and quantity by movement type"
          >
            {stockMovementChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockMovementChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />

                    <YAxis tick={{ fontSize: 11 }} />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="movements"
                      name="Movements"
                      fill="#8B5CF6"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="quantity"
                      name="Quantity"
                      fill="#06B6D4"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* =================================================
          3. PURCHASE ANALYTICS
      ================================================= */}

      <section>
        <SectionHeader
          title="Purchase Insights"
          description="Purchase order performance and vendor analysis"
          icon={ShoppingCart}
        />

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Purchase Orders"
            value={formatNumber(
              purchaseSummary?.summary.total_purchase_orders ?? 0,
            )}
            icon={ShoppingCart}
            color="blue"
          />

          <MetricCard
            title="Total Purchase Value"
            value={formatCurrency(
              purchaseSummary?.summary.total_purchase_value ?? "0",
            )}
            icon={DollarSign}
            color="purple"
          />

          <MetricCard
            title="Average Purchase Order"
            value={formatCurrency(
              purchaseSummary?.summary.average_purchase_order_value ?? "0",
            )}
            icon={TrendingUp}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Purchase Status */}

          <Panel
            title="Purchase Status Breakdown"
            description="Purchase orders grouped by status"
          >
            {purchaseStatusChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={purchaseStatusChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />

                    <YAxis tick={{ fontSize: 11 }} />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="orders"
                      name="Orders"
                      fill="#3B82F6"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="amount"
                      name="Amount (₹)"
                      fill="#10B981"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Vendor Purchases */}

          <Panel
            title="Vendor Purchase Performance"
            description="Vendor-wise purchase value and order count"
          >
            {vendorPurchases.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="max-h-96 overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      <TableHeader>Vendor</TableHeader>
                      <TableHeader>Orders</TableHeader>
                      <TableHeader>Purchase Value</TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {vendorPurchases.map((vendor) => (
                      <tr key={vendor.vendor_id}>
                        <TableCell>
                          <span className="font-medium text-slate-800">
                            {vendor.vendor_name}
                          </span>
                        </TableCell>

                        <TableCell>
                          {formatNumber(vendor.total_purchase_orders)}
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(vendor.total_purchase_value)}
                          </span>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* =================================================
          4. FINANCIAL ANALYTICS
      ================================================= */}

      <section>
        <SectionHeader
          title="Financial Insights"
          description="Expense analysis and refund monitoring"
          icon={Wallet}
        />

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Total Expenses"
            value={formatCurrency(
              expenseSummary?.summary.total_expense_amount ?? "0",
            )}
            subtitle={`${formatNumber(
              expenseSummary?.summary.total_expense_records ?? 0,
            )} expense records`}
            icon={Wallet}
            color="orange"
          />

          <MetricCard
            title="Average Expense"
            value={formatCurrency(
              expenseSummary?.summary.average_expense_amount ?? "0",
            )}
            icon={DollarSign}
            color="purple"
          />

          <MetricCard
            title="Total Refunds"
            value={formatCurrency(
              refundSummary?.summary.total_refund_amount ?? "0",
            )}
            subtitle={`${formatNumber(
              refundSummary?.summary.total_refund_records ?? 0,
            )} refund records`}
            icon={CreditCard}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Expense Categories */}

          <Panel
            title="Expense Category Analysis"
            description="Expense distribution by category"
          >
            {expenseChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChart}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                      }
                    >
                      {expenseChart.map((_, index) => (
                        <Cell
                          key={`expense-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        typeof value === "number"
                          ? formatCurrency(value)
                          : value
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Refund Status */}

          <Panel
            title="Refund Status Analysis"
            description="Refund amounts grouped by status"
          >
            {refundStatusChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={refundStatusChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />

                    <YAxis
                      tickFormatter={(value: number) =>
                        `₹${formatNumber(value)}`
                      }
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="amount"
                      name="Refund Amount"
                      fill="#EF4444"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Refund Reasons */}

          <Panel
            title="Refund Reason Analysis"
            description="Refund amounts grouped by reason"
          >
            {refundReasonChart.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={refundReasonChart}
                    layout="vertical"
                    margin={{ left: 25, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis type="number" tick={{ fontSize: 11 }} />

                    <YAxis
                      type="category"
                      dataKey="reason"
                      width={110}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="amount"
                      name="Refund Amount"
                      fill="#F59E0B"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Refund Details */}

          <Panel
            title="Refund Details"
            description="Refund breakdown by status and reason"
          >
            {!refundSummary ||
            (refundSummary.status_breakdown.length === 0 &&
              refundSummary.reason_breakdown.length === 0) ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    By Status
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <TableHeader>Status</TableHeader>
                          <TableHeader>Records</TableHeader>
                          <TableHeader>Amount</TableHeader>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {refundSummary.status_breakdown.map((item) => (
                          <tr key={item.refund_status}>
                            <TableCell>{item.refund_status}</TableCell>
                            <TableCell>
                              {formatNumber(item.total_records)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.total_amount)}
                            </TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    By Reason
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <TableHeader>Reason</TableHeader>
                          <TableHeader>Records</TableHeader>
                          <TableHeader>Amount</TableHeader>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {refundSummary.reason_breakdown.map((item) => (
                          <tr key={item.refund_reason}>
                            <TableCell>{item.refund_reason}</TableCell>
                            <TableCell>
                              {formatNumber(item.total_records)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.total_amount)}
                            </TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* PAGE FOOTER */}

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 shrink-0 text-blue-600" size={20} />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Business Analytics Report
            </p>

            <p className="mt-1 text-xs leading-relaxed text-blue-700">
              Reports are generated from your business data using the
              authenticated analytics APIs. Values reflect the data returned by
              each report endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
