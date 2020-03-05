const formatNumber = num => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4
  });
};

const formatPercent = num => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    style: "percent"
  });
};

const formatCurrency = num => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    style: "currency",
    currency: "USD"
  });
};

class AliasExpression {
  constructor(check) {
    this.check = check;
  }

  isMatch(roll) {
    return this.check(roll);
  }

  static parse(str) {
    const checks = [];
    str.split("|").forEach(segment => {
      checks.push(AliasExpression.parseSegment(segment));
    });
    return new AliasExpression(roll => checks.some(check => check(roll)));
  }

  static parseSegment(segment) {
    const singleIntMatch = segment.match(/^(\d+)$/);
    if (singleIntMatch) {
      const num = parseInt(singleIntMatch[1]);
      return roll => roll === num;
    }

    const intRangeMatch = segment.match(/^(\d+)-(\d+)$/);
    if (intRangeMatch) {
      const start = parseInt(intRangeMatch[1]);
      const end = parseInt(intRangeMatch[2]);
      return roll => roll >= start && roll <= end;
    }

    const genericMatch = segment.match(/^(\d+)n(?:\+(\d+))?$/);
    if (genericMatch) {
      const multiplier = parseInt(genericMatch[1]);
      const addend = genericMatch[2] ? parseInt(genericMatch[2]) : 0;
      return roll => (roll - addend) % multiplier === 0;
    }

    throw "Bad Segment!";
  }
}

class StrategyExpression {
  constructor(updateFn) {
    this.updateFn = updateFn;
  }

  update(bets) {
    return this.updateFn(bets);
  }

  static parse(str) {
    const expression = str.replace(/\$/g, "bets.");
    return new StrategyExpression(bets => eval(expression));
  }
}

let MIN_ROLL = 1;
$("#min-roll").text(MIN_ROLL);
$("#min-roll").on("change", function() {
  MIN_ROLL = parseInt(this.value);
});

let MAX_ROLL = 36;
$("#max-roll").text(MAX_ROLL);
$("#max-roll").on("change", function() {
  MAX_ROLL = parseInt(this.value);
});

let NUM_ZEROS = 2;
$("#num-zeros").text(NUM_ZEROS);
$("#num-zeros").on("change", function() {
  NUM_ZEROS = parseInt(this.value);
});

let ALIASES = {
  ZERO: "0",
  RED: "1|3|5|7|9|12|14|16|18|19|21|23|25|27|30|32|34|36",
  BLACK: "2|4|6|8|10|11|13|15|17|20|22|24|26|28|29|31|33|35",
  HIGH: "19-36",
  LOW: "1-18",
  EVEN: "2n",
  ODD: "2n+1",
  DOZ_1: "1-12",
  DOZ_2: "13-24",
  DOZ_3: "25-36",
  COL_1: "3n+1",
  COL_2: "3n+2",
  COL_3: "3n"
};
$("#aliases").text(JSON.stringify(ALIASES, null, 2));
$("#aliases").on("change", function() {
  try {
    ALIASES = JSON.parse(this.value);
    $("#aliases").removeClass("border-red-500");
    return;
  } catch {}

  $("#aliases").addClass("border-red-500");
});

let PAYOUTS = {
  RED: 2,
  BLACK: 2,
  HIGH: 2,
  LOW: 2,
  EVEN: 2,
  ODD: 2,
  DOZ_1: 3,
  DOZ_2: 3,
  DOZ_3: 3,
  COL_1: 3,
  COL_2: 3,
  COL_3: 3
};
$("#payouts").text(JSON.stringify(PAYOUTS, null, 2));
$("#payouts").on("change", function() {
  try {
    PAYOUTS = JSON.parse(this.value);
    $("#payouts").removeClass("border-red-500");
    return;
  } catch {}

  $("#payouts").addClass("border-red-500");
});

let INITIAL_BETS = {
  RED: 1,
  BLACK: 1
};
$("#bets").text(JSON.stringify(INITIAL_BETS, null, 2));
$("#bets").on("change", function() {
  try {
    INITIAL_BETS = JSON.parse(this.value);
    $("#bets").removeClass("border-red-500");
    return;
  } catch {}

  $("#bets").addClass("border-red-500");
});

let STRATEGY = {
  ZERO: "$RED = $RED * 2; $BLACK = $BLACK * 2",
  RED: "$RED = 1; $BLACK = $BLACK * 2",
  BLACK: "$RED = $RED * 2; $BLACK = 1"
};
$("#strategy").text(JSON.stringify(STRATEGY, null, 2));
$("#strategy").on("change", function() {
  try {
    STRATEGY = JSON.parse(this.value);
    $("#strategy").removeClass("border-red-500");
    return;
  } catch {}

  $("#strategy").addClass("border-red-500");
});

let STARTING_BANK = 1000;
$("#starting-bank").text(STARTING_BANK);
$("#starting-bank").on("change", function() {
  STARTING_BANK = parseInt(this.value);
});

let GOAL_BANK = 1050;
$("#goal-bank").text(GOAL_BANK);
$("#goal-bank").on("change", function() {
  GOAL_BANK = parseInt(this.value);
});

let NUM_SIMS = 100;
$("#num-sims").text(NUM_SIMS);
$("#num-sims").on("change", function() {
  NUM_SIMS = parseInt(this.value);
});

$("#simulate").on("click", function() {
  if ($("#simulate").attr("disabled")) {
    return;
  }

  $("#simulate").attr("disabled", true);
  $("#simulate").removeClass("bg-blue-500");
  $("#simulate").addClass("bg-gray-500 cursor-not-allowed");

  $("#success-rate").text("--");
  $("#avg-end-bank").text("--");
  $("#avg-num-rolls").text("--");
  $("#avg-net").text("--");
  $("#avg-net").removeClass("text-red-500 text-green-500");
  $("#avg-end-bank").removeClass("text-red-500 text-green-500");

  setTimeout(() => {
    const aliasExpressions = {};
    Object.keys(ALIASES).forEach(aliasName => {
      aliasExpressions[aliasName] = AliasExpression.parse(ALIASES[aliasName]);
    });

    const strategyExpressions = {};
    Object.keys(STRATEGY).forEach(betName => {
      strategyExpressions[betName] = StrategyExpression.parse(
        STRATEGY[betName]
      );
    });

    let simNum = 0;
    let numSuccess = 0;
    let totalBankAfter = 0;
    let totalNumRolls = 0;

    while (simNum < NUM_SIMS) {
      let rollNum = 0;
      let bets = { ...INITIAL_BETS };
      let bank =
        STARTING_BANK -
        Object.values(INITIAL_BETS).reduce((bet, sum) => bet + sum);

      while (bank >= 0 && bank < GOAL_BANK) {
        let roll =
          Math.floor(Math.random() * (MAX_ROLL + NUM_ZEROS)) +
          MIN_ROLL -
          NUM_ZEROS;
        if (roll < MIN_ROLL) {
          roll = 0;
        }

        // collect winnings
        Object.keys(bets).forEach(betName => {
          const didHit = aliasExpressions[betName].isMatch(roll);
          if (didHit) {
            bank += PAYOUTS[betName] * bets[betName];
          }
        });

        // update bets
        Object.keys(STRATEGY).forEach(betName => {
          const didHit = aliasExpressions[betName].isMatch(roll);
          if (didHit) {
            strategyExpressions[betName].update(bets);
          }
        });

        // pay for bets
        bank -= Object.values(bets).reduce((bet, sum) => bet + sum);

        rollNum++;
      }

      if (bank >= GOAL_BANK) {
        numSuccess++;
      }

      totalBankAfter += bank;
      totalNumRolls += rollNum;

      simNum++;
    }

    const successRate = numSuccess / NUM_SIMS;
    const avgNet = successRate * (GOAL_BANK - STARTING_BANK) -
    (1 - successRate) * STARTING_BANK;
    const avgEndBank = totalBankAfter / NUM_SIMS;

    $("#success-rate").text(formatPercent(successRate));
    $("#avg-end-bank").text(formatCurrency(avgEndBank));
    $("#avg-num-rolls").text(formatNumber(totalNumRolls / NUM_SIMS));
    $("#avg-net").text(formatCurrency(avgNet));

    if(avgNet > 0) {
      $("#avg-net").addClass("text-green-500");
    } else if (avgNet < 0) {
      $("#avg-net").addClass("text-red-500");
    }

    if(avgEndBank > STARTING_BANK) {
      $("#avg-end-bank").addClass("text-green-500");
    } else if (avgEndBank < STARTING_BANK) {
      $("#avg-end-bank").addClass("text-red-500");
    }

    $("#simulate").attr("disabled", false);
    $("#simulate").addClass("bg-blue-500");
    $("#simulate").removeClass("bg-gray-500 cursor-not-allowed");
  }, 0);
});

$('.collapsable > .collapse-button').on('click', function() {
  $(this).parent().toggleClass("h-0");

  const currentText = $(this).find('span').text();
  $(this).find('span').text(currentText === "+" ? "-" : "+");
});
