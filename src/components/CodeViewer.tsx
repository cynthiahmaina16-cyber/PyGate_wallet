import React from 'react';
import { Code2, Copy, Check } from 'lucide-react';
import { ActivePythonLine } from '../types';

interface CodeViewerProps {
  activeLine?: ActivePythonLine | null;
}

const PYTHON_CODE_LINES: { lineNum: number; code: string; isBranch?: boolean }[] = [
  { lineNum: 1, code: 'User_name = input("Enter username: ")' },
  { lineNum: 2, code: '' },
  { lineNum: 3, code: 'if User_name == "admin":' },
  { lineNum: 4, code: '    print("Welcome, Administrator!\\n")' },
  { lineNum: 5, code: '    ' },
  { lineNum: 6, code: '    attempts = 0' },
  { lineNum: 7, code: '    access_granted = False' },
  { lineNum: 8, code: '    ' },
  { lineNum: 9, code: '    while attempts < 3:' },
  { lineNum: 10, code: '        correct_password = input("Enter Password: ")' },
  { lineNum: 11, code: '        ' },
  { lineNum: 12, code: '        if correct_password == "Collins2013.":' },
  { lineNum: 13, code: '            print("🔓 Access Granted!\\n")' },
  { lineNum: 14, code: '            access_granted = True' },
  { lineNum: 15, code: '            break  ' },
  { lineNum: 16, code: '        else:' },
  { lineNum: 17, code: '            attempts += 1  ' },
  { lineNum: 18, code: '            remaining_tries = 3 - attempts' },
  { lineNum: 19, code: '            print(f"❌ Wrong password! Tries remaining: {remaining_tries}\\n")' },
  { lineNum: 20, code: '            ' },
  { lineNum: 21, code: '    if access_granted:' },
  { lineNum: 22, code: '        account_balance = 5000' },
  { lineNum: 23, code: '        print(f"Current Wallet Balance: KSh {account_balance}")' },
  { lineNum: 24, code: '        withdrawal_amount = int(input("Enter amount to withdraw: "))' },
  { lineNum: 25, code: '        ' },
  { lineNum: 26, code: '        if withdrawal_amount > account_balance:' },
  { lineNum: 27, code: '            print("❌ TRANSACTION DENIED: Insufficient funds!")' },
  { lineNum: 28, code: '        else:' },
  { lineNum: 29, code: '            remaining_balance = account_balance - withdrawal_amount' },
  { lineNum: 30, code: '            print("✅ Transaction successful!")' },
  { lineNum: 31, code: '            print(f"Remaining Balance: KSh {remaining_balance}")' },
  { lineNum: 32, code: '    else:' },
  { lineNum: 33, code: '        print("🚨 ACCOUNT LOCKED: Too many failed password attempts.")' },
  { lineNum: 34, code: '' },
  { lineNum: 35, code: 'else:' },
  { lineNum: 36, code: '    print("❌ Access denied. Unknown user profile. Financial access blocked.")' },
];

export const CodeViewer: React.FC<CodeViewerProps> = ({ activeLine }) => {
  const [copied, setCopied] = React.useState(false);

  const fullCode = PYTHON_CODE_LINES.map(l => l.code).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="python-code-viewer-container" className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-medium text-slate-200">wallet_security.py</span>
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">Python 3</span>
        </div>
        <button
          id="copy-python-code-btn"
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded transition-colors"
          title="Copy python source code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed select-text">
        <div className="table w-full">
          {PYTHON_CODE_LINES.map(({ lineNum, code }) => {
            // Check if this line is active or in the neighborhood of the active execution
            const isActive = activeLine !== null && activeLine !== undefined && (
              lineNum === activeLine || 
              (activeLine === 1 && lineNum === 1) ||
              (activeLine === 3 && (lineNum === 3 || lineNum === 4)) ||
              (activeLine === 10 && (lineNum === 9 || lineNum === 10)) ||
              (activeLine === 13 && (lineNum === 12 || lineNum === 13 || lineNum === 14)) ||
              (activeLine === 20 && (lineNum === 17 || lineNum === 18 || lineNum === 19)) ||
              (activeLine === 25 && (lineNum === 23 || lineNum === 24)) ||
              (activeLine === 28 && (lineNum === 26 || lineNum === 27)) ||
              (activeLine === 31 && (lineNum === 28 || lineNum === 29 || lineNum === 30 || lineNum === 31)) ||
              (activeLine === 34 && (lineNum === 32 || lineNum === 33)) ||
              (activeLine === 37 && (lineNum === 35 || lineNum === 36))
            );

            return (
              <div 
                key={lineNum} 
                className={`table-row transition-colors ${
                  isActive 
                    ? 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-400' 
                    : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <span className="table-cell pr-4 select-none text-right text-slate-600 w-8 text-[11px]">
                  {lineNum}
                </span>
                <span className="table-cell whitespace-pre font-mono">
                  {formatSyntax(code)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Interpreter Sync Active
        </span>
        <span className="text-slate-500">KSh Currency Engine</span>
      </div>
    </div>
  );
};

// Simple syntax colorizer for the Python snippet
function formatSyntax(code: string): React.ReactNode {
  if (!code) return '\u00A0';

  // Highlight comments or strings
  const parts: React.ReactNode[] = [];
  let remaining = code;

  // Keywords
  const keywords = ['if', 'else', 'while', 'break', 'input', 'print', 'int', 'False', 'True'];
  
  // Custom tokens highlight
  const regex = /(".*?"|f".*?"|\b(?:if|else|while|break|input|print|int|False|True)\b|\b\d+\b|==|>|-|\+|\+=)/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      parts.push(code.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('"') || token.startsWith('f"')) {
      parts.push(<span key={match.index} className="text-amber-300">{token}</span>);
    } else if (keywords.includes(token)) {
      parts.push(<span key={match.index} className="text-purple-400 font-semibold">{token}</span>);
    } else if (!isNaN(Number(token))) {
      parts.push(<span key={match.index} className="text-sky-300">{token}</span>);
    } else {
      parts.push(<span key={match.index} className="text-cyan-400">{token}</span>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    parts.push(code.substring(lastIndex));
  }

  return parts;
}
