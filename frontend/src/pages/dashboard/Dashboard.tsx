import { useEffect, useState } from "react";
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Users,
  Package,
} from "lucide-react";

import {
  getSalesSummaryApi,
  getMonthlySalesApi,
  getTopProductsApi,
  getLowStockProductsApi,
  getCustomerCountApi,
  getProductCountApi,
  type SalesSummary,
  type MonthlySales,
  type TopProduct,
  type LowStockProduct,
} from "../../api/analyticsApi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    [],
  );
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState("");

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [dateFilter, setDateFilter] = useState("last30");

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const [error, setError] = useState("");
  const [chartError, setChartError] = useState("");
  const [productsError, setProductsError] = useState("");

useEffect(() => {
  const loadBusinessCounts = async () => {
    try {
      const [customers, products] = await Promise.all([
        getCustomerCountApi(),
        getProductCountApi(),
      ]);

      setTotalCustomers(customers);
      setTotalProducts(products);
    } catch (error) {
      console.error("Unable to load business counts:", error);
    }
  };

  void loadBusinessCounts();
}, []);
useEffect(() => {
  const loadSalesSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const today = new Date();

      // Format date using local browser date, not UTC.
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      };

      let startDate = new Date(today);
      const endDate = formatDate(today);

      switch (dateFilter) {
        case "today":
          break;

        case "last7":
          startDate.setDate(today.getDate() - 6);
          break;

        case "last30":
          startDate.setDate(today.getDate() - 29);
          break;

        case "thisMonth":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;

        case "thisYear":
          startDate = new Date(today.getFullYear(), 0, 1);
          break;

        case "custom":
          if (!customStartDate || !customEndDate) {
            return;
          }

          startDate = new Date(`${customStartDate}T00:00:00`);
          break;
      }

      const data = await getSalesSummaryApi(
        formatDate(startDate),
        dateFilter === "custom" ? customEndDate : endDate,
      );

      setSummary(data);
    } catch {
      setError("Unable to load sales summary.");
    } finally {
      setLoading(false);
    }
  };

  void loadSalesSummary();
}, [dateFilter, customStartDate, customEndDate]);


  useEffect(() => {
    const loadMonthlySales = async () => {
      try {
        setChartLoading(true);
        setChartError("");

        const data = await getMonthlySalesApi();
        setMonthlySales(data);
      } catch {
        setChartError("Unable to load monthly sales data.");
      } finally {
        setChartLoading(false);
      }
    };

    void loadMonthlySales();
  }, []);

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const data = await getTopProductsApi();
        setTopProducts(data);
      } catch {
        setProductsError("Unable to load top products.");
      } finally {
        setProductsLoading(false);
      }
    };

    void loadTopProducts();
  }, []);

  useEffect(() => {
    const loadLowStockProducts = async () => {
      try {
        setStockLoading(true);
        setStockError("");

        const data = await getLowStockProductsApi();
        setLowStockProducts(data);
      } catch {
        setStockError("Unable to load low stock products.");
      } finally {
        setStockLoading(false);
      }
    };

    void loadLowStockProducts();
  }, []);

  const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value));

  const formatMonth = (month: string) => {
    const date = new Date(`${month}-01T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };


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
          Loading Dashboard...
        </p>

        <p className="text-sm text-slate-500">
          Preparing your business overview and latest insights
        </p>
      </div>
    </div>
  );
}


  if (error || !summary) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        {error || "Sales summary unavailable."}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Sales",
      value: formatCurrency(summary.total_sales),
      icon: IndianRupee,
      description: "Total recorded sales",
    },
    {
      title: "Total Orders",
      value: summary.total_orders.toLocaleString("en-IN"),
      icon: ShoppingCart,
      description: "Total sales orders",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(summary.average_order_value),
      icon: TrendingUp,
      description: "Average value per order",
    },
    {
      title: "Out of Stock",
      value: stockLoading
        ? "..."
        : lowStockProducts
            .filter((product) => product.quantity_available === 0)
            .length.toString(),
      icon: AlertTriangle,
      description: "Products with zero available stock",
    },
    {
      title: "Low Stock",
      value: stockLoading
        ? "..."
        : lowStockProducts
            .filter(
              (product) =>
                product.quantity_available > 0 &&
                product.quantity_available < product.reorder_level,
            )
            .length.toString(),
      icon: AlertTriangle,
      description: "Products below reorder level",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString("en-IN"),
      icon: Users,
      description: "Registered business customers",
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString("en-IN"),
      icon: Package,
      description: "Products in your catalogue",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Business Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your business performance at a glance.
        </p>
      </div>

      {/* Dashboard Date Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <label
              htmlFor="dateFilter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filter Sales By Date
            </label>

            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 md:w-64"
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div>
                <label
                  htmlFor="customStartDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Start Date
                </label>

                <input
                  id="customStartDate"
                  type="date"
                  value={customStartDate}
                  max={customEndDate || undefined}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="customEndDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  End Date
                </label>

                <input
                  id="customEndDate"
                  type="date"
                  value={customEndDate}
                  min={customStartDate || undefined}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Icon size={22} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {card.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Sales Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Monthly Sales Trend
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sales performance over the last 12 months.
          </p>
        </div>

        {chartLoading ? (
          <p className="py-10 text-center text-slate-500">
            Loading monthly sales...
          </p>
        ) : chartError ? (
          <p className="py-10 text-center text-red-600">{chartError}</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={monthlySales}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tickFormatter={(value) =>
                  `₹${(Number(value) / 100000).toFixed(0)}L`
                }
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                labelFormatter={(label) => formatMonth(String(label))}
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Total Sales",
                ]}
              />

              <Line
                type="monotone"
                dataKey="total_sales"
                name="Total Sales"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 5 Products Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Top 5 Products by Revenue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Products generating the highest sales revenue.
          </p>
        </div>

        {productsLoading ? (
          <p className="py-10 text-center text-slate-500">
            Loading top products...
          </p>
        ) : productsError ? (
          <p className="py-10 text-center text-red-600">{productsError}</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                type="number"
                tickFormatter={(value) =>
                  `₹${(Number(value) / 100000).toFixed(0)}L`
                }
              />

              <YAxis
                type="category"
                dataKey="product_name"
                width={180}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Total Revenue",
                ]}
              />

              <Bar
                dataKey="total_revenue"
                name="Total Revenue"
                fill="#16a34a"
                barSize={28}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Low Stock Products */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Low Stock Products
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Products that need inventory replenishment.
          </p>
        </div>

        {stockLoading ? (
          <p className="py-6 text-center text-slate-500">
            Loading inventory alerts...
          </p>
        ) : stockError ? (
          <p className="py-6 text-center text-red-600">{stockError}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Reorder Level</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.product_id} className="border-b">
                    <td className="p-3 font-medium text-slate-800">
                      {product.product_name}
                    </td>
                    <td className="p-3 text-slate-500">{product.sku}</td>
                    <td className="p-3 font-semibold">
                      {product.quantity_available}
                    </td>
                    <td className="p-3">{product.reorder_level}</td>
                    <td className="p-3">
                      {product.quantity_available === 0 ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          Low Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Business Data */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-green-600" />
          <h2 className="font-semibold text-slate-800">Live Business Data</h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Dashboard information is retrieved from your existing Express
          analytics API and NeonDB.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
