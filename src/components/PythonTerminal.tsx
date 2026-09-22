import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, RotateCcw, Play, CornerDownLeft } from 'lucide-react';
import { TerminalLine, ActivePythonLine } from '../types';
import { playKeyClick, playSuccessChime, playErrorBuzzer } from '../utils/audio';

interface PythonTerminalProps {
  onStateSync?: (state: {
    username: string;
    attempts: number;
    balance: number;
    activeLine: ActivePythonLine;
    status: 'idle' | 'password_prompt' | 'granted' | 'locked' | 'unknown_user';
  }) => void;
  sharedBalance: number;
  onWithdrawalComplete?: (amount: number, newBalance: number, success: boolean) => void;
  onResetRequested?: () => void;
}

type ScriptStep = 'INPUT_USERNAME' | 'INPUT_PASSWORD' | 'INPUT_WITHDRAWAL' | 'TERMINATED';

export const PythonTerminal: React.FC<PythonTerminalProps> = ({
  onStateSync,
  sharedBalance,
  onWithdrawalComplete,
  onResetRequested,
}) => {
  const [step, setStep] = useState<ScriptStep>('INPUT_USERNAME');
  const [username, setUsername] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [balance, setBalance] = useState<number>(sharedBalance || 5000);
  const [inputValue, setInputValue] = useState<string>('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'banner', text: 'Python 3.11.4 (default) [GCC 11.2.0] on linux' },
    { id: '2', type: 'banner', text: 'Type "help", "copyright", "credits" or "license" for more information.' },
    { id: '3', type: 'banner', text: '$ python3 secure_wallet.py' },
    { id: '4', type: 'prompt', text: 'Enter username: ' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local balance in sync if sharedBalance changes from outside
  useEffect(() => {
    if (sharedBalance !== undefined && step === 'INPUT_WITHDRAWAL') {
      setBalance(sharedBalance);
    }
  }, [sharedBalance, step]);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleReset = () => {
    playKeyClick();
    setStep('INPUT_USERNAME');
    setUsername('');
    setAttempts(0);
    setBalance(5000);
    setInputValue('');
    setLines([
      { id: Date.now() + '-1', type: 'banner', text: '$ python3 secure_wallet.py (Session restart)' },
      { id: Date.now() + '-2', type: 'prompt', text: 'Enter username: ' },
    ]);
    if (onStateSync) {
      onStateSync({
        username: '',
        attempts: 0,
        balance: 5000,
        activeLine: 1,
        status: 'idle',
      });
    }
    if (onResetRequested) {
      onResetRequested();
    }
    setTimeout(focusInput, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'TERMINATED') return;

    playKeyClick();
    const val = inputValue.trim();
    setInputValue('');

    const newLines = [...lines];

    if (step === 'INPUT_USERNAME') {
      newLines.push({ id: Date.now() + '-input', type: 'input', text: val });
      setUsername(val);

      if (val === 'admin') {
        newLines.push({ id: Date.now() + '-out1', type: 'output', text: 'Welcome, Administrator!\n' });
        newLines.push({ id: Date.now() + '-out2', type: 'prompt', text: 'Enter Password: ' });
        setStep('INPUT_PASSWORD');
        setAttempts(0);
        if (onStateSync) {
          onStateSync({
            username: val,
            attempts: 0,
            balance,
            activeLine: 11,
            status: 'password_prompt',
          });
        }
      } else {
        newLines.push({
          id: Date.now() + '-err',
          type: 'error',
          text: '❌ Access denied. Unknown user profile. Financial access blocked.',
        });
        setStep('TERMINATED');
        playErrorBuzzer();
        if (onStateSync) {
          onStateSync({
            username: val,
            attempts: 0,
            balance,
            activeLine: 37,
            status: 'unknown_user',
          });
        }
      }
    } else if (step === 'INPUT_PASSWORD') {
      // Mask password display in the terminal line
      newLines.push({ id: Date.now() + '-input', type: 'input', text: '••••••••••••' });

      if (val === 'Collins2013.') {
        playSuccessChime();
        newLines.push({ id: Date.now() + '-out1', type: 'success', text: '🔓 Access Granted!\n' });
        newLines.push({ id: Date.now() + '-out2', type: 'output', text: `Current Wallet Balance: KSh ${balance}` });
        newLines.push({ id: Date.now() + '-out3', type: 'prompt', text: 'Enter amount to withdraw: ' });
        setStep('INPUT_WITHDRAWAL');
        if (onStateSync) {
          onStateSync({
            username,
            attempts,
            balance,
            activeLine: 25,
            status: 'granted',
          });
        }
      } else {
        playErrorBuzzer();
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        const remainingTries = 3 - nextAttempts;

        newLines.push({
          id: Date.now() + '-err',
          type: 'error',
          text: `❌ Wrong password! Tries remaining: ${remainingTries}\n`,
        });

        if (nextAttempts >= 3) {
          newLines.push({
            id: Date.now() + '-locked',
            type: 'error',
            text: '🚨 ACCOUNT LOCKED: Too many failed password attempts.',
          });
          setStep('TERMINATED');
          if (onStateSync) {
            onStateSync({
              username,
              attempts: 3,
              balance,
              activeLine: 34,
              status: 'locked',
            });
          }
        } else {
          newLines.push({ id: Date.now() + '-prompt', type: 'prompt', text: 'Enter Password: ' });
          if (onStateSync) {
            onStateSync({
              username,
              attempts: nextAttempts,
              balance,
              activeLine: 11,
              status: 'password_prompt',
            });
          }
        }
      }
    } else if (step === 'INPUT_WITHDRAWAL') {
      newLines.push({ id: Date.now() + '-input', type: 'input', text: val });
      const withdrawalAmount = parseInt(val, 10);

      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        newLines.push({
          id: Date.now() + '-err',
          type: 'error',
          text: '❌ Invalid numerical input for withdrawal.',
        });
        newLines.push({ id: Date.now() + '-prompt', type: 'prompt', text: 'Enter amount to withdraw: ' });
      } else if (withdrawalAmount > balance) {
        playErrorBuzzer();
        newLines.push({
          id: Date.now() + '-err',
          type: 'error',
          text: '❌ TRANSACTION DENIED: Insufficient funds!',
        });
        if (onWithdrawalComplete) {
          onWithdrawalComplete(withdrawalAmount, balance, false);
        }
        if (onStateSync) {
          onStateSync({
            username,
            attempts,
            balance,
            activeLine: 28,
            status: 'granted',
          });
        }
        newLines.push({ id: Date.now() + '-prompt', type: 'prompt', text: 'Enter amount to withdraw (or restart): ' });
      } else {
        playSuccessChime();
        const remainingBalance = balance - withdrawalAmount;
        setBalance(remainingBalance);
        newLines.push({ id: Date.now() + '-success', type: 'success', text: '✅ Transaction successful!' });
        newLines.push({ id: Date.now() + '-bal', type: 'output', text: `Remaining Balance: KSh ${remainingBalance}` });

        if (onWithdrawalComplete) {
          onWithdrawalComplete(withdrawalAmount, remainingBalance, true);
        }
        if (onStateSync) {
          onStateSync({
            username,
            attempts,
            balance: remainingBalance,
            activeLine: 31,
            status: 'granted',
          });
        }
        newLines.push({ id: Date.now() + '-prompt', type: 'prompt', text: 'Enter another amount to withdraw: ' });
      }
    }

    setLines(newLines);
  };

  // Scenario Quick Runners
  const runScenario = (type: 'valid' | 'wrong_user' | 'lockout' | 'overdraw') => {
    handleReset();
    setTimeout(() => {
      if (type === 'valid') {
        setLines([
          { id: '1', type: 'banner', text: '$ python3 secure_wallet.py' },
          { id: '2', type: 'prompt', text: 'Enter username: ' },
          { id: '3', type: 'input', text: 'admin' },
          { id: '4', type: 'output', text: 'Welcome, Administrator!\n' },
          { id: '5', type: 'prompt', text: 'Enter Password: ' },
          { id: '6', type: 'input', text: '••••••••••••' },
          { id: '7', type: 'success', text: '🔓 Access Granted!\n' },
          { id: '8', type: 'output', text: 'Current Wallet Balance: KSh 5000' },
          { id: '9', type: 'prompt', text: 'Enter amount to withdraw: ' },
          { id: '10', type: 'input', text: '2000' },
          { id: '11', type: 'success', text: '✅ Transaction successful!' },
          { id: '12', type: 'output', text: 'Remaining Balance: KSh 3000' },
        ]);
        setUsername('admin');
        setAttempts(0);
        setBalance(3000);
        setStep('INPUT_WITHDRAWAL');
        playSuccessChime();
        if (onStateSync) {
          onStateSync({ username: 'admin', attempts: 0, balance: 3000, activeLine: 31, status: 'granted' });
        }
        if (onWithdrawalComplete) {
          onWithdrawalComplete(2000, 3000, true);
        }
      } else if (type === 'wrong_user') {
        setLines([
          { id: '1', type: 'banner', text: '$ python3 secure_wallet.py' },
          { id: '2', type: 'prompt', text: 'Enter username: ' },
          { id: '3', type: 'input', text: 'guest_user' },
          { id: '4', type: 'error', text: '❌ Access denied. Unknown user profile. Financial access blocked.' },
        ]);
        setUsername('guest_user');
        setStep('TERMINATED');
        playErrorBuzzer();
        if (onStateSync) {
          onStateSync({ username: 'guest_user', attempts: 0, balance: 5000, activeLine: 37, status: 'unknown_user' });
        }
      } else if (type === 'lockout') {
        setLines([
          { id: '1', type: 'banner', text: '$ python3 secure_wallet.py' },
          { id: '2', type: 'prompt', text: 'Enter username: ' },
          { id: '3', type: 'input', text: 'admin' },
          { id: '4', type: 'output', text: 'Welcome, Administrator!\n' },
          { id: '5', type: 'prompt', text: 'Enter Password: ' },
          { id: '6', type: 'input', text: '••••' },
          { id: '7', type: 'error', text: '❌ Wrong password! Tries remaining: 2\n' },
          { id: '8', type: 'prompt', text: 'Enter Password: ' },
          { id: '9', type: 'input', text: '••••' },
          { id: '10', type: 'error', text: '❌ Wrong password! Tries remaining: 1\n' },
          { id: '11', type: 'prompt', text: 'Enter Password: ' },
          { id: '12', type: 'input', text: '••••' },
          { id: '13', type: 'error', text: '❌ Wrong password! Tries remaining: 0\n' },
          { id: '14', type: 'error', text: '🚨 ACCOUNT LOCKED: Too many failed password attempts.' },
        ]);
        setUsername('admin');
        setAttempts(3);
        setStep('TERMINATED');
        playErrorBuzzer();
        if (onStateSync) {
          onStateSync({ username: 'admin', attempts: 3, balance: 5000, activeLine: 34, status: 'locked' });
        }
      } else if (type === 'overdraw') {
        setLines([
          { id: '1', type: 'banner', text: '$ python3 secure_wallet.py' },
          { id: '2', type: 'prompt', text: 'Enter username: ' },
          { id: '3', type: 'input', text: 'admin' },
          { id: '4', type: 'output', text: 'Welcome, Administrator!\n' },
          { id: '5', type: 'prompt', text: 'Enter Password: ' },
          { id: '6', type: 'input', text: '••••••••••••' },
          { id: '7', type: 'success', text: '🔓 Access Granted!\n' },
          { id: '8', type: 'output', text: 'Current Wallet Balance: KSh 5000' },
          { id: '9', type: 'prompt', text: 'Enter amount to withdraw: ' },
          { id: '10', type: 'input', text: '7500' },
          { id: '11', type: 'error', text: '❌ TRANSACTION DENIED: Insufficient funds!' },
        ]);
        setUsername('admin');
        setAttempts(0);
        setBalance(5000);
        setStep('INPUT_WITHDRAWAL');
        playErrorBuzzer();
        if (onStateSync) {
          onStateSync({ username: 'admin', attempts: 0, balance: 5000, activeLine: 28, status: 'granted' });
        }
        if (onWithdrawalComplete) {
          onWithdrawalComplete(7500, 5000, false);
        }
      }
    }, 150);
  };

  const getPlaceholder = () => {
    switch (step) {
      case 'INPUT_USERNAME':
        return 'Type "admin" and press Enter...';
      case 'INPUT_PASSWORD':
        return 'Type "Collins2013." and press Enter...';
      case 'INPUT_WITHDRAWAL':
        return 'Enter amount in KSh (e.g., 1000)...';
      case 'TERMINATED':
        return 'Session ended. Click Restart to run again.';
    }
  };

  return (
    <div id="python-terminal-container" className="flex flex-col h-full bg-black/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-100 font-mono text-xs">
      {/* Top terminal bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/60"></div>
          </div>
          <div className="h-4 w-[1px] bg-zinc-700 mx-1"></div>
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-300 font-semibold tracking-wide">bash - python3 secure_wallet.py</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="terminal-restart-btn"
            onClick={handleReset}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Restart script execution"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Restart Script</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div 
        id="terminal-body" 
        onClick={focusInput}
        className="flex-1 p-4 overflow-y-auto space-y-1.5 cursor-text bg-zinc-950 font-mono text-[13px] leading-relaxed select-text"
      >
        {lines.map((line) => {
          if (line.type === 'banner') {
            return (
              <div key={line.id} className="text-zinc-500 text-xs">
                {line.text}
              </div>
            );
          }
          if (line.type === 'prompt') {
            return (
              <div key={line.id} className="text-emerald-400 font-bold inline">
                {line.text}
              </div>
            );
          }
          if (line.type === 'input') {
            return (
              <div key={line.id} className="text-cyan-300 font-semibold mb-1">
                &gt; {line.text}
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 font-medium py-0.5">
                {line.text}
              </div>
            );
          }
          if (line.type === 'success') {
            return (
              <div key={line.id} className="text-emerald-400 font-semibold py-0.5">
                {line.text}
              </div>
            );
          }
          return (
            <div key={line.id} className="text-zinc-200 py-0.5">
              {line.text}
            </div>
          );
        })}

        {/* Current Active Input Line */}
        {step !== 'TERMINATED' && (
          <form onSubmit={handleSubmit} className="flex items-center space-x-1.5 pt-1">
            <span className="text-emerald-400 font-bold select-none">&gt;&gt;</span>
            <input
              id="terminal-cli-input"
              ref={inputRef}
              type={step === 'INPUT_PASSWORD' ? 'password' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholder()}
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-emerald-300 placeholder:text-zinc-600 font-mono text-[13px] caret-emerald-400"
            />
            <button
              id="terminal-enter-submit-btn"
              type="submit"
              className="text-zinc-500 hover:text-emerald-400 px-1.5 py-0.5 transition-colors"
              title="Execute line"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {step === 'TERMINATED' && (
          <div className="pt-2 text-zinc-500 italic text-xs flex items-center gap-2">
            <span>[Process finished with exit code 0]</span>
            <button
              id="terminal-rerun-inline-btn"
              onClick={handleReset}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold not-italic"
            >
              <Play className="w-3 h-3" /> Run again
            </button>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Preset Scenario Quick-Bar */}
      <div className="px-4 py-2.5 bg-zinc-900/90 border-t border-zinc-800 text-[11px] flex flex-wrap items-center gap-2">
        <span className="text-zinc-400 font-sans font-medium">Quick Test Scenarios:</span>
        <button
          id="scenario-valid-btn"
          onClick={() => runScenario('valid')}
          className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
        >
          ✓ Admin Login & Withdraw
        </button>
        <button
          id="scenario-lockout-btn"
          onClick={() => runScenario('lockout')}
          className="px-2 py-1 rounded bg-amber-950/60 border border-amber-700/50 text-amber-300 hover:bg-amber-900/60 transition-colors"
        >
          ⚠️ 3 Wrong Passwords (Lock)
        </button>
        <button
          id="scenario-overdraw-btn"
          onClick={() => runScenario('overdraw')}
          className="px-2 py-1 rounded bg-rose-950/60 border border-rose-700/50 text-rose-300 hover:bg-rose-900/60 transition-colors"
        >
          ✕ Insufficient Funds (Overdraw)
        </button>
        <button
          id="scenario-wrong-user-btn"
          onClick={() => runScenario('wrong_user')}
          className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          ✕ Unknown Profile Block
        </button>
      </div>
    </div>
  );
};
