import { Interval, IntervalSet } from "./interval.js"

/**
 * 绘制三维隐式曲面
 * expr: 隐式曲面表达式
 * xi: x绘制范围
 * yi: y绘制范围
 * zi: z绘制范围
 * eps: 最小区间长度 
 * drawFunc: 绘制回调函数 
 */
export function plotExpr(expr, xi, yi, zi, eps, drawFunc) {
  // 处理当前区域，xi、yi和zi为Interval类型，分别表示x、y和z的范围
  function processRange(xi, yi, zi) {
    if (xi.length() <= eps && yi.length() <= eps && zi.length() <= eps) { // 达到细分最小尺寸
      const xs = new IntervalSet([xi])
      const ys = new IntervalSet([yi])
      const zs = new IntervalSet([zi])
      if (expr.evalIntervalSet(xs, ys, zs).includes(0)) {
        drawFunc(xi, yi, zi)
      }
    } else { // 未达到细分最小尺寸
      const xs = new IntervalSet([xi])
      const ys = new IntervalSet([yi])
      const zs = new IntervalSet([zi])
      if (expr.evalIntervalSet(xs, ys, zs).includes(0)) {
        // 无法判断当前区域是否满足关系式，将当前区域一分为八，递归处理
        const xm = (xi.lo + xi.hi) / 2
        const ym = (yi.lo + yi.hi) / 2
        const zm = (zi.lo + zi.hi) / 2
        processRange(new Interval(xi.lo, xm), new Interval(yi.lo, ym), new Interval(zi.lo, zm))
        processRange(new Interval(xi.lo, xm), new Interval(ym, yi.hi), new Interval(zi.lo, zm))
        processRange(new Interval(xm, xi.hi), new Interval(yi.lo, ym), new Interval(zi.lo, zm))
        processRange(new Interval(xm, xi.hi), new Interval(ym, yi.hi), new Interval(zi.lo, zm))
        processRange(new Interval(xi.lo, xm), new Interval(yi.lo, ym), new Interval(zm, zi.hi))
        processRange(new Interval(xi.lo, xm), new Interval(ym, yi.hi), new Interval(zm, zi.hi))
        processRange(new Interval(xm, xi.hi), new Interval(yi.lo, ym), new Interval(zm, zi.hi))
        processRange(new Interval(xm, xi.hi), new Interval(ym, yi.hi), new Interval(zm, zi.hi))
      }
    }
  }

  processRange(xi, yi, zi)
}
