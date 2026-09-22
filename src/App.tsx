import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Code2, 
  Volume2, 
  VolumeX, 
  Layout, 
  CreditCard, 
  History, 
  HelpCircle,
  Key,
  Info
} from 'lucide-react';
import { AtmPortal } from './components/AtmPortal';
import { PythonTerminal } from './components/PythonTerminal';
import { CodeViewer } from './components/CodeViewer';
import { TransactionHistory } from './components/TransactionHistory';
import { Transaction, ActivePythonLine } from './types';
import { setSoundEnabled, isSoundEnabled, playKeyClick } from './utils/audio';

export default function App() {
  const [balance, setBalance] = useState<number>(5000);
  const [activePythonLine, setActivePythonLine] = useState<ActivePythonLine>(1);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'split' | 'atm' | 'terminal'>('split');
  const [rightPanelTab, setRightPanelTab] = useState<'terminal' | 'code'>('terminal');

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'init-1',
      type: 'deposit',
      amount: 5000,
      balanceBefore: 0,
      balanceAfter: 5000,
      status: 'success',
      message: 'Initial account balance allocated.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
  ]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playKeyClick();
  };

  const handleTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleClearLedger = () => {
    playKeyClick();
    setTransactions([]);
  };

  return (
    <div id="main-app-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Application Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight">Secure Wallet Portal</h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Python 3 Script Logic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administrator Authentication &amp; KSh Financial Access Gateway
              </p>
            </div>
          </div>

          {/* Credentials quick reminder badges */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center space-x-1.5">
              <span className="text-slate-500">Username:</span>
              <span className="text-emerald-400 font-semibold">&quot;admin&quot;</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center space-x-1.5">
              <Key className="w-3 h-3 text-amber-400" />
              <span className="text-slate-500">Password:</span>
              <span className="text-amber-300 font-semibold">&quot;Collins2013.&quot;</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center space-x-1.5">
              <span className="text-slate-500">Starting Balance:</span>
              <span className="text-white font-semibold">KSh 5,000</span>
            </div>
          </div>

          {/* Controls: Audio & View Selector */}
          <div className="flex items-center space-x-2">
            <button
              id="sound-toggle-btn"
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={soundOn ? 'Mute terminal audio' : 'Enable audio feedback'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Layout View Modes */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                id="view-mode-split-btn"
                onClick={() => {
                  playKeyClick();
                  setViewMode('split');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  viewMode === 'split' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split View: ATM and Python Terminal"
              >
                <Layout className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                id="view-mode-atm-btn"
                onClick={() => {
                  playKeyClick();
                  setViewMode('atm');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  viewMode === 'atm' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ATM Banking Portal only"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ATM UI</span>
              </button>

              <button
                id="view-mode-terminal-btn"
                onClick={() => {
                  playKeyClick();
                  setViewMode('terminal');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  viewMode === 'terminal' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive Python Terminal only"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terminal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6">
        {/* Quick Credentials Info Banner on Mobile */}
        <div className="lg:hidden p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1 text-slate-300">
            <span className="text-slate-500">User:</span>
            <span className="text-emerald-400 font-bold">&quot;admin&quot;</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <span className="text-slate-500">Pass:</span>
            <span className="text-amber-300 font-bold">&quot;Collins2013.&quot;</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <span className="text-slate-500">Balance:</span>
            <span className="text-white font-bold">KSh 5,000</span>
          </div>
        </div>

        {/* Dynamic Columns based on viewMode */}
        <div
          className={`grid gap-6 items-start ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto w-full'
          }`}
        >
          {/* ATM Portal Column */}
          {(viewMode === 'split' || viewMode === 'atm') && (
            <div className={`space-y-6 ${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-6' : 'w-full'}`}>
              <AtmPortal
                balance={balance}
                onBalanceChange={setBalance}
                onTransaction={handleTransaction}
                onActiveLineChange={setActivePythonLine}
              />

              {/* Transactions Ledger */}
              <TransactionHistory transactions={transactions} onClear={handleClearLedger} />
            </div>
          )}

          {/* Right Column: Terminal & Python Inspector */}
          {(viewMode === 'split' || viewMode === 'terminal') && (
            <div className={`space-y-4 ${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-6' : 'w-full'}`}>
              {/* Tab Selector: Interactive CLI vs Source Code Viewer */}
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
                <div className="flex items-center space-x-1">
                  <button
                    id="tab-terminal-btn"
                    onClick={() => {
                      playKeyClick();
                      setRightPanelTab('terminal');
                    }}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rightPanelTab === 'terminal'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>Interactive Terminal</span>
                  </button>

                  <button
                    id="tab-code-btn"
                    onClick={() => {
                      playKeyClick();
                      setRightPanelTab('code');
                    }}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rightPanelTab === 'code'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Python Code &amp; Tracer</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Line {activePythonLine}</span>
                </div>
              </div>

              {/* Panel content */}
              <div className="h-[520px]">
                {rightPanelTab === 'terminal' ? (
                  <PythonTerminal
                    sharedBalance={balance}
                    onWithdrawalComplete={(amt, newBal, success) => {
                      setBalance(newBal);
                      handleTransaction({
                        type: 'withdrawal',
                        amount: amt,
                        balanceBefore: balance,
                        balanceAfter: newBal,
                        status: success ? 'success' : 'denied',
                        message: success
                          ? `✅ Transaction successful! Remaining: KSh ${newBal.toLocaleString()}`
                          : '❌ TRANSACTION DENIED: Insufficient funds!',
                      });
                    }}
                    onStateSync={(state) => {
                      setActivePythonLine(state.activeLine);
                    }}
                    onResetRequested={() => {
                      setBalance(5000);
                    }}
                  />
                ) : (
                  <CodeViewer activeLine={activePythonLine} />
                )}
              </div>

              {/* Logic guide card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-slate-200">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Script Logic Rules Tested</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>User check:</strong> Requires &quot;admin&quot; or displays unknown user access denial.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>Attempts loop:</strong> Maximum 3 tries for password &quot;Collins2013.&quot;</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span><strong>Lockout:</strong> Account locked alert triggers after 3 consecutive failures.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span><strong>Wallet balance:</strong> Initialized to KSh 5,000 with funds validation check.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        Secure Wallet Portal • Kenyan Shilling (KSh) Financial Authentication System
      </footer>
    </div>
  );
}
