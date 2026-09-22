
while True:
    # 1. Display the choices to the user
    print("\n--- Simple Calculator ---")
    print("Select an operation:")
    print("1. Sum (+)")
    print("2. Subtract (-)")
    print("3. Multiply (*)")
    print("4. Divide (/)")

    choice = input("Enter choice (1, 2, 3, or 4): ")


    if choice in ['1', '2', '3', '4']:
        
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))

        if choice == '1':
            result = num1 + num2
            print(f"Result: {num1} + {num2} = {result}")

        elif choice == '2':
            result = num1 - num2
            print(f"Result: {num1} - {num2} = {result}")

        elif choice == '3':
            result = num1 * num2
            print(f"Result: {num1} * {num2} = {result}")

        elif choice == '4':
            if num2 == 0:
                print("Error: You cannot divide by zero!")
            else:
                result = num1 / num2
                print(f"Result: {num1} / {num2} = {result}")
    else:
        print("Invalid choice. Please pick a number from 1 to 4.")

   
    repeat = input("\nDo you want to do another calculation? (y/n): ").lower()
    if repeat != 'y':
        print("Goodbye!")
        break 
