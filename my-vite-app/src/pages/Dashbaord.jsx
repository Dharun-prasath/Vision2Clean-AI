import { useState } from 'react'

const statsData = [
  { id: 1, title: 'Datasets', value: 24, delta: '+8%' },
  { id: 2, title: 'Trained Models', value: 6, delta: '+2%' },
  { id: 3, title: 'Inferences / day', value: 1280, delta: '+12%' },
  { id: 4, title: 'Accuracy', value: '92.4%', delta: '+0.4%' },
]

const recentRuns = [
  { id: 'run-101', model: 'yolo11s-seg', dataset: 'garbage-dataset', status: 'success', started: '2025-10-14' },
  { id: 'run-102', model: 'yolo11m-seg', dataset: 'garbage-dataset', status: 'running', started: '2025-10-15' },
  { id: 'run-103', model: 'yolo11n', dataset: 'custom-test', status: 'failed', started: '2025-09-30' },
]

function StatCard({ title, value, delta }) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4">
      <div className="text-sm text-slate-500 dark:text-slate-300">{title}</div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
        <div className="ml-3 text-sm text-green-600 dark:text-green-400">{delta}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-slate-800 border-r dark:border-slate-700 transition-width duration-200`}>
          <div className="h-full flex flex-col">
            <div className="px-4 py-5 flex items-center justify-between border-b dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-r from-emerald-500 to-sky-500 rounded flex items-center justify-center text-white font-bold">V2</div>
                {sidebarOpen && <div className="text-lg font-semibold">Vision2Clean</div>}
              </div>
              <button onClick={() => setSidebarOpen((s) => !s)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              <a className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Dashboard</a>
              <a className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Datasets</a>
              <a className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Models</a>
              <a className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Training</a>
              <a className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Inference</a>
              <a className="block px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">Settings</a>
            </nav>

            <div className="p-4 border-t dark:border-slate-700">
              {sidebarOpen ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">v0.1 • © {new Date().getFullYear()}</div>
              ) : (
                <div className="text-xs text-center text-slate-500">v0.1</div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-300">Oct 2025</div>
              <button className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">New Run</button>
            </div>
          </header>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {statsData.map((s) => (
              <StatCard key={s.id} title={s.title} value={s.value} delta={s.delta} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Large panel - chart placeholder */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Model Performance</h3>
                <div className="text-sm text-slate-500">Last 30 days</div>
              </div>
              <div className="h-64 rounded-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center text-slate-400">
                {/* Placeholder for chart - integrate chart library (Recharts/Chart.js) later */}
                Chart Placeholder
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">Precision: <strong>91.2%</strong></div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">Recall: <strong>89.6%</strong></div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">mAP: <strong>86.4%</strong></div>
              </div>
            </div>

            {/* Right column - recent runs */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Recent Training Runs</h3>
              <ul className="space-y-3">
                {recentRuns.map((r) => (
                  <li key={r.id} className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{r.model}</div>
                      <div className="text-xs text-slate-500">{r.dataset} • {r.started}</div>
                    </div>
                    <div className={`text-sm font-semibold ${r.status === 'success' ? 'text-green-600' : r.status === 'running' ? 'text-amber-500' : 'text-red-600'}`}>{r.status}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 bg-white dark:bg-slate-800 shadow rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Latest Inferences</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-2">ID</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Result</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t dark:border-slate-700">
                    <td className="p-2">inf-901</td>
                    <td className="p-2">cardboard_123.jpg</td>
                    <td className="p-2">Cardboard</td>
                    <td className="p-2">0.94</td>
                    <td className="p-2">2025-10-14</td>
                  </tr>
                  <tr className="border-t dark:border-slate-700">
                    <td className="p-2">inf-902</td>
                    <td className="p-2">plastic_21.jpg</td>
                    <td className="p-2">Plastic</td>
                    <td className="p-2">0.88</td>
                    <td className="p-2">2025-10-14</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
