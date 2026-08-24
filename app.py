from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import os
from sklearn.linear_model import LinearRegression
import yfinance as yf


app = Flask(__name__)


# =========================================================
# COMPANIES
# =========================================================

COMPANIES = {
    "GOOGL": "Google",
    "AAPL": "Apple",
    "MSFT": "Microsoft",
    "AMZN": "Amazon"
}


# =========================================================
# HOME / CREATE ACCOUNT PAGE
# =========================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/dashboard")
def dashboard():

    stock = request.args.get(
        "stock",
        "GOOGL"
    )

    if stock not in COMPANIES:

        stock = "GOOGL"

    file_path = os.path.join(
        "data",
        f"{stock}.csv"
    )

    if not os.path.exists(file_path):

        return f"""
        <h2>CSV file not found</h2>
        <p>Expected file:</p>
        <p>{file_path}</p>
        """

    try:

        # =================================================
        # READ CSV
        # =================================================

        dataset = pd.read_csv(
            file_path
        )

        if dataset.empty:

            return "CSV file is empty."


        # =================================================
        # DATE COLUMN
        # =================================================

        dataset.rename(
            columns={
                dataset.columns[0]: "Date"
            },
            inplace=True
        )


        # =================================================
        # CLOSE COLUMN
        # =================================================

        if "Close" not in dataset.columns:

            return """
            <h2>Close column not found in CSV.</h2>
            <p>Your CSV must contain a column named Close.</p>
            """


        dataset["Close"] = pd.to_numeric(
            dataset["Close"],
            errors="coerce"
        )


        dataset = dataset.dropna(
            subset=["Close"]
        )


        if len(dataset) < 2:

            return "CSV does not contain enough stock price data."


        # =================================================
        # LINEAR REGRESSION
        # =================================================

        X = np.arange(
            len(dataset)
        ).reshape(-1, 1)

        y = dataset["Close"].values

        model = LinearRegression()

        model.fit(
            X,
            y
        )


        # =================================================
        # FUTURE PREDICTION
        # =================================================

        future_days = 5

        future_X = np.arange(
            len(dataset),
            len(dataset) + future_days
        ).reshape(-1, 1)

        future_predictions = model.predict(
            future_X
        )

        future_predictions = [
            round(float(price), 2)
            for price in future_predictions
        ]


        # =================================================
        # GRAPH DATA
        # =================================================

        graph_data = dataset.tail(
            30
        )

        labels = graph_data[
            "Date"
        ].astype(str).tolist()

        prices = graph_data[
            "Close"
        ].astype(float).tolist()


        # =================================================
        # CURRENT PRICE
        # =================================================

        current_price = round(
            float(
                dataset["Close"].iloc[-1]
            ),
            2
        )


        # =================================================
        # PREVIOUS CLOSE
        # =================================================

        previous_close = round(
            float(
                dataset["Close"].iloc[-2]
            ),
            2
        )


        # =================================================
        # CHANGE %
        # =================================================

        if previous_close != 0:

            change_percent = round(
                (
                    (
                        current_price -
                        previous_close
                    )
                    / previous_close
                ) * 100,
                2
            )

        else:

            change_percent = 0


        # =================================================
        # TREND BADGE
        # =================================================
        #
        # We compare:
        #
        # Previous 5 trading days average
        #
        #          VS
        #
        # Recent 5 trading days average
        #
        # =================================================

        recent_prices = dataset[
            "Close"
        ].tail(20)


        if len(recent_prices) >= 10:

            # ---------------------------------------------
            # RECENT 5-DAY AVERAGE
            # ---------------------------------------------

            recent_average = recent_prices.tail(
                5
            ).mean()


            # ---------------------------------------------
            # PREVIOUS 5-DAY AVERAGE
            # ---------------------------------------------

            previous_average = recent_prices.iloc[
                -10:-5
            ].mean()


            # ---------------------------------------------
            # CALCULATE TREND CHANGE
            # ---------------------------------------------

            if previous_average != 0:

                trend_change = (
                    (
                        recent_average -
                        previous_average
                    )
                    / previous_average
                ) * 100

            else:

                trend_change = 0


            # ---------------------------------------------
            # TREND DECISION
            # ---------------------------------------------

            # More than +1%
            # = Bullish

            if trend_change > 2:

                trend = "Bullish"


            # Less than -1%
            # = Bearish

            elif trend_change < -2:

                trend = "Bearish"


            # Between -1% and +1%
            # = Stable

            else:

                trend = "Stable"


        else:

            trend = "Stable"
            trend_change = 0


        # =================================================
        # CALCULATE TREND WIDTH FOR THE RANGE BAR
        # =================================================

        if trend == "Bullish":
            trend_width = 75
        elif trend == "Bearish":
            trend_width = 25
        else:
            trend_width = 50


        # =================================================
        # WEEK HIGH / WEEK LOW
        # =================================================
        #
        # Last 7 trading days
        #
        # Week High = highest closing price
        # Week Low  = lowest closing price
        #
        # =================================================

        week_data = dataset.tail(
            7
        )


        week_high = round(
            float(
                week_data["Close"].max()
            ),
            2
        )


        week_low = round(
            float(
                week_data["Close"].min()
            ),
            2
        )


        # =================================================
        # SEND DATA TO DASHBOARD
        # =================================================

        return render_template(

            "dashboard.html",

            labels=labels,

            prices=prices,

            current_price=current_price,

            previous_close=previous_close,

            change_percent=change_percent,

            selected_stock=stock,

            company_name=COMPANIES[stock],

            companies=COMPANIES,

            future_predictions=future_predictions,


            # =================================================
            # TREND DATA
            # =================================================

            trend=trend,

            trend_change=round(
                trend_change,
                2
            ),

            trend_width=trend_width,  # <-- ADDED THIS LINE


            # =================================================
            # WEEK HIGH / WEEK LOW
            # =================================================

            week_high=week_high,

            week_low=week_low

        )


    except Exception as e:

        return f"""
        <h2>Error while loading stock data</h2>
        <p>{str(e)}</p>
        """


# =========================================================
# LINEAR REGRESSION PREDICTION
# =========================================================

@app.route("/predict")
def predict():

    stock = request.args.get(
        "stock",
        "GOOGL"
    )


    days = request.args.get(
        "days",
        "7"
    )


    if stock not in COMPANIES:

        stock = "GOOGL"


    try:

        days = int(
            days
        )

    except ValueError:

        days = 7


    if days < 1:

        days = 1


    if days > 365:

        days = 365


    file_path = os.path.join(
        "data",
        f"{stock}.csv"
    )


    if not os.path.exists(
        file_path
    ):

        return jsonify({

            "error":
                "CSV file not found"

        })


    try:

        dataset = pd.read_csv(
            file_path
        )


        if dataset.empty:

            return jsonify({

                "error":
                    "CSV file is empty"

            })


        dataset.rename(

            columns={
                dataset.columns[0]: "Date"
            },

            inplace=True

        )


        if "Close" not in dataset.columns:

            return jsonify({

                "error":
                    "Close column not found"

            })


        dataset["Close"] = pd.to_numeric(

            dataset["Close"],

            errors="coerce"

        )


        dataset = dataset.dropna(

            subset=["Close"]

        )


        if len(dataset) < 2:

            return jsonify({

                "error":
                    "Not enough stock price data"

            })


        # =================================================
        # LINEAR REGRESSION
        # =================================================

        X = np.arange(

            len(dataset)

        ).reshape(-1, 1)


        y = dataset["Close"].values


        model = LinearRegression()


        model.fit(

            X,

            y

        )


        # =================================================
        # FUTURE PREDICTION
        # =================================================

        future_X = np.arange(

            len(dataset),

            len(dataset) + days

        ).reshape(-1, 1)


        predictions = model.predict(

            future_X

        )


        predictions = [

            round(float(price), 2)

            for price in predictions

        ]


        # =================================================
        # RETURN PREDICTION
        # =================================================

        return jsonify({

            "stock":
                stock,

            "company":
                COMPANIES[stock],

            "algorithm":
                "Linear Regression",

            "prediction_days":
                days,

            "predictions":
                predictions,

            "predicted_price":
                predictions[-1]

        })


    except Exception as e:

        return jsonify({

            "error":
                str(e)

        })


# =========================================================
# LIVE STOCK DATA
# =========================================================

@app.route("/live-stock")
def live_stock():

    stock = request.args.get(

        "stock",

        "GOOGL"

    )


    # =====================================================
    # CHECK STOCK
    # =====================================================

    if stock not in COMPANIES:

        stock = "GOOGL"


    try:

        # =================================================
        # GET 1-MINUTE MARKET DATA
        # =================================================

        data = yf.download(

            tickers=stock,

            period="1d",

            interval="1m",

            progress=False,

            auto_adjust=False

        )


        # =================================================
        # CHECK DATA
        # =================================================

        if data is None or data.empty:

            return jsonify({

                "error":
                    "Live market data is currently unavailable."

            })


        # =================================================
        # GET CLOSE COLUMN
        # =================================================

        close_data = data["Close"]


        # Sometimes yfinance returns a DataFrame
        # instead of a Series.

        if isinstance(

            close_data,

            pd.DataFrame

        ):

            close_data = close_data.iloc[

                :,

                0

            ]


        # =================================================
        # REMOVE MISSING VALUES
        # =================================================

        close_data = close_data.dropna()


        if close_data.empty:

            return jsonify({

                "error":
                    "No live price data available."

            })


        # =================================================
        # GET LAST PRICES
        # =================================================

        latest_price = float(

            close_data.iloc[-1]

        )


        if len(close_data) >= 2:

            previous_price = float(

                close_data.iloc[-2]

            )

        else:

            previous_price = latest_price


        # =================================================
        # PRICE CHANGE
        # =================================================

        change = (

            latest_price -
            previous_price

        )


        if previous_price != 0:

            change_percent = (

                change /
                previous_price

            ) * 100

        else:

            change_percent = 0


        # =================================================
        # GRAPH DATA
        # =================================================

        # Last 60 one-minute points

        recent_data = close_data.tail(

            60

        )


        live_labels = []

        live_prices = []


        for timestamp, price in recent_data.items():

            live_labels.append(

                timestamp.strftime(

                    "%H:%M"

                )

            )


            live_prices.append(

                round(

                    float(price),

                    2

                )

            )


        # =================================================
        # RETURN DATA
        # =================================================

        return jsonify({

            "stock":
                stock,

            "company":
                COMPANIES[stock],

            "price":
                round(

                    latest_price,

                    2

                ),

            "previous_price":
                round(

                    previous_price,

                    2

                ),

            "change":
                round(

                    change,

                    2

                ),

            "change_percent":
                round(

                    change_percent,

                    2

                ),

            "labels":
                live_labels,

            "prices":
                live_prices

        })


    except Exception as e:

        print(

            "Live stock error:",

            str(e)

        )


        return jsonify({

            "error":
                "Unable to retrieve live stock data."

        })


# =========================================================
# RUN FLASK
# =========================================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )