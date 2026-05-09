/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Zap, Layout, Code, ArrowRight, User, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

// 定义玩家数据类型
interface PlayerData {
  id: string;
  name: string;
  level: number;
  [key: string]: any; // 兼容 API 返回的其他字段
}

export default function App() {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 请求数据的函数
  const fetchPlayerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://old-star-9b17.myhazeflame.workers.dev/api/v1/player?id=843948879");
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }
      const data = await response.json();
      setPlayer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载后自动请求一次（可选）
  useEffect(() => {
    fetchPlayerData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Zap className="w-12 h-12 text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Vite <span className="text-blue-600">Pro</span> Dashboard
          </h1>
          <p className="text-xl text-gray-500 max-w-lg mx-auto">
            正在演示如何从 API 获取并展示数据。
          </p>
        </div>

        {/* 数据展示卡片 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              玩家数据查询
            </h2>
            <button 
              onClick={fetchPlayerData}
              disabled={loading}
              className="text-xs font-medium px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              刷新数据
            </button>
          </div>

          <div className="min-h-[100px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">正在加载...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 text-red-500">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm">{error}</p>
              </div>
            ) : player ? (
              <div className="w-full p-4 space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">玩家名称</span>
                  <span className="text-sm font-mono font-medium">{player.name || "未知"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">玩家 ID</span>
                  <span className="text-sm font-mono font-medium">{player.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">等级</span>
                  <span className="text-sm font-mono text-green-600 font-bold">LV.{player.level || 0}</span>
                </div>
                <pre className="mt-4 p-3 bg-gray-900 text-gray-400 text-[10px] rounded-lg overflow-auto max-h-32">
                  {JSON.stringify(player, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-gray-400">暂无数据</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: <Zap className="w-5 h-5" />, title: "异步请求", desc: "使用 async/await" },
            { icon: <Layout className="w-5 h-5" />, title: "状态管理", desc: "useState 跟踪状态" },
            { icon: <Code className="w-5 h-5" />, title: "类型安全", desc: "TypeScript 接口定义" },
          ].map((feature, i) => (
            <div 
              key={i}
              className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-all group cursor-default"
            >
              <div className="p-2 w-fit bg-gray-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-3">
                {feature.icon}
              </div>
              <h3 className="font-medium text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <p className="mt-4 text-sm text-gray-400">
            查看控制台或上方代码，了解 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">fetch()</code> 的实现。
          </p>
        </div>
      </motion.div>

      <footer className="mt-12 mb-8 text-sm text-gray-400">
        Built with Google AI Studio
      </footer>
    </div>
  );
}

