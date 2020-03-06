const MIN_ROLL = 1;
const MAX_ROLL = 36;

let NUM_ZEROS = parseInt(localStorage.getItem("NUM_ZEROS")) || 2;
let BOARD = JSON.parse(localStorage.getItem("BOARD")) || {
  ZERO: ["0", 0],
  EVEN: ["2{0-17}+2", 2],
  ODD: ["2{0-17}+1", 2],
  HIGH: ["{19-36}", 2],
  LOW: ["{1-18}", 2],
  RED: ["2{0-4}+1||2{0-3}+12||2{0-4}+19||2{0-3}+30", 2],
  BLACK: ["2{0-4}+2||2{0-3}+11||2{0-4}+20||2{0-3}+29", 2],
  DOZ_1: ["{1-12}", 3],
  DOZ_2: ["{13-24}", 3],
  DOZ_3: ["{25-36}", 3],
  COL_1: ["3{0-11}+1", 3],
  COL_2: ["3{0-11}+2", 3],
  COL_3: ["3{0-11}+3", 3]
};

let STRATEGY = JSON.parse(localStorage.getItem("STRATEGY")) || {
  ZERO: [0, "$RED *= 2; $BLACK *= 2"],
  RED: [1, "$RED = 1; $BLACK *= 2"],
  BLACK: [1, "$RED *= 2; $BLACK = 1"]
};

let STARTING_BANK = parseInt(localStorage.getItem("STARTING_BANK")) || 1000;
let GOAL_BANK = parseInt(localStorage.getItem("GOAL_BANK")) || 1050;
let NUM_SIMS = parseInt(localStorage.getItem("NUM_SIMS")) || 100;

$("#board").text(JSON.stringify(BOARD, null, 4));
$("#board").on("change", function() {
  try {
    BOARD = JSON.parse(this.value);
    $("#board").removeClass("border-red-500");
    return;
  } catch {}

  $("#board").addClass("border-red-500");
});

$("#strategy").text(JSON.stringify(STRATEGY, null, 2));
$("#strategy").on("change", function() {
  try {
    STRATEGY = JSON.parse(this.value);
    $("#strategy").removeClass("border-red-500");
    return;
  } catch {}

  $("#strategy").addClass("border-red-500");
});

$("#num-zeros").val(NUM_ZEROS);
$("#num-zeros").on("change", function() {
  NUM_ZEROS = parseInt(this.value);
});

$("#starting-bank").val(STARTING_BANK);
$("#starting-bank").on("change", function() {
  STARTING_BANK = parseInt(this.value);
});

$("#goal-bank").val(GOAL_BANK);
$("#goal-bank").on("change", function() {
  GOAL_BANK = parseInt(this.value);
});

$("#num-sims").val(NUM_SIMS);
$("#num-sims").on("change", function() {
  NUM_SIMS = parseInt(this.value);
});

$("#save").on("click", function() {
  localStorage.setItem("NUM_ZEROS", JSON.stringify(NUM_ZEROS));
  localStorage.setItem("BOARD", JSON.stringify(BOARD));
  localStorage.setItem("STRATEGY", JSON.stringify(STRATEGY));
  localStorage.setItem("STARTING_BANK", STARTING_BANK);
  localStorage.setItem("GOAL_BANK", GOAL_BANK);
  localStorage.setItem("NUM_SIMS", NUM_SIMS);

  $("#config-feedback").text("Saved!");
  setTimeout(() => {
    $("#config-feedback").text("");
  }, 1000);
});

$("#reset").on("click", function() {
  localStorage.clear();
  location.reload();
});
