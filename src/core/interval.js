import { TRUE, FALSE, MAYBE } from "./common.js"

export class Interval {
  static EMPTY = new Interval(Infinity, -Infinity, false)
  static WHOLE = new Interval(-Infinity, Infinity, false)

  static PI_TWICE = Math.PI * 2
  static PI_HALF = Math.PI / 2

  constructor(lo, hi, def = true) {
    this.lo = lo
    this.hi = (hi === undefined) ? lo : hi
    this.def = def
  }

  length() {
    return this.hi - this.lo
  }

  mid() {
    return (this.lo + this.hi) / 2
  }

  empty() {
    return this.lo > this.hi
  }

  includes(val) {
    return this.lo <= val && val <= this.hi
  }

  add(rhs) {
    return new Interval(this.lo + rhs.lo, this.hi + rhs.hi, this.def && rhs.def)
  }

  sub(rhs) {
    return new Interval(this.lo - rhs.hi, this.hi - rhs.lo, this.def && rhs.def)
  }

  mul(rhs) {
    const a = this.lo * rhs.lo
    const b = this.lo * rhs.hi
    const c = this.hi * rhs.lo
    const d = this.hi * rhs.hi
    return new Interval(Math.min(a, b, c, d), Math.max(a, b, c, d), this.def && rhs.def)
  }

  equal(rhs) {
    if (this.empty() || rhs.empty()) {
      return FALSE
    }

    if (this.hi < rhs.lo || this.lo > rhs.hi) {
      return FALSE
    } else {
      return MAYBE
    }
  }

  lessThan(rhs) {
    if (this.empty() || rhs.empty()) {
      return FALSE
    }

    if (this.hi < rhs.lo) {
      return TRUE
    } else if (this.lo > rhs.hi) {
      return FALSE
    } else {
      return MAYBE
    }
  }

  lessEqualThan(rhs) {
    if (this.empty() || rhs.empty()) {
      return FALSE
    }

    if (this.hi <= rhs.lo) {
      return TRUE
    } else if (this.lo > rhs.hi) {
      return FALSE
    } else {
      return MAYBE
    }
  }

  greaterThan(rhs) {
    if (this.empty() || rhs.empty()) {
      return FALSE
    }

    if (this.lo > rhs.hi) {
      return TRUE
    } else if (this.hi < rhs.lo) {
      return FALSE
    } else {
      return MAYBE
    }
  }

  greaterEqualThan(rhs) {
    if (this.empty() || rhs.empty()) {
      return FALSE
    }

    if (this.lo >= rhs.hi) {
      return TRUE
    } else if (this.hi < rhs.lo) {
      return FALSE
    } else {
      return MAYBE
    }
  }

  static cos(x) {
    if (x.empty()) {
        return Interval.EMPTY
    }

    if (x.lo === -Infinity || x.hi === Infinity || x.hi - x.lo >= Interval.PI_TWICE) {
        return new Interval(-1, 1, x.def)
    }

    let lo = x.lo
    let hi = x.hi

    if (x.lo < 0) {
        const n = Math.ceil(-x.lo / Interval.PI_TWICE);
        lo += Interval.PI_TWICE * n
        hi += Interval.PI_TWICE * n
    } else if (lo > 0) {
        const n = Math.floor(x.lo / Interval.PI_TWICE)
        lo -= Interval.PI_TWICE * n
        hi -= Interval.PI_TWICE * n
    }

    if (lo >= Math.PI) {
        const cosv = Interval.cos(new Interval(lo - Math.PI, hi - Math.PI))
        return new Interval(-cosv.hi, -cosv.lo, x.def)
    }

    const rlo = Math.cos(hi)
    const rhi = Math.cos(lo)
    if (hi <= Math.PI) {
        return new Interval(rlo, rhi, x.def)
    } else if (hi <= Interval.PI_TWICE) {
        return new Interval(-1, Math.max(rlo, rhi), x.def)
    } else {
        return new Interval(-1, 1, x.def)
    }
  }

  static sin(x) {
    if (x.empty()) {
        return Interval.EMPTY
    }
    return Interval.cos(new Interval(x.lo - Interval.PI_HALF, x.hi - Interval.PI_HALF, x.def))
  }

  static exp(x) {
    if (x.empty()) {
        return Interval.EMPTY
    }
    return new Interval(Math.exp(x.lo), Math.exp(x.hi), x.def)
  }

  static sqrt(x) {
    if (x.empty() || x.hi < 0) {
      return Interval.EMPTY
    }
    if (x.lo < 0) {
      return new Interval(0, Math.sqrt(x.hi), false)
    } else {
      return new Interval(Math.sqrt(x.lo), Math.sqrt(x.hi), x.def)
    }
  }

  // 以e为底的对数
  static log(x) {
    if (x.empty() || x.hi <= 0) {
      return Interval.EMPTY
    }
    if (x.lo <= 0) {
      return new Interval(-Infinity, Math.log(x.hi), false)
    } else {
      return new Interval(Math.log(x.lo), Math.log(x.hi), x.def)
    }
  }

  static arcsin(x) {
    if (x.empty() || x.hi < -1 || x.lo > 1) {
      return Interval.EMPTY
    }

    const lo = Math.max(-1, x.lo)
    const hi = Math.min(1, x.hi)
    return new Interval(Math.asin(lo), Math.asin(hi), x.def && x.lo >= -1 && x.hi <= 1)
  }

  static arccos(x) {
    if (x.empty() || x.hi < -1 || x.lo > 1) {
      return Interval.EMPTY
    }

    const lo = Math.max(-1, x.lo)
    const hi = Math.min(1, x.hi)
    return new Interval(Math.acos(hi), Math.acos(lo), x.def && x.lo >= -1 && x.hi <= 1)
  }

  static arctan(x) {
    if (x.empty()) {
      return Interval.EMPTY
    }
    return new Interval(Math.atan(x.lo), Math.atan(x.hi), x.def)
  }
}

export class IntervalSet {
  static EMPTY = new IntervalSet([])
  static WHOLE = new IntervalSet([Interval.WHOLE])

  constructor(intervals) {
    this.intervals = intervals
  }

  empty() {
    return this.intervals.length === 0
  }

  includes(val) {
    for (let i of this.intervals) {
      if (i.includes(val)) {
        return true
      }
    }
    return false
  }

  length() {
    return this.intervals.length
  }

  def() {
    for (let i of this.intervals) {
      if (!i.def) {
        return false
      }
    }
    return true
  }

  binaryOp(rhs, opFunc) {
    const intervals = []
    for (let i of this.intervals) {
      for (let j of rhs.intervals) {
        const r = opFunc(i, j)
        if (!r.empty()) {
          intervals.push(r)
        }
      }
    }
    return new IntervalSet(intervals)
  }

  unaryOp(opFunc) {
    const intervals = []
    for (let i of this.intervals) {
      const r = opFunc(i)
      if (!r.empty()) {
        intervals.push(r)
      }
    }
    return new IntervalSet(intervals)
  }

  compareOp(rhs, opFunc) {
    if (this.empty() || rhs.empty()) {
      return FALSE
    }

    let allTrue = true
    let allFalse = true

    for (let a of this.intervals) {
      for (let b of rhs.intervals) {
        switch (opFunc(a, b)) {
          case TRUE:
            allFalse = false
            break
          case FALSE:
            allTrue = false
            break
          case MAYBE:
            return MAYBE
        }

        if (!allTrue && !allFalse) {
          return MAYBE
        }
      }
    }

    if (allTrue) {
      return TRUE
    } else if (allFalse) {
        return FALSE
    } else {
        return MAYBE
    }
  }

  add(rhs) {
    return this.binaryOp(rhs, (i, j) => i.add(j))
  }

  sub(rhs) {
    return this.binaryOp(rhs, (i, j) => i.sub(j))
  }

  mul(rhs) {
    return this.binaryOp(rhs, (i, j) => i.mul(j))
  }

  div(rhs) {
    const intervals = []
    for (let i of this.intervals) {
      for (let j of rhs.intervals) {
        const {lo: a, hi: b} = i
        const {lo: c, hi: d} = j

        if (!j.includes(0)) {
          intervals.push(i.mul(new Interval(1 / d, 1 / c)))
        } else if (i.includes(0) && j.includes(0)) {
          return IntervalSet.WHOLE
        } else if (d === 0 && b < 0 && c < d) {
          intervals.push(new Interval(b / c, Infinity))
        } else if (b < 0 && c < 0 && d > 0) {
          intervals.push(new Interval(-Infinity, b / d), new Interval(b / c, Infinity))
        } else if (c === 0 && b < 0 && c < d) {
          intervals.push(new Interval(-Infinity, b / d))
        } else if (d === 0 && a > 0 && c < d) {
          intervals.push(new Interval(-Infinity, a / c))
        } else if (a > 0 && c < 0 && d > 0) {
          intervals.push(new Interval(-Infinity, a / c), new Interval(a / d, Infinity))
        } else if (c === 0 && a > 0 && d > c) {
          intervals.push(new Interval(a / d, Infinity))
        } else {
          continue
        }
      }
    }
    return new IntervalSet(intervals)
  }

  static sin(x) {
    return x.unaryOp(Interval.sin)
  }

  static cos(x) {
    return x.unaryOp(Interval.cos)
  }

  static exp(x) {
    return x.unaryOp(Interval.exp)
  }

  static sqrt(x) {
    return x.unaryOp(Interval.sqrt)
  }

  static log(x) {
    return x.unaryOp(Interval.log)
  }

  static arcsin(x) {
    return x.unaryOp(Interval.arcsin)
  }

  static arccos(x) {
    return x.unaryOp(Interval.arccos)
  }

  static arctan(x) {
    return x.unaryOp(Interval.arctan)
  }

  equal(rhs) {
    return this.compareOp(rhs, (i, j) => i.equal(j))
  }

  lessThan(rhs) {
    return this.compareOp(rhs, (i, j) => i.lessThan(j))
  }

  lessEqualThan(rhs) {
    return this.compareOp(rhs, (i, j) => i.lessEqualThan(j))
  }

  greaterThan(rhs) {
    return this.compareOp(rhs, (i, j) => i.greaterThan(j))
  }

  greaterEqualThan(rhs) {
    return this.compareOp(rhs, (i, j) => i.greaterEqualThan(j))
  }
}
