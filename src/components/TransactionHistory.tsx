import React from 'react';
import { Transaction } from '../types';
import { ArrowDownRight, ArrowUpRight, AlertCircle, CheckCircle2, History } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onClear?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onClear }) => {
  if (transactions.length === 0) {
    return (
      <div id="empty-transactions-container" className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-400">No transactions recorded yet</p>
        <p className="text-xs text-slate-600 mt-1">Withdrawals will appear here in real time.</p>
      </div>
    );
  }

  return (
    <div id="transaction-history-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Transaction Ledger ({transactions.length})
          </h3>
        </div>
        {onClear && (
          <button
            id="clear-ledger-btn"
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear Ledger
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
        {transactions.map((tx) => {
          const isSuccess = tx.status === 'success';
          return (
            <div key={tx.id} className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-0.5 p-2 rounded-lg ${
                    isSuccess ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                  }`}
                >
                  {isSuccess ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">
                      {tx.type === 'withdrawal' ? 'Cash Withdrawal' : 'Wallet Reset / Deposit'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSuccess ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {isSuccess ? 'SUCCESS' : 'DENIED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{tx.message}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{tx.timestamp}</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className={`text-xs font-bold ${isSuccess ? 'text-slate-100' : 'text-rose-400 line-through'}`}>
                  {tx.type === 'withdrawal' ? '-' : '+'} KSh {tx.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Balance: KSh {tx.balanceAfter.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
