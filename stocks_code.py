import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

# Load CSV file
dataset_train = pd.read_csv("Google_Stock_Price_Train.csv")

# Remove rows where Close is not numeric
dataset_train = dataset_train[pd.to_numeric(dataset_train["Close"], errors="coerce").notnull()]

# Convert Close column to float
dataset_train["Close"] = dataset_train["Close"].astype(float)

print("shape is = {}".format(dataset_train.shape))
print(dataset_train.head())

# Take only Close values
training_set = dataset_train["Close"].to_numpy()

print("shape is = {}".format(training_set.shape))
print(training_set[:5])

# Plot
plt.figure(figsize=(10, 5))
plt.plot(training_set, color="red", label="Google Stock Price")
plt.title("Google Stock Price Visualization")
plt.xlabel("Time")
plt.ylabel("Stock Price")
plt.legend()
plt.show()