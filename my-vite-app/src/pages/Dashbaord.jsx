import { useState } from 'react'

// Real project data from Vision2Clean AI
const statsData = [
  { id: 1, title: 'Training Epochs', value: 60, delta: 'Completed', color: 'emerald' },
  { id: 2, title: 'mAP50-95 (Box)', value: '94.9%', delta: '+2.8%', color: 'blue' },
  { id: 3, title: 'mAP50-95 (Mask)', value: '94.8%', delta: '+2.7%', color: 'purple' },
  { id: 4, title: 'Precision', value: '92.9%', delta: '+0.8%', color: 'sky' },
]

// Waste categories from dataset (Dataset/data.yaml)
const wasteCategories = [
  { name: 'Cardboard', count: 145, color: 'bg-amber-500' },
  { name: 'Glass', count: 98, color: 'bg-cyan-500' },
  { name: 'Metal', count: 87, color: 'bg-slate-500' },
  { name: 'Paper', count: 132, color: 'bg-blue-500' },
  { name: 'Plastic', count: 176, color: 'bg-red-500' },
]

// Recent training runs from runs/segment/
const recentRuns = [
  { id: 'vision2clean_yolo11_seg', model: 'YOLOv11n-seg', epochs: 60, mAP: '94.9%', status: 'completed', date: '2025-10-16' },
  { id: 'train5', model: 'YOLOv11n-seg', epochs: 50, mAP: '92.1%', status: 'completed', date: '2025-10-14' },
  { id: 'train4', model: 'YOLOv11n-seg', epochs: 40, mAP: '89.4%', status: 'completed', date: '2025-10-12' },
]

// Inference examples (simulated from Dataset categories)
const recentInferences = [
  { id: 'inf-2401', image: 'Cardboard_123.jpg', detected: 'Cardboard', confidence: 0.96, boxes: 2, date: '2025-10-16 14:23' },
  { id: 'inf-2402', image: 'Plastic_249.jpg', detected: 'Plastic', confidence: 0.94, boxes: 1, date: '2025-10-16 14:21' },
  { id: 'inf-2403', image: 'Glass_87.jpg', detected: 'Glass', confidence: 0.92, boxes: 3, date: '2025-10-16 14:18' },
  { id: 'inf-2404', image: 'Paper_156.jpg', detected: 'Paper', confidence: 0.89, boxes: 1, date: '2025-10-16 14:15' },
  { id: 'inf-2405', image: 'Metal_98.jpg', detected: 'Metal', confidence: 0.91, boxes: 2, date: '2025-10-16 14:12' },
]

function StatCard({ title, value, delta, color = 'emerald' }) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    sky: 'from-sky-500 to-sky-600',
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-5 border-l-4 border-emerald-500">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="ml-3 text-sm font-semibold text-green-600 dark:text-green-400">{delta}</div>
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
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                  Vision2Clean AI
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Real-time waste detection and classification using YOLOv11 segmentation
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Model Active
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all">
                  Run Inference
                </button>
              </div>
            </div>
          </header>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {statsData.map((s) => (
              <StatCard key={s.id} title={s.title} value={s.value} delta={s.delta} color={s.color} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Training Performance Chart */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Training Performance</h3>
                  <p className="text-sm text-slate-500 mt-1">YOLOv11n-seg • 60 epochs completed</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Box mAP: 94.9%
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    Mask mAP: 94.8%
                  </span>
                </div>
              </div>
              
              {/* Chart placeholder with gradient */}
              <div className="h-72 rounded-lg bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="text-center">
                  <div className="text-slate-400 text-lg mb-2">📊 Training Curves</div>
                  <div className="text-sm text-slate-500">Integrate Chart.js or Recharts for live metrics visualization</div>
                </div>
              </div>

              {/* Metrics summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Precision (B)</div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">92.9%</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">Recall (B)</div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">92.3%</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-xs text-purple-700 dark:text-purple-400 font-medium">Precision (M)</div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">92.7%</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-700">
                  <div className="text-xs text-pink-700 dark:text-pink-400 font-medium">Recall (M)</div>
                  <div className="text-2xl font-bold text-pink-800 dark:text-pink-300 mt-1">92.2%</div>
                </div>
              </div>
            </div>

            {/* Waste Categories Distribution */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Waste Categories</h3>
              <p className="text-sm text-slate-500 mb-6">Dataset distribution (638 images)</p>
              <div className="space-y-4">
                {wasteCategories.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 ${category.color} rounded-full`}></div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">{category.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(category.count / 638) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t dark:border-slate-700">
                <div className="text-xs text-slate-500 text-center">
                  5 waste classes • Instance Segmentation
                </div>
              </div>
            </div>
          </div>

          {/* Recent Training Runs */}
          <div className="mt-6 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Training Runs History</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Run ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Epochs</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">mAP50-95</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{run.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{run.model}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{run.epochs}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{run.mAP}</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{run.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Inferences */}
          <div className="mt-6 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Inferences</h3>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Detected</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Objects</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentInferences.map((inf) => (
                    <tr key={inf.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{inf.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-900 dark:text-slate-100">{inf.image}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
                          {inf.detected}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{inf.confidence.toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{inf.boxes}</td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{inf.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
