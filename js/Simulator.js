$("#simulate").on("click", function() {
  if ($("#simulate").attr("disabled")) {
    return;
  }

  window.wheel.spin();

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
    Object.keys(BOARD).forEach(aliasName => {
      aliasExpressions[aliasName] = AliasExpression.parse(BOARD[aliasName][0]);
    });

    const strategyExpressions = {};
    Object.keys(STRATEGY).forEach(betName => {
      strategyExpressions[betName] = StrategyExpression.parse(
        STRATEGY[betName][1]
      );
    });

    let simNum = 0;
    let numSuccess = 0;
    let totalBankAfter = 0;
    let totalNumRolls = 0;

    while (simNum < NUM_SIMS) {
      let rollNum = 0;
      let bets = {};
      Object.keys(STRATEGY).forEach(
        betName => (bets[betName] = STRATEGY[betName][0])
      );
      let bank =
        STARTING_BANK - Object.values(bets).reduce((bet, sum) => bet + sum);

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
            bank += BOARD[betName][1] * bets[betName];
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
    const avgNet =
      successRate * (GOAL_BANK - STARTING_BANK) -
      (1 - successRate) * STARTING_BANK;
    const avgEndBank = totalBankAfter / NUM_SIMS;

    $("#success-rate").text(formatPercent(successRate));
    $("#avg-end-bank").text(formatCurrency(avgEndBank));
    $("#avg-num-rolls").text(formatNumber(totalNumRolls / NUM_SIMS));
    $("#avg-net").text(formatCurrency(avgNet));

    if (avgNet > 0) {
      $("#avg-net").addClass("text-green-500");
    } else if (avgNet < 0) {
      $("#avg-net").addClass("text-red-500");
    }

    if (avgEndBank > STARTING_BANK) {
      $("#avg-end-bank").addClass("text-green-500");
    } else if (avgEndBank < STARTING_BANK) {
      $("#avg-end-bank").addClass("text-red-500");
    }

    $("#simulate").attr("disabled", false);
    $("#simulate").addClass("bg-blue-500");
    $("#simulate").removeClass("bg-gray-500 cursor-not-allowed");
  }, 500);
});
