import yfinance as yf
import os

# Create data folder if it doesn't exist
os.makedirs("data", exist_ok=True)

# List of companies
stocks = ["GOOGL", "AAPL", "MSFT", "AMZN"]

for stock in stocks:
    print(f"Downloading {stock} data...")

    df = yf.download(stock, start="2020-01-01", end="2025-12-31")

    # Save each company data
    df.to_csv(f"data/{stock}.csv")

print("✅ All company stock data downloaded successfully!")