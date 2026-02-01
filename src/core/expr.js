import { Interval, IntervalSet } from "./interval.js"

/**
 * 表达式树节点
 */
export function Expr(evalFunc, evalIntervalFunc, evalIntervalSetFunc) {
  return {
    eval: evalFunc,
    evalInterval: evalIntervalFunc,
    evalIntervalSet: evalIntervalSetFunc,
    add(rhs) {
      return (typeof rhs === 'number') ? Add(this, Const(rhs)) :  Add(this, rhs)
    },
    sub(rhs) {
      return (typeof rhs === 'number') ? Sub(this, Const(rhs)) : Sub(this, rhs)
    },
    mul(rhs) {
      return (typeof rhs === 'number') ? Mul(this, Const(rhs)) : Mul(this, rhs)
    },
    div(rhs) {
      return (typeof rhs === 'number') ? Div(this, Const(rhs)) : Div(this, rhs)
    },
    square() {
      return this.mul(this)
    },
    cube() {
      return this.mul(this).mul(this)
    },
    quad() {
      return this.square().square()
    }
  }
}

export function Const(val) {
  const interval = new Interval(val)
  const intervalSet = new IntervalSet([interval])
  return Expr((x, y, z) => val, (xi, yi, zi) => interval, (xs, ys, zs) => intervalSet)
}

export const X = Expr((x, y, z) => x, (xi, yi, zi) => xi, (xs, ys, zs) => xs)
export const Y = Expr((x, y, z) => y, (xi, yi, zi) => yi, (xs, ys, zs) => ys)
export const Z = Expr((x, y, z) => z, (xi, yi, zi) => zi, (xs, ys, zs) => zs)

export function Add(lhs, rhs) {
  return Expr(
    (x, y, z) => lhs.eval(x, y, z) + rhs.eval(x, y, z), 
    (xi, yi, zi) => lhs.evalInterval(xi, yi, zi).add(rhs.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => lhs.evalIntervalSet(xs, ys, zs).add(rhs.evalIntervalSet(xs, ys, zs))
  )
}

export function Sub(lhs, rhs) {
  return Expr(
    (x, y, z) => lhs.eval(x, y, z) - rhs.eval(x, y, z), 
    (xi, yi, zi) => lhs.evalInterval(xi, yi, zi).sub(rhs.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => lhs.evalIntervalSet(xs, ys, zs).sub(rhs.evalIntervalSet(xs, ys, zs))
  )
}

export function Mul(lhs, rhs) {
  return Expr(
    (x, y, z) => lhs.eval(x, y, z) * rhs.eval(x, y, z), 
    (xi, yi, zi) => lhs.evalInterval(xi, yi, zi).mul(rhs.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => lhs.evalIntervalSet(xs, ys, zs).mul(rhs.evalIntervalSet(xs, ys, zs))
  )
}

export function Div(lhs, rhs) {
  return Expr(
    (x, y, z) => lhs.eval(x, y, z) / rhs.eval(x, y, z), 
    (xi, yi, zi) => lhs.evalInterval(xi, yi, zi).div(rhs.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => lhs.evalIntervalSet(xs, ys, zs).div(rhs.evalIntervalSet(xs, ys, zs))
  )
}

export function Cos(e) {
  return Expr(
    (x, y, z) => Math.cos(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.cos(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.cos(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Sin(e) {
  return Expr(
    (x, y, z) => Math.sin(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.sin(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.sin(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Tan(e) {
  return Sin(e).div(Cos(e))
}

export function Exp(e) {
  return Expr(
    (x, y, z) => Math.exp(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.exp(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.exp(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Sqrt(e) {
  return Expr(
    (x, y, z) => Math.sqrt(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.sqrt(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.sqrt(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Ln(e) {
  return Expr(
    (x, y, z) => Math.log(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.log(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.log(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Arcsin(e) {
  return Expr(
    (x, y, z) => Math.asin(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.arcsin(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.arcsin(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Arccos(e) {
  return Expr(
    (x, y, z) => Math.acos(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.arccos(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.arccos(e.evalIntervalSet(xs, ys, zs))
  )
}

export function Arctan(e) {
  return Expr(
    (x, y, z) => Math.atan(e.eval(x, y, z)),
    (xi, yi, zi) => Interval.arctan(e.evalInterval(xi, yi, zi)),
    (xs, ys, zs) => IntervalSet.arctan(e.evalIntervalSet(xs, ys, zs))
  )
}
