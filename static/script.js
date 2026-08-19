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


    const stockSelect =
        document.getElementById(
            "stockSelect"
        );


    const livePrice =
        document.getElementById(
            "livePrice"
        );


    const liveStatus =
        document.getElementById(
            "liveStatus"
        );


    if (!canvas || !stockSelect) {

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
        stockSelect.value;


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

                if (livePrice) {

                    livePrice.textContent =
                        "$" +
                        currentPrice.toFixed(2);

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
// LINEAR REGRESSION PREDICTION
// =====================================================

const predictionForm =
    document.getElementById(
        "predictionForm"
    );


if (predictionForm) {

    predictionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const stockSelect =
                document.getElementById(
                    "stockSelect"
                );


            const daysInput =
                document.getElementById(
                    "days"
                );


            const futurePrice =
                document.getElementById(
                    "futurePrice"
                );


            const predictionValue =
                document.getElementById(
                    "predictionValue"
                );


            if (
                !stockSelect ||
                !daysInput ||
                !futurePrice ||
                !predictionValue
            ) {

                return;

            }


            const stock =
                stockSelect.value;


            const days =
                daysInput.value;


            futurePrice.textContent =
                "...";


            predictionValue.textContent =
                "Calculating prediction...";


            try {

                const response =
                    await fetch(
                        `/predict?stock=${encodeURIComponent(stock)}&days=${encodeURIComponent(days)}`
                    );


                const data =
                    await response.json();


                if (data.error) {

                    futurePrice.textContent =
                        "-";


                    predictionValue.textContent =
                        data.error;


                    return;

                }


                futurePrice.textContent =
                    "$" +
                    data.predicted_price;


                predictionValue.textContent =
                    "Linear Regression prediction for " +
                    data.prediction_days +
                    " day(s)";

            }

            catch (error) {

                console.error(
                    "Prediction error:",
                    error
                );


                futurePrice.textContent =
                    "-";


                predictionValue.textContent =
                    "Unable to calculate prediction.";

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


// =====================================================
// END OF SCRIPT
// =====================================================