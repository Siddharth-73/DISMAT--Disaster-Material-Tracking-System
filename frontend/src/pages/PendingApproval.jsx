import GlassCard from "../components/ui/GlassCard";

export default function PendingApproval() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0f172a] relative overflow-hidden">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
       </div>

      <GlassCard className="p-8 max-w-md w-full text-center relative z-10">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-pulse">
          ⏳
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">
          Approval Pending
        </h2>
        <p className="text-slate-400 leading-relaxed mb-6">
          Your account request has been successfully sent to the SuperAdmin for review.
          <br/><br/>
          You will receive an email notification once your access is approved.
        </p>
        <div className="text-sm font-bold text-slate-500 bg-white/5 rounded-lg py-3 border border-white/5">
           Request ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
        <div className="mt-8 pt-6 border-t border-white/5">
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Back to Login</a>
        </div>
      </GlassCard>
    </div>
  );
}
