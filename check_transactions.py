#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def check_transactions():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Get recent guest transactions
    guest_transactions = await db.payment_transactions.find({'user_id': 'guest'}).sort('created_at', -1).limit(3).to_list(3)
    
    print('Recent Guest Transactions:')
    for i, txn in enumerate(guest_transactions, 1):
        print(f'{i}. Session: {txn.get("session_id", "N/A")}')
        print(f'   User ID: {txn.get("user_id", "N/A")}')
        print(f'   Is Guest: {txn.get("is_guest", "N/A")}')
        print(f'   Email: {txn.get("user_email", "N/A")}')
        print(f'   Amount: ${txn.get("amount", 0):.2f}')
        if txn.get('coupon'):
            print(f'   Coupon: {txn["coupon"]["code"]} (${txn["coupon"]["discount_amount"]:.2f} off)')
        print()
    
    # Get recent authenticated transactions
    auth_transactions = await db.payment_transactions.find({'user_id': {'$ne': 'guest'}}).sort('created_at', -1).limit(2).to_list(2)
    
    print('Recent Authenticated Transactions:')
    for i, txn in enumerate(auth_transactions, 1):
        print(f'{i}. Session: {txn.get("session_id", "N/A")}')
        print(f'   User ID: {txn.get("user_id", "N/A")}')
        print(f'   Is Guest: {txn.get("is_guest", "N/A")}')
        print(f'   Email: {txn.get("user_email", "N/A")}')
        print(f'   Amount: ${txn.get("amount", 0):.2f}')
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_transactions())