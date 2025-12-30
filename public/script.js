const statusText = document.querySelector("#status");


// 1️⃣ socket setup
const socket = io();
const roomId = "room1";
socket.emit("join-room", roomId);

// 2️⃣ DOM references
const squares = document.querySelectorAll(".square");
const reset = document.querySelector("#reset");

// 3️⃣ game state
let mySymbol = null;
let myTurn = false;
let over = false;

let xMoves = [];
let oMoves = [];

// 4️⃣ win patterns
const win = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
];

// 5️⃣ socket listeners
socket.on("player-assign", (symbol) => {
    mySymbol = symbol;
    myTurn = symbol === "X";
    statusText.innerText = myTurn ? "Your turn" : "Opponent's turn";
});


socket.on("move", ({ index, symbol }) => {
    playMove(index, symbol);
});

// 6️⃣ GAME LOGIC
function playMove(index, symbol) {
    if (over) return;

    const box = squares[index];
    if (box.innerText !== "") return;

    const currentMoves = symbol === "X" ? xMoves : oMoves;

    // 🔴 REMOVE oldest when placing 4th
    if (currentMoves.length === 3) {
        const removeIndex = currentMoves.shift();
        squares[removeIndex].innerText = "";
        squares[removeIndex].disabled = false;
        squares[removeIndex].classList.remove("fade");
    }

    // ✅ place symbol
    box.innerText = symbol;
    box.disabled = true;
    currentMoves.push(index);

    // 🟡 fade opponent's oldest AFTER turn
    const nextMoves = symbol === "X" ? oMoves : xMoves;
    if (nextMoves.length === 3) {
        squares[nextMoves[0]].classList.add("fade");
    }

    // 🔁 turn switch
    myTurn = symbol !== mySymbol;

    checkwinner();

    if (!over) {
    statusText.innerText = myTurn ? "Your turn" : "Opponent's turn";
}

}

// 7️⃣ CLICK HANDLER
squares.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (!myTurn || over || box.innerText !== "") return;

        playMove(index, mySymbol);
        socket.emit("move", { roomId, index, symbol: mySymbol });
    });
});

// 8️⃣ WIN / GAME OVER LOGIC
function checkwinner() {
    for (let pattern of win) {
        const [a, b, c] = pattern;
        const v1 = squares[a].innerText;
        const v2 = squares[b].innerText;
        const v3 = squares[c].innerText;

        if (v1 && v1 === v2 && v2 === v3) {
            over = true;
            disablesquares();
            statusText.innerText = v1 + " wins!";
            statusText.className = "win";
            return;
        }
    }

    // draw
    const filled = [...squares].every(sq => sq.innerText !== "");
    if (filled) {
        over = true;
        statusText.innerText = "It's a draw!";
        statusText.className = "draw";
    }
}


// 9️⃣ helpers
function disablesquares() {
    squares.forEach(box => box.disabled = true);
}

function enablesquares() {
    squares.forEach(box => {
        box.innerText = "";
        box.disabled = false;
        box.classList.remove("fade");
    });

    xMoves = [];
    oMoves = [];
    over = false;
    myTurn = mySymbol === "X";
    statusText.className = "";
    statusText.innerText = myTurn ? "Your turn" : "Opponent's turn";
}


// 🔁 reset button
reset.addEventListener("click", enablesquares);
