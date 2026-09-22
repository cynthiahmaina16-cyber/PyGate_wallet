# SecureVault-CLI

A simple, terminal-based banking simulation script written in Python. It demonstrates basic implementation concepts for user authentication, state management, loops, and conditional transaction processing.

## Features

* **Two-Tier Authentication:** Validates both username and administrative security credentials.
* **Brute-Force Protection:** Automatically locks out the terminal session after 3 consecutive failed password attempts.
* **Smart Wallet Ledger:** Handles live mathematical validation for withdrawals, preventing account overdrafts if funds are insufficient.

##  How it Works

1. **User Check:** The system verifies if the entered username matches the `"admin"` profile.
2. **Password Loop:** A `while` loop tracking variable states controls authorization attempts. 
3. **Ledger Check:** If authorized, it passes inputs into a simple logical evaluation (`withdrawal_amount > account_balance`) to execute or deny simulated financial transactions.

##  Code Structure Breakdown

* `attempts`: Tracks user tries dynamically.
* `access_granted`: Flag boolean controlling access to the withdrawal logic block.
* `account_balance`: Fixed local dataset acting as the wallet baseline.

##  Prerequisites & Execution

You only need Python 3.x installed to run this script.

```bash
python secure_vault.py
```

