//gameBoard data variable
let gameInfo = [];
let qClicks = 0;

function checkWin() {
  console.log(`qclicks: ${qClicks}`);
  if (qClicks === 12) {
    /*
    hide game show game over screen
    */
    $("#jeopardyTable").addClass("visually-hidden");
    $("#gameOver").removeClass("visually-hidden");
    $("#restartBtn").addClass("pulse");
  }
}

function ansClick(questionData) {
  $("#jeopardyTable").addClass("visually-hidden"); //hide loader
  $("#jeopardyCard").removeClass("visually-hidden"); //show table
  $("#jeopardyCard div.categor").text(questionData.cat);
  $("#jeopardyCard div.question").text(questionData.question);
  $("#jeopardyCard div.ans")
    .text("Click for Answer")
    .on("click", (e) => {
      //diplay ans onClick
      e.preventDefault();
      e.target.innerHTML = `
        ${questionData.ans}
        <br>
        <button class="btn btn-warning" id="backBtn">Back to the Board</button>
        `;
      $("#backBtn").click((e) => {
        e.preventDefault();
        qClicks++;
        $("#jeopardyCard").addClass("visually-hidden"); //hide loader
        $("#jeopardyTable").removeClass("visually-hidden"); //show backBtn
        checkWin();
      });
    });
}

//handle clicks on questions
function handleClick(e) {
  const objectIndex = e.classList[2];
  const pos = e.classList[1];

  if (pos == "Top") {
    //if top click
    ansClick(gameInfo[objectIndex]["q1"]);
  } else {
    //if bottom click
    ansClick(gameInfo[objectIndex]["q2"]);
  }
}

//get gameData
async function setupAndStart() {
  //show loading screen
  $("#loading").removeClass("visually-hidden");
  //get 6 categories
  let random = Math.floor(Math.random() * 30);
  console.log(`offset (lower of error): ${random}`);
  const catGet = await axios({
    url: "http://jservice.io/api/categories",
    method: "GET",
    params: {
      count: 6,
      offset: random,
    },
  });
  let categories = [];
  //loop thru categories
  for (const i of catGet.data) {
    //use categories to get questions
    const questionGet = await axios({
      url: "http://jservice.io/api/category",
      method: "GET",
      params: {
        id: i.id,
      },
    });
    //assign to random questions
    //console.log(`questions for cat: ${questionGet.data.clues}`);
    let ran1 = Math.floor(Math.random() * questionGet.data.clues.length);
    let ran2 = Math.floor(Math.random() * questionGet.data.clues.length);
    categories.push({
      q1: {
        cat: i.title,
        id: questionGet.data.clues[ran1].id,
        question: questionGet.data.clues[ran1].question,
        ans: questionGet.data.clues[ran1].answer,
      },
      q2: {
        cat: i.title,
        id: questionGet.data.clues[ran2].id,
        question: questionGet.data.clues[ran2].question,
        ans: questionGet.data.clues[ran2].answer,
      },
    });
  }
  //fill game board
  fillGameTable(categories);
}

//FILL GAME TABLE
function fillGameTable(gameData) {
  //loop thru gamedata
  gameInfo = gameData;
  for (const i in gameData) {
    //set variables
    const cat = gameData[i].q1.cat.toUpperCase();
    const z = parseInt(i) + 1;
    $(`.cat${z}`).text(cat); //set Category
    $(`.cat${z}Q1`) //set Q1
      .text(`${gameData[i].q1.cat}, question 1`)
      .removeClass("bg-danger")
      .addClass("clickable");
    $(`.cat${z}Q2`) //set Q2
      .text(`${gameData[i].q2.cat}, question 2`)
      .removeClass("bg-danger")
      .addClass("clickable");
  }
  $("#loading").addClass("visually-hidden"); //hide loader
  $("#jeopardyTable").removeClass("visually-hidden"); //show Table
}

/** On click of start / restart button, set up game. */

$("#startBtn").click(function (e) {
  e.preventDefault();
  $("#startBtn").addClass("visually-hidden");
  $("#restartBtn").removeClass("visually-hidden");
  setupAndStart();
});

$("#restartBtn").click(function (e) {
  $("#jeopardyTable").addClass("visually-hidden");
  $("#gameOver").addClass("visually-hidden");
  $("#restartBtn").removeClass("pulse");
  qClicks = 0;
  setupAndStart();
});
/** On page load, add event handler for clicking clues */
$("#jTable").click(function (e) {
  e.preventDefault();
  if (e.target.classList.contains("clickable")) {
    console.log(e);
    e.target.classList.add("bg-danger");
    e.target.classList.remove("clickable");
    handleClick(e.target);
  }
});