import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  User, 
  Eye, 
  EyeOff, 
  Wallet, 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard,
  Building2,
  DollarSign
} from 'lucide-react';
import { AuthState, Transaction, ActivePythonLine } from '../types';
import { playKeyClick, playSuccessChime, playErrorBuzzer } from '../utils/audio';

interface AtmPortalProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onActiveLineChange?: (line: ActivePythonLine) => void;
}

export const AtmPortal: React.FC<AtmPortalProps> = ({
  balance,
  onBalanceChange,
  onTransaction,
  onActiveLineChange,
}) => {
  const [authState, setAuthState] = useState<AuthState>('ENTER_USERNAME');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Withdrawal state
  const [withdrawalInput, setWithdrawalInput] = useState<string>('');
  const [withdrawalNotice, setWithdrawalNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetAll = () => {
    playKeyClick();
    setAuthState('ENTER_USERNAME');
    setUsernameInput('');
    setPasswordInput('');
    setAttempts(0);
    setFeedbackMessage(null);
    setWithdrawalNotice(null);
    setWithdrawalInput('');
    onBalanceChange(5000);
    if (onActiveLineChange) onActiveLineChange(1);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playKeyClick();
    const cleanUser = usernameInput.trim();

    if (onActiveLineChange) onActiveLineChange(3);

    if (cleanUser === 'admin') {
      setAuthState('ENTER_PASSWORD');
      setFeedbackMessage({
        type: 'info',
        text: 'Welcome, Administrator!',
      });
      if (onActiveLineChange) onActiveLineChange(11);
    } else {
      playErrorBuzzer();
      setAuthState('UNKNOWN_USER');
      setFeedbackMessage({
        type: 'error',
        text: '❌ Access denied. Unknown user profile. Financial access blocked.',
      });
      if (onActiveLineChange) onActiveLineChange(37);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playKeyClick();

    if (onActiveLineChange) onActiveLineChange(13);

    if (passwordInput === 'Collins2013.') {
      playSuccessChime();
      setAuthState('ACCESS_GRANTED');
      setFeedbackMessage({
        type: 'success',
        text: '🔓 Access Granted!',
      });
      if (onActiveLineChange) onActiveLineChange(23);
    } else {
      playErrorBuzzer();
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      const remaining = 3 - nextAttempts;

      if (onActiveLineChange) onActiveLineChange(20);

      if (nextAttempts >= 3) {
        setAuthState('ACCOUNT_LOCKED');
        setFeedbackMessage({
          type: 'error',
          text: '🚨 ACCOUNT LOCKED: Too many failed password attempts.',
        });
        if (onActiveLineChange) onActiveLineChange(34);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: `❌ Wrong password! Tries remaining: ${remaining}`,
        });
      }
    }
  };

  const handleWithdrawal = (amountToWithdraw?: number) => {
    playKeyClick();
    const amount = amountToWithdraw !== undefined ? amountToWithdraw : parseInt(withdrawalInput, 10);

    if (isNaN(amount) || amount <= 0) {
      setWithdrawalNotice({
        type: 'error',
        text: '❌ Please enter a valid numerical withdrawal amount.',
      });
      return;
    }

    if (onActiveLineChange) onActiveLineChange(27);

    if (amount > balance) {
      playErrorBuzzer();
      const msg = '❌ TRANSACTION DENIED: Insufficient funds!';
      setWithdrawalNotice({
        type: 'error',
        text: msg,
      });
      onTransaction({
        type: 'withdrawal',
        amount,
        balanceBefore: balance,
        balanceAfter: balance,
        status: 'denied',
        message: msg,
      });
      if (onActiveLineChange) onActiveLineChange(28);
    } else {
      playSuccessChime();
      const newBal = balance - amount;
      onBalanceChange(newBal);
      const msg = `✅ Transaction successful! Remaining Balance: KSh ${newBal.toLocaleString()}`;
      setWithdrawalNotice({
        type: 'success',
        text: msg,
      });
      onTransaction({
        type: 'withdrawal',
        amount,
        balanceBefore: balance,
        balanceAfter: newBal,
        status: 'success',
        message: msg,
      });
      setWithdrawalInput('');
      if (onActiveLineChange) onActiveLineChange(31);
    }
  };

  const handleDepositReset = () => {
    playSuccessChime();
    const prev = balance;
    onBalanceChange(5000);
    onTransaction({
      type: 'deposit',
      amount: 5000 - prev,
      balanceBefore: prev,
      balanceAfter: 5000,
      status: 'success',
      message: 'Wallet balance re-initialized to standard KSh 5,000.',
    });
    setWithdrawalNotice({
      type: 'success',
      text: 'Wallet reloaded to KSh 5,000.',
    });
  };

  return (
    <div id="atm-portal-card" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* ATM Top Branding Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-white">Central Security Wallet</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                AES-256
              </span>
            </div>
            <p className="text-xs text-slate-400">Financial Authorization Terminal (KES / KSh)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="reset-atm-session-btn"
            onClick={resetAll}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-slate-700/60"
            title="Reset Terminal Session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Flow</span>
          </button>
        </div>
      </div>

      {/* Main Content Stage */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {/* STEP 1: USERNAME INPUT */}
        {authState === 'ENTER_USERNAME' && (
          <div id="auth-username-step" className="max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-300">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Sign In to Wallet</h2>
              <p className="text-xs text-slate-400">Enter your assigned username to initiate the authorization sequence.</p>
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label htmlFor="username-input-field" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enter username:
                </label>
                <div className="relative">
                  <input
                    id="username-input-field"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter username (e.g. admin)"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playKeyClick();
                      setUsernameInput('admin');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                  >
                    Use admin
                  </button>
                </div>
              </div>

              <button
                id="submit-username-btn"
                type="submit"
                disabled={!usernameInput.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">Python Logic:</span>
              <span>
                Executes line 3 (<code className="text-emerald-300">if User_name == &quot;admin&quot;</code>). Any other username triggers an immediate security block.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: PASSWORD INPUT */}
        {authState === 'ENTER_PASSWORD' && (
          <div id="auth-password-step" className="max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Welcome, Administrator!</h2>
              <p className="text-xs text-slate-400">Enter your administrator access password to unlock wallet balance.</p>
            </div>

            {/* Attempts Pill */}
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">Security Counter:</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {3 - attempts} tries remaining
                </span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx < attempts ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {feedbackMessage && feedbackMessage.type === 'error' && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-input-field" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Enter Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playKeyClick();
                      setPasswordInput('Collins2013.');
                    }}
                    className="text-[11px] font-mono text-emerald-400 hover:underline"
                  >
                    Autofill &quot;Collins2013.&quot;
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password-input-field"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter Password..."
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    playKeyClick();
                    setAuthState('ENTER_USERNAME');
                    setPasswordInput('');
                    setAttempts(0);
                    setFeedbackMessage(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  id="submit-password-btn"
                  type="submit"
                  disabled={!passwordInput}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Authenticate</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: UNKNOWN USER ERROR SCREEN */}
        {authState === 'UNKNOWN_USER' && (
          <div id="auth-unknown-user-screen" className="max-w-md mx-auto w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-600 mx-auto flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-rose-400">Access Denied</h2>
              <div className="p-4 bg-slate-950 border border-rose-900/60 rounded-xl font-mono text-xs text-rose-300 leading-relaxed">
                ❌ Access denied. Unknown user profile. Financial access blocked.
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Only authenticated administrator profiles (<code className="text-emerald-300">admin</code>) are authorized to connect to the financial wallet.
            </p>

            <button
              id="try-again-username-btn"
              onClick={() => {
                playKeyClick();
                setAuthState('ENTER_USERNAME');
                setUsernameInput('admin');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Retry with &quot;admin&quot;</span>
            </button>
          </div>
        )}

        {/* STEP 4: ACCOUNT LOCKED ERROR SCREEN */}
        {authState === 'ACCOUNT_LOCKED' && (
          <div id="auth-account-locked-screen" className="max-w-md mx-auto w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-600 mx-auto flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-rose-400">Account Locked</h2>
              <div className="p-4 bg-slate-950 border border-rose-900/60 rounded-xl font-mono text-xs text-rose-300 leading-relaxed">
                🚨 ACCOUNT LOCKED: Too many failed password attempts.
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Security policy exceeded 3 invalid attempts. Financial transaction gateway has ceased operations.
            </p>

            <button
              id="unlock-reset-account-btn"
              onClick={resetAll}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset &amp; Unlock Account</span>
            </button>
          </div>
        )}

        {/* STEP 5: ACCESS GRANTED / WALLET DASHBOARD */}
        {authState === 'ACCESS_GRANTED' && (
          <div id="wallet-dashboard-step" className="space-y-6">
            {/* Success Access Banner */}
            <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xl">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-300">🔓 Access Granted! Administrator Session Active</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">auth=Collins2013.</span>
            </div>

            {/* Main Balance Display Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400 text-xs">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold uppercase tracking-wider">Current Wallet Balance</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  KES / KSh
                </span>
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-emerald-400 font-mono">KSh</span>
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  {balance.toLocaleString()}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Account ID: ADM-2013-KENYA</span>
                <button
                  id="quick-reload-balance-btn"
                  onClick={handleDepositReset}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to KSh 5,000
                </button>
              </div>
            </div>

            {/* Withdrawal Action Container */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Withdrawal Terminal
                </h3>
                <span className="text-[11px] text-slate-500">
                  Python: <code className="text-slate-400">withdrawal_amount = int(input())</code>
                </span>
              </div>

              {withdrawalNotice && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
                    withdrawalNotice.type === 'success'
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-300'
                  }`}
                >
                  {withdrawalNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{withdrawalNotice.text}</span>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-2">Quick Withdrawal Amounts:</label>
                <div className="grid grid-cols-5 gap-2">
                  {[500, 1000, 2500, 5000, 6000].map((amt) => {
                    const isOverdraw = amt > balance;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleWithdrawal(amt)}
                        className={`py-2 px-2 text-center rounded-lg border font-mono text-xs transition-all ${
                          isOverdraw
                            ? 'bg-rose-950/30 border-rose-900/40 text-rose-300 hover:bg-rose-900/40'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-emerald-500/50'
                        }`}
                        title={isOverdraw ? 'Tests insufficient funds condition (> balance)' : `Withdraw KSh ${amt}`}
                      >
                        <div className="font-bold">{amt.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400">{isOverdraw ? 'Overdraw' : 'KSh'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleWithdrawal();
                }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label htmlFor="custom-withdrawal-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter amount to withdraw:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                      KSh
                    </span>
                    <input
                      id="custom-withdrawal-input"
                      type="number"
                      min="1"
                      step="1"
                      value={withdrawalInput}
                      onChange={(e) => setWithdrawalInput(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-13 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    id="submit-withdrawal-btn"
                    type="submit"
                    disabled={!withdrawalInput}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Process Withdrawal</span>
                  </button>
                  <button
                    id="sign-out-btn"
                    type="button"
                    onClick={resetAll}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Lock Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
