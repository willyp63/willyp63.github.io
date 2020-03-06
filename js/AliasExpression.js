class AliasExpression {
  constructor(check) {
    this.check = check;
  }

  isMatch(roll) {
    return this.check(roll);
  }

  static parse(str) {
    const checks = [];
    str.split("||").forEach(segment => {
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

    const genericMatch = segment.match(/^(\d*)\{(\d+)\-(\d+)\}(?:\+(\d+))?$/)
    if (genericMatch) {
      const multiplier = genericMatch[1] ? parseInt(genericMatch[1]) : 1;
      const start = parseInt(genericMatch[2]);
      const end = parseInt(genericMatch[3]);
      const addend = genericMatch[4] ? parseInt(genericMatch[4]) : 0;

      const min = start * multiplier + addend;
      const max = end * multiplier + addend;

      return roll => roll >= min && roll <= max && (roll - addend) % multiplier === 0;
    }

    throw "Bad Segment!";
  }
}
