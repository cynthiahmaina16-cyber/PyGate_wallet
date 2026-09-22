export type AuthState = 
  | 'ENTER_USERNAME'
  | 'ENTER_PASSWORD'
  | 'ACCESS_GRANTED'
  | 'ACCOUNT_LOCKED'
  | 'UNKNOWN_USER';

export interface Transaction {
  id: string;
  type: 'withdrawal' | 'deposit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'success' | 'denied';
  message: string;
  timestamp: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'prompt' | 'output' | 'error' | 'success' | 'banner';
  text: string;
}

export type ActivePythonLine = 
  | 1 // User_name = input("Enter username: ")
  | 3 // if User_name == "admin":
  | 4 // print("Welcome, Administrator!\n")
  | 6 // attempts = 0
  | 10 // while attempts < 3:
  | 11 // correct_password = input("Enter Password: ")
  | 13 // if correct_password == "Collins2013.":
  | 14 // print("🔓 Access Granted!\n")
  | 18 // attempts += 1
  | 20 // print(f"❌ Wrong password!...")
  | 22 // if access_granted:
  | 23 // account_balance = 5000
  | 25 // withdrawal_amount = int(input(...))
  | 27 // if withdrawal_amount > account_balance:
  | 28 // print("❌ TRANSACTION DENIED...")
  | 31 // print("✅ Transaction successful!...")
  | 34 // print("🚨 ACCOUNT LOCKED...")
  | 37; // print("❌ Access denied. Unknown user profile...")
