// =====================================================
// STOCKPREDICT - MAIN JAVASCRIPT
// =====================================================


// =====================================================
// DARK MODE
// =====================================================

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            themeToggle.textContent = "☀️";
        } else {
            themeToggle.textContent = "🌙";
        }

    });

}


// =====================================================
// CREATE ACCOUNT
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const emailInput =
            document.getElementById("email");

        const confirmEmailInput =
            document.getElementById("confirmEmail");

        const passwordInput =
            document.getElementById("password");

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";

        const confirmEmail =
            confirmEmailInput
                ? confirmEmailInput.value.trim()
                : "";

        const password =
            passwordInput
                ? passwordInput.value
                : "";


        if (email === "") {

            alert("Please enter your email.");

            return;
        }


        if (confirmEmail === "") {

            alert("Please re-enter your email.");

            return;
        }


        if (email !== confirmEmail) {

            alert("Emails do not match!");

            return;
        }


        if (password.length < 6) {

            alert(
                "Password must be at least 6 characters!"
            );

            return;
        }


        // =================================================
        // SUCCESS POPUP
        // =================================================

        const overlay =
            document.createElement("div");

        overlay.className =
            "success-overlay";


        const popup =
            document.createElement("div");

        popup.className =
            "success-popup";


        popup.innerHTML = `

            <div class="success-icon">
                ✓
            </div>

            <div class="success-message">

                <strong>
                    Account created!
                </strong>

                <span>
                    Let's explore the market.
                </span>

            </div>

        `;


        overlay.appendChild(popup);

        document.body.appendChild(overlay);


        setTimeout(function () {

            popup.classList.add("show");

        }, 50);


        setTimeout(function () {

            window.location.href =
                "/dashboard";

        }, 3000);

    });

}


// =====================================================
// GOOGLE REGISTER
// =====================================================

function googleRegister() {

    alert(
        "Google registration is not connected yet."
    );

}


// =====================================================
// HISTORICAL STOCK GRAPH
// =====================================================

const stockDataElement =
    document.getElementById("stock-data");


if (stockDataElement) {

    try {

        const stockData =
            JSON.parse(
                stockDataElement.textContent
            );


        const labels =
            stockData.labels || [];


        const prices =
            stockData.prices || [];


        const canvas =
            document.getElementById("stockChart");


        if (!canvas) {

            console.error(
                "stockChart canvas not found."
            );

        }

        else if (
            typeof Chart === "undefined"
        ) {

            console.error(
                "Chart.js is not loaded."
            );

        }

        else {

            const ctx =
                canvas.getContext("2d");


            new Chart(
                ctx,
                {

                    type: "line",

                    data: {

                        labels: labels,

                        datasets: [

                            {

                                label:
                                    "Stock Price",

                                data:
                                    prices,

                                borderColor:
                                    "#2563eb",

                                backgroundColor:
                                    "rgba(37, 99, 235, 0.15)",

                                borderWidth:
                                    3,

                                tension:
                                    0.4,

                                fill:
                                    true,

                                pointRadius:
                                    3,

                                pointHoverRadius:
                                    6

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {

                                display:
                                    true,

                                position:
                                    "top"

                            },

                            tooltip: {

                                callbacks: {

                                    label:
                                        function (context) {

                                            return (
                                                "$" +
                                                Number(
                                                    context.parsed.y
                                                ).toFixed(2)
                                            );

                                        }

                                }

                            }

                        },

                        scales: {

                            y: {

                                beginAtZero:
                                    false

                            }

                        }

                    }

                }

            );

        }

    }

    catch (error) {

        console.error(
            "Error loading stock chart:",
            error
        );

    }

}


// =====================================================
// MOVING LIVE STOCK GRAPH
// =====================================================

let movingLiveChart = null;

let movingLiveTimer = null;


async function startMovingLiveGraph() {

    const canvas =
        document.getElementById(
            "liveStockChart"
        );


    const customStockSelect =
    document.getElementById(
        "customStockSelect"
    );


    const livePrice =
        document.getElementById(
            "livePrice"
        );


    const liveStatus =
        document.getElementById(
            "liveStatus"
        );


    if (!canvas || !customStockSelect) {
    return;
}

    // Stop previous timer

    if (movingLiveTimer) {

        clearInterval(
            movingLiveTimer
        );

        movingLiveTimer = null;

    }


   const stock =
    customStockSelect.dataset.stock;


    try {

        const response =
            await fetch(
                `/live-stock?stock=${encodeURIComponent(stock)}`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load CSV data."
            );

        }


        const data =
            await response.json();


        if (data.error) {

            if (livePrice) {

                livePrice.textContent =
                    "--";

            }


            if (liveStatus) {

                liveStatus.textContent =
                    data.error;

            }

            return;

        }


        const labels =
            data.labels || [];


        const prices =
            data.prices || [];


        if (prices.length < 2) {

            if (liveStatus) {

                liveStatus.textContent =
                    "Not enough stock data.";

            }

            return;

        }


        // Destroy old chart

        if (movingLiveChart) {

            movingLiveChart.destroy();

            movingLiveChart =
                null;

        }


        let currentIndex = 0;


        const displayedLabels = [];

        const displayedPrices = [];


        const ctx =
            canvas.getContext("2d");


        movingLiveChart =
            new Chart(
                ctx,
                {

                    type: "line",

                    data: {

                        labels:
                            displayedLabels,

                        datasets: [

                            {

                                label:
                                    "Live Stock Price",

                                data:
                                    displayedPrices,

                                borderColor:
                                    "#16a34a",

                                backgroundColor:
                                    "rgba(22, 163, 74, 0.08)",

                                borderWidth:
                                    3,

                                tension:
                                    0.25,

                                fill:
                                    true,

                                pointRadius:
                                    4,

                                pointHoverRadius:
                                    7

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        animation: {

                            duration:
                                500

                        },

                        plugins: {

                            legend: {

                                display:
                                    true,

                                position:
                                    "top"

                            },

                            tooltip: {

                                callbacks: {

                                    label:
                                        function (context) {

                                            return (
                                                "$" +
                                                Number(
                                                    context.parsed.y
                                                ).toFixed(2)
                                            );

                                        }

                                }

                            }

                        },

                        scales: {

                            y: {

                                beginAtZero:
                                    false

                            }

                        }

                    }

                }

            );


        // =================================================
        // MOVE GRAPH EVERY SECOND
        // =================================================

        movingLiveTimer =
            setInterval(function () {

                if (!movingLiveChart) {

                    return;

                }


                // Restart CSV

                if (
                    currentIndex >=
                    prices.length
                ) {

                    currentIndex = 0;

                    displayedLabels.length =
                        0;

                    displayedPrices.length =
                        0;


                    movingLiveChart.data.labels =
                        displayedLabels;


                    movingLiveChart.data.datasets[0].data =
                        displayedPrices;


                    movingLiveChart.update();


                    if (liveStatus) {

                        liveStatus.textContent =
                            "CSV data replaying...";

                    }

                }


                const currentPrice =
                    Number(
                        prices[currentIndex]
                    );


                let previousPrice =
                    currentPrice;


                if (currentIndex > 0) {

                    previousPrice =
                        Number(
                            prices[
                                currentIndex - 1
                            ]
                        );

                }


                displayedLabels.push(
                    labels[currentIndex]
                );


                displayedPrices.push(
                    currentPrice
                );


                // Keep last 20 points

                if (
                    displayedLabels.length > 20
                ) {

                    displayedLabels.shift();

                    displayedPrices.shift();

                }


                // Price increasing

                if (
                    currentPrice >=
                    previousPrice
                ) {

                    movingLiveChart
                        .data
                        .datasets[0]
                        .borderColor =
                        "#16a34a";


                    movingLiveChart
                        .data
                        .datasets[0]
                        .backgroundColor =
                        "rgba(22, 163, 74, 0.08)";


                    if (liveStatus) {

                        liveStatus.textContent =
                            "● Price increasing ↑";

                    }

                }

                // Price decreasing

                else {

                    movingLiveChart
                        .data
                        .datasets[0]
                        .borderColor =
                        "#dc2626";


                    movingLiveChart
                        .data
                        .datasets[0]
                        .backgroundColor =
                        "rgba(220, 38, 38, 0.08)";


                    if (liveStatus) {

                        liveStatus.textContent =
                            "● Price decreasing ↓";

                    }

                }


                 // Update live price

                // if (livePrice) {

                //     livePrice.textContent =
                //         "$" +
                //         currentPrice.toFixed(2);

                // }

                if (livePrice) {

    livePrice.textContent =
        "$" +
        currentPrice.toFixed(2);

    // Restart price animation
    livePrice.classList.remove(
        "live-price-change"
    );

    void livePrice.offsetWidth;

    livePrice.classList.add(
        "live-price-change"
    );
}





                movingLiveChart.update();


                currentIndex++;


            }, 1000);

    }

    catch (error) {

        console.error(
            "Moving graph error:",
            error
        );


        if (livePrice) {

            livePrice.textContent =
                "--";

        }


        if (liveStatus) {

            liveStatus.textContent =
                "Unable to load stock data";

        }

    }

}


// Start moving graph

if (
    document.getElementById(
        "liveStockChart"
    )
) {

    startMovingLiveGraph();

}


// =====================================================
// LINEAR REGRESSION PREDICTION + POPUP
// =====================================================

const predictionForm = document.getElementById("predictionForm");

// ---------- SHOW POPUP ----------
function showPredictionPopup(price, days) {

    const stockSelect = document.getElementById("stockSelect");

    const stockName =
        stockSelect.options[stockSelect.selectedIndex].text;

    document.getElementById("popupStock").textContent = stockName;
    document.getElementById("popupPrice").textContent = "$" + price;
    document.getElementById("popupMessage").textContent =
        "Predicted for " + days + " day(s)";

    const overlay = document.getElementById("predictionPopup");
    const popup = document.getElementById("predictionPopupContent");

    overlay.style.display = "flex";

    setTimeout(() => {
        popup.classList.add("show");
    }, 10);
}

// ---------- CLOSE POPUP ----------
function closePredictionPopup() {

    const overlay = document.getElementById("predictionPopup");
    const popup = document.getElementById("predictionPopupContent");

    popup.classList.remove("show");

    setTimeout(() => {
        overlay.style.display = "none";
    }, 300);
}

// Click outside to close
document.addEventListener("click", function (e) {

    const overlay = document.getElementById("predictionPopup");

    if (e.target === overlay) {
        closePredictionPopup();
    }

});

// ---------- PREDICT PRICE ----------
if (predictionForm) {

    predictionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const stock =
                document.getElementById("stockSelect").value;

            const days =
                document.getElementById("days").value;

            try {

                const response =
                    await fetch(
                        `/predict?stock=${encodeURIComponent(stock)}&days=${encodeURIComponent(days)}`
                    );

                const data = await response.json();

                if (data.error) {
                    alert(data.error);
                    return;
                }

                // Show popup
                showPredictionPopup(
                    data.predicted_price,
                    data.prediction_days
                );

            }

            catch (error) {

                console.error("Prediction error:", error);

                alert("Unable to calculate prediction.");

            }

        }
    );

}


// =====================================================
// CHANGE STOCK
// =====================================================

function changeStock() {

    const stockSelect =
        document.getElementById(
            "stockSelect"
        );


    if (!stockSelect) {

        return;

    }


    const stock =
        stockSelect.value;


    window.location.href =
        "/dashboard?stock=" +
        encodeURIComponent(stock);

}


// =====================================================
// STOCKPREDICT CHATBOT
// =====================================================


// =====================================================
// CREATE CHATBOT HTML AUTOMATICALLY
// =====================================================

function createChatbot() {

    // If chatbot already exists, don't create again

    if (
        document.getElementById(
            "chatbotButton"
        )
    ) {

        return;

    }


    const chatbotHTML = `

        <!-- CHATBOT BUTTON -->

        <button
            id="chatbotButton"
            class="chatbot-button"
            type="button"
            aria-label="Open StockPredict Assistant"
        >

            <span class="chatbot-icon">
                💬
            </span>

        </button>


        <!-- CHATBOT WINDOW -->

        <div
            id="chatbotWindow"
            class="chatbot-window"
        >

            <!-- HEADER -->

            <div class="chatbot-header">

                <div class="chatbot-title">

                    <strong>
                        Ask StockPredict
                    </strong>

                    <span class="chatbot-badge">
                        built-in
                    </span>

                </div>


                <button
                    id="chatbotClose"
                    class="chatbot-close"
                    type="button"
                    aria-label="Close chatbot"
                >
                    −
                </button>

            </div>


            <!-- CHAT CONTENT -->

            <div
                id="chatbotMessages"
                class="chatbot-messages"
            >

                <!-- WELCOME MESSAGE -->

                <div class="bot-message">

                    <div class="message-icon">
                        ✨
                    </div>

                    <div class="message-content">

                        <p>
                            Hi! I'm StockPredict Assistant.
                            I can help you understand stock prices,
                            historical data, live data and predictions.
                        </p>

                    </div>

                </div>


                <!-- QUICK QUESTIONS -->

                <div
                    id="chatbotQuestions"
                    class="chatbot-questions"
                >

                    <button
                        class="chat-question"
                        type="button"
                        data-question="What's happening with this stock?"
                    >
                        What's happening with this stock?
                    </button>


                    <button
                        class="chat-question"
                        type="button"
                        data-question="What could the future price look like?"
                    >
                        What could the future price look like?
                    </button>


                    <button
                        class="chat-question"
                        type="button"
                        data-question="How does StockPredict make predictions?"
                    >
                        How does StockPredict make predictions?
                    </button>


                    <button
                        class="chat-question"
                        type="button"
                        data-question="Want to explore the stock history?"
                    >
                        Want to explore the stock history?
                    </button>


                    <button
                        class="chat-question"
                        type="button"
                        data-question="What can I do here?"
                    >
                        What can I do here?
                    </button>

                </div>

            </div>


            <!-- INPUT AREA -->

            <div class="chatbot-input-area">

                <input
                    id="chatbotInput"
                    type="text"
                    placeholder="Ask a question"
                    autocomplete="off"
                />


                <button
                    id="chatbotSend"
                    type="button"
                    aria-label="Send message"
                >
                    ➜
                </button>

            </div>


            <!-- DISCLAIMER -->

            <div class="chatbot-disclaimer">

                By chatting, you agree to this
                <span>disclaimer.</span>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        chatbotHTML
    );

}


// Create chatbot after page loads

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        createChatbot
    );

}

else {

    createChatbot();

}


// =====================================================
// CHATBOT ELEMENTS
// =====================================================

let chatbotButton =
    document.getElementById(
        "chatbotButton"
    );


let chatbotWindow =
    document.getElementById(
        "chatbotWindow"
    );


let chatbotClose =
    document.getElementById(
        "chatbotClose"
    );


let chatbotInput =
    document.getElementById(
        "chatbotInput"
    );


let chatbotSend =
    document.getElementById(
        "chatbotSend"
    );


let chatbotMessages =
    document.getElementById(
        "chatbotMessages"
    );


let chatbotQuestions =
    document.getElementById(
        "chatbotQuestions"
    );


// =====================================================
// IMPORTANT
// Re-check elements after createChatbot()
// =====================================================

setTimeout(function () {

    chatbotButton =
        document.getElementById(
            "chatbotButton"
        );


    chatbotWindow =
        document.getElementById(
            "chatbotWindow"
        );


    chatbotClose =
        document.getElementById(
            "chatbotClose"
        );


    chatbotInput =
        document.getElementById(
            "chatbotInput"
        );


    chatbotSend =
        document.getElementById(
            "chatbotSend"
        );


    chatbotMessages =
        document.getElementById(
            "chatbotMessages"
        );


    chatbotQuestions =
        document.getElementById(
            "chatbotQuestions"
        );


    initializeChatbot();

}, 100);


// =====================================================
// CHATBOT ANSWERS
// =====================================================

const chatbotAnswers = {

    "What's happening with this stock?":

        "📈 The Live Stock Price section shows the selected stock moving through the available CSV market data.",


    "What could the future price look like?":

        "🔮 Go to the Machine Learning Prediction section, enter the number of days, and click Predict Price to get a Linear Regression prediction.",


    "How does StockPredict make predictions?":

        "🤖 StockPredict uses historical stock price data and Linear Regression to estimate a future stock price.",


    "Want to explore the stock history?":

        "📊 The Historical Stock Price graph lets you explore the previous price movement of the selected company.",


    "What can I do here?":

        "💡 You can explore live stock prices, historical trends, different companies, and future price predictions."

};


// =====================================================
// SCROLL CHAT
// =====================================================

function scrollChatToBottom() {

    if (chatbotMessages) {

        chatbotMessages.scrollTop =
            chatbotMessages.scrollHeight;

    }

}


// =====================================================
// ADD USER MESSAGE
// =====================================================

function addUserMessage(message) {

    if (!chatbotMessages) {

        return;

    }


    const messageDiv =
        document.createElement("div");


    messageDiv.className =
        "user-message";


    messageDiv.innerHTML = `

        <div class="message-content">

            <p></p>

        </div>

    `;


    messageDiv
        .querySelector("p")
        .textContent = message;


    chatbotMessages.appendChild(
        messageDiv
    );


    scrollChatToBottom();

}


// =====================================================
// ADD BOT MESSAGE
// =====================================================

function addBotMessage(message) {

    if (!chatbotMessages) {

        return;

    }


    const messageDiv =
        document.createElement("div");


    messageDiv.className =
        "bot-message";


    messageDiv.innerHTML = `

        <div class="message-icon">
            ✨
        </div>

        <div class="message-content">

            <p></p>

        </div>

    `;


    messageDiv
        .querySelector("p")
        .textContent = message;


    chatbotMessages.appendChild(
        messageDiv
    );


    scrollChatToBottom();

}


// =====================================================
// HANDLE QUICK QUESTION
// =====================================================

function handleChatQuestion(question) {

    if (!question) {

        return;

    }


    addUserMessage(
        question
    );


    if (chatbotQuestions) {

        chatbotQuestions.style.display =
            "none";

    }


    setTimeout(function () {

        const answer =
            chatbotAnswers[question];


        if (answer) {

            addBotMessage(
                answer
            );

        }

        else {

            addBotMessage(
                "✨ I can help you explore stock prices, historical trends, live market data, and future price predictions."
            );

        }

    }, 400);

}


// =====================================================
// GET BOT RESPONSE FOR TEXT
// =====================================================

function getBotResponse(message) {

    const lowerMessage =
        message.toLowerCase();


    // LIVE / CURRENT PRICE

    if (
        lowerMessage.includes("live") ||
        lowerMessage.includes("current") ||
        lowerMessage.includes("price")
    ) {

        return (
            "📈 You can check the Live Stock Price section " +
            "to watch the stock data move step by step."
        );

    }


    // PREDICTION

    if (
        lowerMessage.includes("predict") ||
        lowerMessage.includes("prediction") ||
        lowerMessage.includes("future")
    ) {

        return (
            "🔮 Use the Predict Future Stock Price " +
            "section below. Enter the number of days " +
            "and click Predict Price."
        );

    }


    // HISTORY

    if (
        lowerMessage.includes("history") ||
        lowerMessage.includes("historical")
    ) {

        return (
            "📊 The Historical Stock Price graph shows " +
            "the previous price movement of the selected company."
        );

    }


    // MACHINE LEARNING

    if (
        lowerMessage.includes("how") ||
        lowerMessage.includes("linear regression") ||
        lowerMessage.includes("machine learning")
    ) {

        return (
            "🤖 StockPredict uses historical stock data " +
            "and Linear Regression to estimate a future stock price."
        );

    }


    // HELP

    if (
        lowerMessage.includes("help") ||
        lowerMessage.includes("what can")
    ) {

        return (
            "💡 Of course! You can explore live prices, " +
            "historical data, different stocks, and future price predictions."
        );

    }


    // STOCK

    if (
        lowerMessage.includes("stock")
    ) {

        return (
            "📈 You can select a company from the " +
            "Select Stock menu and explore its price data."
        );

    }


    // DEFAULT

    return (
        "✨ I can help you explore stock prices, " +
        "historical data, live market data, and future predictions. " +
        "Try asking me about them!"
    );

}


// =====================================================
// SEND CHAT MESSAGE
// =====================================================

function sendChatMessage() {

    if (!chatbotInput) {

        return;

    }


    const message =
        chatbotInput.value.trim();


    if (message === "") {

        return;

    }


    addUserMessage(
        message
    );


    chatbotInput.value =
        "";


    if (chatbotQuestions) {

        chatbotQuestions.style.display =
            "none";

    }


    setTimeout(function () {

        const response =
            getBotResponse(
                message
            );


        addBotMessage(
            response
        );

    }, 400);

}


// =====================================================
// INITIALIZE CHATBOT
// =====================================================

function initializeChatbot() {

    if (
        !chatbotButton ||
        !chatbotWindow
    ) {

        console.error(
            "Chatbot elements were not created."
        );

        return;

    }


    // =================================================
    // OPEN CHATBOT
    // =================================================

    chatbotButton.addEventListener(
        "click",
        function () {

            chatbotWindow.classList.add(
                "active"
            );


            chatbotButton.classList.add(
                "hidden"
            );


            setTimeout(function () {

                if (chatbotInput) {

                    chatbotInput.focus();

                }

                scrollChatToBottom();

            }, 100);

        }
    );


    // =================================================
    // CLOSE CHATBOT
    // =================================================

    if (chatbotClose) {

        chatbotClose.addEventListener(
            "click",
            function () {

                chatbotWindow.classList.remove(
                    "active"
                );


                chatbotButton.classList.remove(
                    "hidden"
                );

            }
        );

    }


    // =================================================
    // SEND BUTTON
    // =================================================

    if (chatbotSend) {

        chatbotSend.addEventListener(
            "click",
            sendChatMessage
        );

    }


    // =================================================
    // ENTER KEY
    // =================================================

    if (chatbotInput) {

        chatbotInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendChatMessage();

                }

            }
        );

    }


    // =================================================
    // QUICK QUESTIONS
    // =================================================

    const chatQuestionButtons =
        document.querySelectorAll(
            ".chat-question"
        );


    chatQuestionButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const question =
                        button.getAttribute(
                            "data-question"
                        );


                    handleChatQuestion(
                        question
                    );

                }
            );

        }
    );


    console.log(
        "StockPredict chatbot initialized successfully."
    );

}

function toggleStockDropdown() {

    const dropdown =
        document.getElementById("customStockSelect");

    dropdown.classList.toggle("open");
}


function selectStock(symbol, company) {

    document.getElementById("selectedCompany").textContent =
        company;

    document.getElementById("selectedSymbol").textContent =
        "(" + symbol + ")";

    document
        .getElementById("customStockSelect")
        .classList.remove("open");

    // Change stock
    window.location.href =
        "/dashboard?stock=" + symbol;
}


/* Close dropdown when clicking outside */

document.addEventListener("click", function(event) {

    const dropdown =
        document.getElementById("customStockSelect");

    if (!dropdown) return;

    if (!dropdown.contains(event.target)) {

        dropdown.classList.remove("open");

    }

});

// =====================================================
// WATCHLIST
// =====================================================

const WATCHLIST_KEY = "stockPredictWatchlist";

function getWatchlist() {

    return JSON.parse(
        localStorage.getItem(WATCHLIST_KEY)
    ) || [];

}


function saveWatchlist(watchlist) {

    localStorage.setItem(
        WATCHLIST_KEY,
        JSON.stringify(watchlist)
    );

}

function addToWatchlist(symbol, company) {

    const watchlist = getWatchlist();


    const exists =
        watchlist.some(
            stock => stock.symbol === symbol
        );


    // Already exists
    if (exists) {

        showWatchlistPopup(
            company,
            symbol
        );

        return false;

    }


    // Add stock
    watchlist.push({

        symbol: symbol,

        company: company

    });


    saveWatchlist(
        watchlist
    );


    renderWatchlist();


    return true;

}


function removeFromWatchlist(symbol) {

    let watchlist = getWatchlist();

    watchlist =
        watchlist.filter(
            stock => stock.symbol !== symbol
        );

    saveWatchlist(watchlist);

    renderWatchlist();

}


function renderWatchlist() {

    const container =
        document.getElementById(
            "watchlistContainer"
        );

    if (!container) return;

    const watchlist =
        getWatchlist();


    if (watchlist.length === 0) {

        container.innerHTML = `
            <div class="watchlist-empty">
                ⭐ Your watchlist is empty.
                Add stocks you want to track.
            </div>
        `;

        return;
    }


    container.innerHTML =
        watchlist.map(stock => `

            <div class="watchlist-item">

                <div
                    class="watchlist-stock"
                    onclick="openWatchlistStock('${stock.symbol}')"
                    style="cursor:pointer;"
                >

                    <span class="watchlist-symbol">
                        ${stock.symbol}
                    </span>

                    <span class="watchlist-company">
                        ${stock.company}
                    </span>

                </div>


                <button
                    class="watchlist-remove"
                    onclick="removeFromWatchlist('${stock.symbol}')"
                >
                    ×
                </button>

            </div>

        `).join("");

}


function openWatchlistStock(symbol) {

    window.location.href =
        "/dashboard?stock=" +
        encodeURIComponent(symbol);

}


renderWatchlist();

// =====================================================
// ADD CURRENT STOCK TO WATCHLIST
// =====================================================

const addWatchlistBtn =
    document.getElementById("addWatchlistBtn");


if (addWatchlistBtn) {

    addWatchlistBtn.addEventListener(
        "click",
        function () {

            const customSelect =
                document.getElementById(
                    "customStockSelect"
                );

            const selectedCompany =
                document.getElementById(
                    "selectedCompany"
                );


            if (!customSelect || !selectedCompany) {
                return;
            }


            const symbol =
                customSelect.dataset.stock;

            const company =
                selectedCompany.textContent.trim();


            addToWatchlist(
                symbol,
                company
            );


            // Change button after adding

            addWatchlistBtn.textContent =
                "✓ Added to Watchlist";


            addWatchlistBtn.classList.add(
                "added"
            );


            setTimeout(function () {

                addWatchlistBtn.textContent =
                    "☆ Add to Watchlist";

                addWatchlistBtn.classList.remove(
                    "added"
                );

            }, 1500);

        }
    );

}

// =====================================================
// WATCHLIST POPUP
// =====================================================

function showWatchlistPopup(company, symbol) {

    const overlay =
        document.getElementById(
            "watchlistPopup"
        );


    const popup =
        document.getElementById(
            "watchlistPopupContent"
        );


    const stock =
        document.getElementById(
            "watchlistPopupStock"
        );


    if (!overlay || !popup) {
        return;
    }


    // Stock name

    if (stock) {

        stock.textContent =
            company +
            " (" +
            symbol +
            ")";

    }


    // Show popup

    overlay.style.display =
        "flex";


    setTimeout(function () {

        popup.classList.add(
            "show"
        );

    }, 20);

}
// =====================================================
// CLOSE WATCHLIST POPUP
// =====================================================

function closeWatchlistPopup() {

    const overlay =
        document.getElementById(
            "watchlistPopup"
        );


    const popup =
        document.getElementById(
            "watchlistPopupContent"
        );


    if (!overlay || !popup) {
        return;
    }


    popup.classList.remove(
        "show"
    );


    setTimeout(function () {

        overlay.style.display =
            "none";

    }, 250);

}
// =====================================================
// WATCHLIST POPUP EVENTS
// =====================================================

const watchlistPopupClose =
    document.getElementById(
        "watchlistPopupClose"
    );


if (watchlistPopupClose) {

    watchlistPopupClose.addEventListener(
        "click",
        closeWatchlistPopup
    );

}


const watchlistPopup =
    document.getElementById(
        "watchlistPopup"
    );


if (watchlistPopup) {

    watchlistPopup.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                watchlistPopup
            ) {

                closeWatchlistPopup();

            }

        }
    );

}

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeWatchlistPopup();

        }

    }
);


// =====================================================
// LIVE STOCK NEWS TICKER - COMPANY LOGOS
// =====================================================

const newsData = [
    {
        symbol: "AAPL",
        company: "Apple Inc.",
        logo: `<svg viewBox="0 0 384 512" width="40" height="40"><path fill="#555" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90.2-59.9-92.1zM256 80c-2.8-25.4 9.2-50.2 28-68.3-19.4-9.5-44.5-14.6-72.1-13.9-6.3 23.9-0.5 46.5 17.6 64.7 18.2 18.5 42.2 27.2 69.2 25.3 6.3-22.9-1.6-44.6-18.7-63.2z"/></svg>`,
        bgColor: "#f5f5f7",
        title: "Apple announces new AI features for iPhone 16",
        price: 187.32,
        change: "+2.35%",
        positive: true,
        time: "2 min ago",
        source: "Bloomberg"
    },
    {
        symbol: "TSLA",
        company: "Tesla Inc.",
        logo: `<svg viewBox="0 0 384 512" width="40" height="40"><path fill="#dc2626" d="M179.2 0L0 512h76.8l38.4-102.4h153.6L307.2 512H384L204.8 0h-25.6zm25.6 128l51.2 153.6H153.6L204.8 128z"/></svg>`,
        bgColor: "#fef2f2",
        title: "Tesla deliveries beat Q4 expectations by 15%",
        price: 238.15,
        change: "-1.12%",
        positive: false,
        time: "15 min ago",
        source: "Reuters"
    },
    {
        symbol: "NVDA",
        company: "NVIDIA Corp.",
        logo: `<svg viewBox="0 0 384 512" width="40" height="40"><path fill="#22c55e" d="M192 0C86.4 0 0 86.4 0 192s86.4 192 192 192 192-86.4 192-192S297.6 0 192 0zm0 320c-70.4 0-128-57.6-128-128S121.6 64 192 64s128 57.6 128 128-57.6 128-128 128zm-32-64h64v-64h64v-64h-64V64h-64v64h-64v64h64v64z"/></svg>`,
        bgColor: "#f0fdf4",
        title: "NVIDIA launches next-gen AI chips with 3x performance",
        price: 128.90,
        change: "+5.67%",
        positive: true,
        time: "28 min ago",
        source: "CNBC"
    },
    {
        symbol: "AMZN",
        company: "Amazon Inc.",
        logo: `<svg viewBox="0 0 448 512" width="40" height="40"><path fill="#f59e0b" d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68.5-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70.5-21-70.5-21l-13.8 33.7s38.2 28.2 62.8 31.8c24.7 3.7 60.8-4 60.8-4v-45.5s-14.2 3.5-39.3 5z"/></svg>`,
        bgColor: "#fffbeb",
        title: "Amazon expands same-day delivery to 50 new cities",
        price: 189.45,
        change: "+0.82%",
        positive: true,
        time: "42 min ago",
        source: "WSJ"
    },
    {
        symbol: "META",
        company: "Meta Platforms",
        logo: `<svg viewBox="0 0 512 512" width="40" height="40"><path fill="#8b5cf6" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-40-80h80v-80h-80v80zm0-160h80V128h-80v80z"/></svg>`,
        bgColor: "#faf5ff",
        title: "Meta reports record ad revenue growth of 25%",
        price: 348.70,
        change: "-3.05%",
        positive: false,
        time: "1 hour ago",
        source: "FT"
    },
    {
        symbol: "GOOGL",
        company: "Alphabet Inc.",
        logo: `<svg viewBox="0 0 488 512" width="40" height="40"><path fill="#3b82f6" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>`,
        bgColor: "#eff6ff",
        title: "Google Cloud revenue surges 35%, beats estimates",
        price: 142.80,
        change: "+1.45%",
        positive: true,
        time: "2 hours ago",
        source: "TechCrunch"
    },
    {
        symbol: "MSFT",
        company: "Microsoft Corp.",
        logo: `<svg viewBox="0 0 448 512" width="40" height="40"><path fill="#06b6d4" d="M0 0h213.3v213.3H0V0zm234.7 0H448v213.3H234.7V0zM0 234.7h213.3V448H0V234.7zm234.7 0H448V448H234.7V234.7z"/></svg>`,
        bgColor: "#f0faff",
        title: "Microsoft AI Copilot adoption grows 200% in Q4",
        price: 378.90,
        change: "+0.92%",
        positive: true,
        time: "3 hours ago",
        source: "Bloomberg"
    },
    {
        symbol: "JPM",
        company: "JPMorgan Chase",
        logo: `<svg viewBox="0 0 448 512" width="40" height="40"><path fill="#14b8a6" d="M0 0v512h448V0H0zm400 464H48V48h352v416zM128 128h192v32H128v-32zm0 64h192v32H128v-32zm0 64h192v32H128v-32zm0 64h192v32H128v-32z"/></svg>`,
        bgColor: "#f0fdf4",
        title: "JPMorgan beats earnings estimates on strong trading",
        price: 155.60,
        change: "-0.45%",
        positive: false,
        time: "4 hours ago",
        source: "Reuters"
    }
];

// =====================================================
// CREATE NEWS CARD
// =====================================================

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.setAttribute('data-symbol', news.symbol);
    card.onclick = function() {
        openStockPopup(news);
    };

    card.innerHTML = `
        <div class="news-card-top" style="background: ${news.bgColor};">
            <div class="logo-wrapper">
                ${news.logo}
            </div>
            <span class="big-symbol">${news.symbol}</span>
            <span class="company-name-small">${news.company}</span>
            <div class="price-row">
                <span class="price-ticker">$${news.price.toFixed(2)}</span>
                <span class="${news.positive ? 'change-ticker-up' : 'change-ticker-down'}">
                    ${news.positive ? '▲' : '▼'} ${news.change}
                </span>
            </div>
        </div>
        <div class="news-card-bottom">
            <p class="news-title-ticker">${news.title}</p>
            <div class="news-source-ticker">
                <span>${news.source}</span>
                <span class="time-ticker">• ${news.time}</span>
            </div>
        </div>
    `;

    return card;
}

// =====================================================
// BUILD NEWS TICKER
// =====================================================

function buildNewsTicker() {
    const track = document.getElementById('newsTickerTrack');
    if (!track) return;

    track.innerHTML = '';

    newsData.forEach(news => {
        track.appendChild(createNewsCard(news));
    });

    newsData.forEach(news => {
        track.appendChild(createNewsCard(news));
    });
}

// =====================================================
// OPEN STOCK DETAIL POPUP
// =====================================================

function openStockPopup(news) {
    const overlay = document.getElementById('stockDetailOverlay');
    const popup = document.getElementById('stockDetailPopup');

    if (!overlay || !popup) return;

    document.getElementById('popupCompanyName').textContent = news.company;
    document.getElementById('popupSymbol').textContent = news.symbol;
    document.getElementById('popupLogo').innerHTML = news.logo;
    document.getElementById('popupLogoWrapper').style.background = news.bgColor;
    document.getElementById('popupPrice').textContent = `$${news.price.toFixed(2)}`;

    const changeBadge = document.getElementById('popupChangeBadge');
    const changeIcon = document.getElementById('popupChangeIcon');
    const changeText = document.getElementById('popupChangeText');

    changeBadge.className = `popup-change-badge ${news.positive ? 'positive' : 'negative'}`;
    changeIcon.textContent = news.positive ? '▲' : '▼';
    changeText.textContent = news.change;

    document.getElementById('popupNewsTitle').textContent = news.title;
    document.getElementById('popupNewsSource').textContent = news.source;
    document.getElementById('popupNewsTime').textContent = `• ${news.time}`;

    overlay.classList.add('active');

    popup.style.animation = 'none';
    requestAnimationFrame(() => {
        popup.style.animation = 'popupSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
}

// =====================================================
// CLOSE STOCK POPUP - THIS WAS MISSING!
// =====================================================

function closeStockPopup() {
    const overlay = document.getElementById('stockDetailOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// =====================================================
// POPUP EVENT LISTENERS - SINGLE VERSION
// =====================================================

// Setup on page load
setTimeout(function() {
    // Close button - using onclick in HTML already
    // Click outside to close
    const overlay = document.getElementById('stockDetailOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeStockPopup();
            }
        });
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeStockPopup();
        }
    });

    // Build ticker
    buildNewsTicker();
}, 100);

// =====================================================
// VIEW FULL ANALYSIS - Refresh Dashboard with stock
// =====================================================

function viewFullAnalysis() {
    const customSelect = document.getElementById('customStockSelect');
    const selectedCompany = document.getElementById('selectedCompany');
    
    const symbol = customSelect ? customSelect.dataset.stock : 'AAPL';
    const company = selectedCompany ? selectedCompany.textContent.trim() : 'Stock';
    
    // Close the popup
    closeStockPopup();
    
    // Refresh dashboard with the same stock (shows historical data)
    window.location.href = `/dashboard?stock=${symbol}`;
}

// =====================================================
// STOCK COMPARISON - SIMPLE VERSION (No Winner/Loser)
// =====================================================

// Stock data
const stockPrices = {
    'AAPL': { price: 187.32, change: '+2.35%', up: true, pe: 28.4, volume: '45.2M', marketCap: '$2.8T' },
    'GOOGL': { price: 142.80, change: '+1.45%', up: true, pe: 24.1, volume: '32.8M', marketCap: '$1.9T' },
    'MSFT': { price: 378.90, change: '+0.92%', up: true, pe: 35.2, volume: '28.1M', marketCap: '$2.8T' },
    'AMZN': { price: 189.45, change: '+0.82%', up: true, pe: 42.7, volume: '38.5M', marketCap: '$1.9T' },
    'META': { price: 348.70, change: '-3.05%', up: false, pe: 32.8, volume: '22.3M', marketCap: '$1.1T' },
    'TSLA': { price: 238.15, change: '-1.12%', up: false, pe: 58.9, volume: '51.6M', marketCap: '$0.8T' },
    'NVDA': { price: 128.90, change: '+5.67%', up: true, pe: 62.3, volume: '68.4M', marketCap: '$0.9T' },
    'JPM': { price: 155.60, change: '-0.45%', up: false, pe: 12.5, volume: '18.7M', marketCap: '$0.5T' },
    // ADDED THESE TWO LINES 👇
    'NFLX': { price: 545.20, change: '+1.80%', up: true, pe: 32.5, volume: '12.4M', marketCap: '$290B' },
    'KO': { price: 63.45, change: '-0.25%', up: false, pe: 25.1, volume: '15.8M', marketCap: '$270B' }
};

// Company names
const companyNames = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corp.',
    'AMZN': 'Amazon Inc.',
    'META': 'Meta Platforms',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corp.',
    'JPM': 'JPMorgan Chase',
     'NFLX': 'Netflix Inc.',
    'KO': 'The Coca-Cola Company'
};

function updateComparison() {
    const stock1 = document.getElementById('compareStock1').value;
    const stock2 = document.getElementById('compareStock2').value;
    const result = document.getElementById('comparisonResult');
    
    if (stock1 === stock2) {
        result.innerHTML = `
            <div class="comparison-placeholder" style="color:#dc2626;">
                <span class="placeholder-icon">⚠️</span>
                <p>Please select two different stocks</p>
                <span class="placeholder-sub">Compare different companies for insights</span>
            </div>
        `;
        result.className = 'comparison-result';
        return;
    }
    
    const data1 = stockPrices[stock1];
    const data2 = stockPrices[stock2];
    
    if (!data1 || !data2) {
        result.innerHTML = `
            <div class="comparison-placeholder">
                <span class="placeholder-icon">⏳</span>
                <p>Loading comparison data...</p>
            </div>
        `;
        result.className = 'comparison-result';
        return;
    }
    
    result.className = 'comparison-result has-data';
    
    result.innerHTML = `
        <div class="comparison-grid">
            <!-- STOCK 1 -->
            <div class="comparison-card">
                <div class="cmp-symbol">${stock1}</div>
                <div class="cmp-company">${companyNames[stock1] || stock1}</div>
                <div class="cmp-price-row">
                    <span class="cmp-price">$${data1.price.toFixed(2)}</span>
                    <span class="cmp-change ${data1.up ? 'cmp-up' : 'cmp-down'}">
                        ${data1.up ? '▲' : '▼'} ${data1.change}
                    </span>
                </div>
                <div class="cmp-details">
                    <div class="cmp-detail-item">
                        <span class="detail-label">P/E Ratio</span>
                        <span class="detail-value">${data1.pe}</span>
                    </div>
                    <div class="cmp-detail-item">
                        <span class="detail-label">Volume</span>
                        <span class="detail-value">${data1.volume}</span>
                    </div>
                    <div class="cmp-detail-item">
                        <span class="detail-label">Market Cap</span>
                        <span class="detail-value">${data1.marketCap}</span>
                    </div>
                    <div class="cmp-detail-item">
                        <span class="detail-label">Performance</span>
                        <span class="detail-value" style="color: ${data1.up ? '#16a34a' : '#dc2626'}">
                            ${data1.up ? '▲ Bullish' : '▼ Bearish'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- VS DIVIDER -->
            <div class="comparison-vs-divider">
                <div class="vs-line"></div>
                <div class="vs-circle">VS</div>
                <div class="vs-line"></div>
            </div>

            <!-- STOCK 2 -->
            <div class="comparison-card">
                <div class="cmp-symbol">${stock2}</div>
                <div class="cmp-company">${companyNames[stock2] || stock2}</div>
                <div class="cmp-price-row">
                    <span class="cmp-price">$${data2.price.toFixed(2)}</span>
                    <span class="cmp-change ${data2.up ? 'cmp-up' : 'cmp-down'}">
                        ${data2.up ? '▲' : '▼'} ${data2.change}
                    </span>
                </div>
                <div class="cmp-details">
                    <div class="cmp-detail-item">
                        <span class="detail-label">P/E Ratio</span>
                        <span class="detail-value">${data2.pe}</span>
                    </div>
                    <div class="cmp-detail-item">
                        <span class="detail-label">Volume</span>
                        <span class="detail-value">${data2.volume}</span>
                    </div>
                    <div class="cmp-detail-item">
                        <span class="detail-label">Market Cap</span>
                        <span class="detail-value">${data2.marketCap}</span>
                    </div>
                    <div class="cmp-detail-item">
                        <span class="detail-label">Performance</span>
                        <span class="detail-value" style="color: ${data2.up ? '#16a34a' : '#dc2626'}">
                            ${data2.up ? '▲ Bullish' : '▼ Bearish'}
                        </span>

                        
                    </div>
                </div>
            </div>
        </div>
    `;

    
}

// Auto update on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateComparison, 300);
});

// =====================================================
// COMPARISON DROPDOWN FUNCTIONS
// =====================================================

// Stock icons mapping
const stockIcons = {
    'AAPL': '🍎',
    'GOOGL': '🌐',
    'MSFT': '🪟',
    'AMZN': '📦',
    'META': '🔷',
    'TSLA': '🚗',
    'NVDA': '💻',
    'JPM': '🏦',
    'NFLX': '🎬',
    'KO': '🥤'
};

function toggleComparisonDropdown(dropdownId) {
    // Close all other dropdowns
    document.querySelectorAll('.comparison-select-wrapper').forEach(wrapper => {
        const id = wrapper.querySelector('.comparison-dropdown')?.id;
        if (id && id !== dropdownId) {
            wrapper.classList.remove('active');
        }
    });
    
    const wrapper = document.getElementById(dropdownId).closest('.comparison-select-wrapper');
    wrapper.classList.toggle('active');
}

function selectComparisonStock(inputId, symbol, company) {
    // Update hidden input
    document.getElementById(inputId).value = symbol;
    
    // Update selected display
    const dropdownId = inputId === 'compareStock1' ? 'compareDropdown1' : 'compareDropdown2';
    const wrapper = document.getElementById(dropdownId).closest('.comparison-select-wrapper');
    wrapper.querySelector('.comparison-selected-symbol').textContent = symbol;
    wrapper.querySelector('.comparison-selected-company').textContent = company;
    wrapper.querySelector('.comparison-selected-icon').textContent = stockIcons[symbol] || symbol[0];
    
    // Close dropdown with animation
    wrapper.classList.remove('active');
    
    // Update comparison
    updateComparison();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.comparison-select-wrapper')) {
        document.querySelectorAll('.comparison-select-wrapper').forEach(wrapper => {
            wrapper.classList.remove('active');
        });
    }
});

// =====================================================
// CSV DOWNLOAD FUNCTIONALITY
// =====================================================

document.addEventListener("DOMContentLoaded", function() {
    
    const downloadBtn = document.getElementById("downloadCsvBtn");
    const csvPopup = document.getElementById("csvDownloadPopup");
    const csvPopupContent = document.getElementById("csvDownloadPopupContent");
    const csvPopupClose = document.getElementById("csvPopupCloseBtn");
    const csvPopupStock = document.getElementById("csvPopupStock");
    const csvPopupFile = document.getElementById("csvPopupFile");
    
    // =====================================================
    // SHOW SUCCESS POPUP
    // =====================================================
    
    function showCsvPopup(stock, company) {
        // Update stock name
        if (csvPopupStock) {
            csvPopupStock.textContent = company + " (" + stock + ")";
        }
        
        // Update file name
        if (csvPopupFile) {
            csvPopupFile.textContent = "📄 " + stock + "_stock_data.csv";
        }
        
        // Show popup
        if (csvPopup) {
            csvPopup.style.display = "flex";
        }
        
        // Animate in
        setTimeout(function() {
            if (csvPopupContent) {
                csvPopupContent.classList.add("show");
            }
        }, 20);
        
        // Auto-close after 4 seconds
        setTimeout(function() {
            closeCsvPopup();
        }, 4000);
    }
    
    // =====================================================
    // CLOSE POPUP
    // =====================================================
    
    function closeCsvPopup() {
        if (csvPopupContent) {
            csvPopupContent.classList.remove("show");
        }
        
        setTimeout(function() {
            if (csvPopup) {
                csvPopup.style.display = "none";
            }
        }, 250);
    }
    
    // =====================================================
    // CLOSE BUTTON
    // =====================================================
    
    if (csvPopupClose) {
        csvPopupClose.addEventListener("click", closeCsvPopup);
    }
    
    // =====================================================
    // CLICK OUTSIDE
    // =====================================================
    
    if (csvPopup) {
        csvPopup.addEventListener("click", function(event) {
            if (event.target === csvPopup) {
                closeCsvPopup();
            }
        });
    }
    
    // =====================================================
    // ESC KEY
    // =====================================================
    
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeCsvPopup();
        }
    });
    
    // =====================================================
    // DOWNLOAD BUTTON CLICK
    // =====================================================
    
    if (downloadBtn) {
        downloadBtn.addEventListener("click", function() {
            
            // Get current stock
            const customSelect = document.getElementById("customStockSelect");
            const stock = customSelect ? customSelect.dataset.stock : "GOOGL";
            
            // Get company name
            const selectedCompany = document.getElementById("selectedCompany");
            const company = selectedCompany ? selectedCompany.textContent.trim() : "Google";
            
            // Trigger download
            window.location.href = "/download-csv?stock=" + encodeURIComponent(stock);
            
            // Show success popup after a short delay
            setTimeout(function() {
                showCsvPopup(stock, company);
            }, 500);
            
        });
    }
    
});

// =====================================================
// END OF SCRIPT
// =====================================================