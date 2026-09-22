User_name = input("Enter username: ")

if User_name == "admin":
    print("Welcome, Administrator!\n")
    
    attempts = 0
    access_granted = False
    
    while attempts < 3:
        correct_password = input("Enter Password: ")
        
        if correct_password == "Collins2013.":
            print(" Access Granted!\n")
            access_granted = True
            break  
        else:
            attempts += 1  
            remaining_tries = 3 - attempts
            print(f" Wrong password! Tries remaining: {remaining_tries}\n")
            
    if access_granted:
        account_balance = 5000
        print(f"Current Wallet Balance: KSh {account_balance}")
        withdrawal_amount = int(input("Enter amount to withdraw: "))
        
        if withdrawal_amount > account_balance:
            print(" TRANSACTION DENIED: Insufficient funds!")
        else:
            remaining_balance = account_balance - withdrawal_amount
            print("Transaction successful!")
            print(f"Remaining Balance: KSh {remaining_balance}")
    else:
        print("ACCOUNT LOCKED: Too many failed password attempts.")

else:
    print(" Access denied. Unknown user profile. Financial access blocked.")
