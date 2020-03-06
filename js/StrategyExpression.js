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
