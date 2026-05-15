import React from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";

type AuthGateProps = {
  authLoading: boolean;
  children: React.ReactNode;
};

export function AuthGate({ authLoading, children }: AuthGateProps) {
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">正在校验登录状态...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function LoginPrompt({ isDark, onLogin }: { isDark: boolean; onLogin: () => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className={`max-w-md w-full ${isDark ? "bg-[#16191F] border-white/10" : "bg-white border-slate-200"} border rounded-[40px] p-10 text-center`}>
        <div className="w-16 h-16 mx-auto mb-8 rounded-3xl bg-indigo-600 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className={`text-3xl font-black tracking-tighter mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
          登录后开始创建角色
        </h1>
        <p className="text-sm leading-7 text-slate-500 font-medium mb-8">
          使用 Google 登录后，你的角色卡和对话会只保存在自己的账号下。
        </p>
        <button
          onClick={onLogin}
          className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-[0.98]"
        >
          <LogIn className="w-5 h-5" />
          使用 Google 登录
        </button>
      </div>
    </div>
  );
}
