import { useMemo, useState } from "react";

const summaryCards = [
  {
    title: "Current Balance",
    value: 12540,
    change: "+8.6%",
    icon: "💰",
    className: "bg-slate-950/90 text-white",
  },
  {
    title: "Income",
    value: 18450,
    change: "+12.4%",
    icon: "🚀",
    className: "bg-white/90 text-slate-950",
  },
  {
    title: "Expenses",
    value: 5920,
    change: "-4.2%",
    icon: "💸",
    className: "bg-white/90 text-slate-950",
  },
];

const balanceHistory = [10420, 11100, 11640, 12350, 11980, 12540, 13020, 13360];
const balanceHistory1W = [
  12000, 12200, 12100, 12300, 12400, 12540, 12600, 12700,
];
const balanceHistory1M = [
  11000, 11200, 11400, 11600, 11800, 12000, 12200, 12540,
];
const balanceHistory3M = [
  10000, 10500, 11000, 11500, 12000, 12200, 12400, 12540,
];
const balanceHistory1Y = [8000, 8500, 9000, 9500, 10000, 10500, 11000, 12540];
const categoryData = [
  { label: "Housing", value: 35, color: "#38bdf8" },
  { label: "Food", value: 22, color: "#f97316" },
  { label: "Transport", value: 15, color: "#a855f7" },
  { label: "Health", value: 14, color: "#22c55e" },
  { label: "Other", value: 14, color: "#f43f5e" },
];

const transactions = [
  { date: "2026-04-02", amount: 420, category: "Food", type: "Expense" },
  { date: "2026-04-01", amount: 3200, category: "Salary", type: "Income" },
  { date: "2026-03-29", amount: 120, category: "Transport", type: "Expense" },
  { date: "2026-03-27", amount: 820, category: "Housing", type: "Expense" },
  { date: "2026-03-25", amount: 98, category: "Health", type: "Expense" },
  { date: "2026-03-22", amount: 1450, category: "Investment", type: "Income" },
  { date: "2026-03-20", amount: 260, category: "Food", type: "Expense" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

function buildLinePoints(values, width = 700, height = 240) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const delta = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / delta) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildPieSegments(data) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  return data.map((item, index) => {
    const startAngle = data
      .slice(0, index)
      .reduce((sum, item) => sum + item.value, 0);
    const dash = (item.value / 100) * circumference;
    const offset = circumference - (startAngle / 100) * circumference;
    return {
      ...item,
      dash,
      offset,
      radius,
      circumference,
    };
  });
}

function App() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortKey, setSortKey] = useState("dateDesc");
  const [role, setRole] = useState("Viewer");
  const [selectedPeriod, setSelectedPeriod] = useState("1W");

  const sortedTransactions = useMemo(() => {
    const list = [...transactions];
    if (sortKey === "dateAsc") {
      return list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (sortKey === "dateDesc") {
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if (sortKey === "amountAsc") {
      return list.sort((a, b) => a.amount - b.amount);
    }
    if (sortKey === "amountDesc") {
      return list.sort((a, b) => b.amount - a.amount);
    }
    return list;
  }, [sortKey]);

  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter((tx) => {
      const matchesSearch = [
        tx.date,
        formatDate(tx.date),
        tx.amount,
        tx.category,
        tx.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType = typeFilter === "All" || tx.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter, sortedTransactions]);

  const expenseTotals = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (tx.type === "Expense") {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      }
      return acc;
    }, {});
  }, []);

  const insightMetrics = useMemo(() => {
    const totalIncome = transactions
      .filter((tx) => tx.type === "Income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions
      .filter((tx) => tx.type === "Expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const highestCategory = Object.entries(expenseTotals).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["N/A", 0];
    const previousBalance =
      balanceHistory[balanceHistory.length - 2] ?? balanceHistory[0];
    const difference =
      balanceHistory[balanceHistory.length - 1] - previousBalance;

    return {
      totalIncome,
      totalExpense,
      highestCategory,
      expenseRatio: totalIncome
        ? Math.round((totalExpense / totalIncome) * 100)
        : 0,
      monthlyChange: difference,
    };
  }, [expenseTotals]);

  const pieSegments = useMemo(() => buildPieSegments(categoryData), []);
  const currentBalanceHistory = useMemo(() => {
    switch (selectedPeriod) {
      case "1W":
        return balanceHistory1W;
      case "1M":
        return balanceHistory1M;
      case "3M":
        return balanceHistory3M;
      case "1Y":
        return balanceHistory1Y;
      default:
        return balanceHistory;
    }
  }, [selectedPeriod]);
  const linePoints = useMemo(
    () => buildLinePoints(currentBalanceHistory, 640, 220),
    [currentBalanceHistory],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">
              Finance dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Track cash flow & spending
            </h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              A clean interface for tracking personal finance activity with
              simple insights, filters, and role-based controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-3xl bg-slate-900/95 px-4 py-3 text-sm text-slate-300 shadow-soft ring-1 ring-white/10">
              Role: <span className="font-semibold text-white">{role}</span>
            </div>
            <div className="rounded-full bg-white/5 p-1 ring-1 ring-white/10 grid w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:grid-cols-none">
              {["Viewer", "Admin"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-full w-full px-4 py-2 text-center text-sm font-medium transition sm:w-auto ${
                    role === option
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">
              Insight
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Fast facts from your data
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">Highest spend</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {insightMetrics.highestCategory[0]}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {formatCurrency(insightMetrics.highestCategory[1])}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">Expense ratio</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {insightMetrics.expenseRatio}% of income
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Based on recent transactions
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">Monthly comparison</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {insightMetrics.monthlyChange >= 0 ? "+" : ""}
                  {formatCurrency(insightMetrics.monthlyChange)}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Change from previous period
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <article
                key={card.title}
                className={`rounded-3xl border border-white/10 p-6 shadow-soft ${card.className}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    {card.title}
                  </p>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl">
                    {card.icon}
                  </span>
                </div>
                <p className="mt-6 text-3xl font-semibold">
                  {formatCurrency(card.value)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {card.change} vs last month
                </p>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">
                    Account health
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Spending by category
                  </h2>
                </div>
                <div className="rounded-2xl bg-slate-800/80 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                  Live
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-end">
                <svg viewBox="0 0 220 220" className="h-52 w-52 shrink-0">
                  <circle
                    cx="110"
                    cy="110"
                    r="80"
                    fill="transparent"
                    stroke="#334155"
                    strokeWidth="30"
                  />
                  {pieSegments.map((segment) => (
                    <circle
                      key={segment.label}
                      cx="110"
                      cy="110"
                      r={segment.radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="30"
                      strokeDasharray={`${segment.dash} ${segment.circumference - segment.dash}`}
                      strokeDashoffset={segment.offset}
                      strokeLinecap="round"
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "center",
                      }}
                    />
                  ))}
                </svg>
                <div className="grid gap-3">
                  {categoryData.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-2xl bg-slate-950/80 px-4 py-3"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-sm text-slate-300">{item.label}</p>
                        <p className="text-base font-semibold text-white">
                          {item.value}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-white">
                Goal progress
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                Keep your spending under control for the next quarter.
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Saved for emergency fund</span>
                    <span>68%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Monthly budget</span>
                    <span>84%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: "84%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">
                  Balance over time
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Rolling balance
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["1W", "1M", "3M", "1Y"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period)}
                    className={`w-full rounded-full border px-4 py-2 text-sm transition sm:w-auto ${
                      selectedPeriod === period
                        ? "border-cyan-500/70 bg-cyan-500/10 text-cyan-300"
                        : "border-white/10 bg-slate-950/80 text-slate-300 hover:border-cyan-500/40 hover:text-white"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 overflow-hidden rounded-[2rem] bg-slate-950/70 p-4">
              <svg viewBox="0 0 700 240" className="h-[240px] w-full">
                <defs>
                  <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <path
                  d={`M${linePoints}`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {currentBalanceHistory.map((value, index) => {
                  const [x, y] = linePoints.split(" ")[index].split(",");
                  return (
                    <circle key={index} cx={x} cy={y} r="4" fill="#34d399" />
                  );
                })}
              </svg>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <span className="text-sm text-slate-400">This week</span>
                <p className="mt-2 text-xl font-semibold text-white">+4.8%</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <span className="text-sm text-slate-400">Average</span>
                <p className="mt-2 text-xl font-semibold text-white">₹12.6k</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4">
                <span className="text-sm text-slate-400">Last month</span>
                <p className="mt-2 text-xl font-semibold text-white">₹11.9k</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">
                  Controls
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Search & filters
                </h2>
              </div>
              <span className="rounded-2xl bg-slate-950/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                {role}
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-400">Search</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search date, amount, category, type"
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-400">Sort by</span>
                  <select
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option value="dateDesc">Date (newest)</option>
                    <option value="dateAsc">Date (oldest)</option>
                    <option value="amountDesc">Amount (high to low)</option>
                    <option value="amountAsc">Amount (low to high)</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm text-slate-400">Transaction type</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                >
                  {["All", "Income", "Expense"].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                {role === "Admin"
                  ? "Admin mode: full view with edit access granted."
                  : "Viewer mode: read-only dashboard for quick review."}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-soft">
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">
                Transactions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Recent activity
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                transactions.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className="w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
              >
                Export report
              </button>
              {role === "Admin" && (
                <button
                  type="button"
                  className="w-full rounded-full border border-white/10 bg-slate-950/80 px-5 py-3 text-sm text-slate-100 transition hover:border-cyan-400/70 sm:w-auto"
                >
                  New transaction
                </button>
              )}
            </div>
          </div>

          <div className="min-w-full overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em]">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em]">
                    Category
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em]">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr
                    key={`${tx.date}-${tx.amount}-${tx.category}`}
                    className="border-t border-white/10 transition hover:bg-slate-950/60"
                  >
                    <td className="px-6 py-5 text-sm text-slate-200">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-5 text-sm text-white">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-200">
                      {tx.category}
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          tx.type === "Income"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-sm text-slate-400"
                    >
                      No transactions match the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
