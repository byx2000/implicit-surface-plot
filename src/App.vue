<template>
  <div class="container">
    <div ref="graphContainer"></div>
    <div>
      <div>
        <input type="checkbox" id="showWire" v-model="showWire">
        <label for="showWire">显示网格</label>
      </div>
      <div>
        <label for="subdivisionLevel">细分等级：</label>
        <input type="range" id="subdivisionLevel" min="4" max="8" v-model="subdivisionLevel">
        <span>{{ subdivisionLevel }}</span>
      </div>
      <div>
        <label for="color">颜色：</label>
        <input type="color" id="color" v-model="color">
      </div>
      <hr/>
      <div v-for="{name}, index in surfaces">
        <input type="radio" :id="name" name="surface" :value="index" v-model="selectedSurfaceIndex">
        <label :for="name">{{ name }}</label>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { onMounted, ref, watch } from 'vue'
import { Const, Cos, Ln, Sin, Sqrt, X, Y, Z } from './core/expr'
import { Interval } from './core/interval'
import { plotExpr } from './core/plot'
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js'
import { marchingCubes } from './core/marchingCubes'

const graphContainer = ref()

const surfaces = [
  {
    name: '球面',
    expr: X.square().add(Y.square()).add(Z.square()).sub(20)
  },
  {
    name: '椭球面',
    expr: X.square().div(20).add(Y.square().div(12)).add(Z.square().div(8)).sub(1)
  },
  {
    name: '单叶双曲面',
    expr: X.square().add(Y.square()).sub(Z.square()).sub(2)
  },
  {
    name: '双叶双曲面',
    expr: X.square().sub(Y.square()).sub(Z.square()).sub(1)
  },
  {
    name: '圆柱面',
    expr: X.square().add(Y.square()).sub(10)
  },
  {
    name: '圆锥面',
    expr: X.square().add(Y.square()).sub(Z.square())
  },
  {
    name: '抛物面',
    expr: X.square().add(Y.square()).mul(0.5).sub(Z)
  },
  {
    name: '马鞍面',
    expr: X.square().div(3).sub(Y.square().div(4)).sub(Z)
  },
  {
    name: '甜甜圈',
    expr: Sqrt(X.square().add(Y.square())).sub(2).square().add(Z.square()).sub(1)
  },
  {
    name: '爱心',
    expr: X.square().div(9).add(Y.square().div(4)).add(Z.square().div(9)).sub(1).cube().mul(243).sub(X.square().mul(Z.cube())).sub(Y.square().mul(Z.cube()).mul(9 / 80))
  },
  {
    name: '牛子',
    expr: Z.square().add(Y.square()).add(X.sub(3).mul(2)).sub(1).cube().sub(Z.square().add(Y.square()).mul(X.sub(3).cube())).sub(1)
  },
  {
    name: '螺旋面',
    expr: X.mul(Sin(Z)).sub(Y.mul(Cos(Z)))
  },
  {
    name: '酒杯',
    expr: X.square().add(Y.square()).sub(Ln(Z.add(3.2)).square()).sub(0.02)
  },
  {
    name: '戒指',
    expr: X.square().add(Y.square()).add(Z.square()).add(6.8).square().sub(X.mul(2.8).sub(0.45).square().add(Y.square().mul(8)).mul(4))
  },
  {
    name: '双洞曲面',
    expr: Y.mul(Y.square().sub(X.square().mul(3))).mul(Const(36).sub(Z.square().mul(9))).add(X.square().mul(3).add(Y.square().mul(3)).square()).sub(Z.square().mul(9).sub(4).mul(Const(36).sub(Z.square().mul(9))))
  },
  {
    name: 'Blum-Carnicer曲面',
    expr: X.square().add(Y.square()).sub(5.76).square().add(Z.square().sub(9).square())
            .mul(Y.square().add(Z.square()).sub(5.76).square().add(X.square().sub(9).square()))
            .mul(Z.square().add(X.square()).sub(5.76).square().add(Y.square().sub(9).square()))
            .sub(15943)
  },
  {
    name: '凯莱三次曲面',
    expr: X.square().add(Y.square()).sub(X.square().mul(Z)).add(Y.square().mul(Z)).add(Z.square()).sub(1)
  },
  {
    name: '水滴',
    expr: X.quad().mul(X).mul(0.5).add(X.quad().mul(1.5)).sub(Y.square().mul(27)).sub(Z.square().mul(27))
  },
  {
    name: 'Tanglecube',
    expr: X.quad().sub(X.square().mul(5)).add(Y.quad()).sub(Y.square().mul(5)).add(Z.quad()).sub(Z.square().mul(5)).add(11.8)
  },
  {
    name: '车轮',
    expr: X.quad().add(Y.square().add(Z.square()).square()).mul(4).add(X.square().mul(Y.square().add(Z.square())).mul(17)).sub(X.square().add(Y.square()).add(Z.square()).mul(20)).add(17)
  },
  {
    name: '双环',
    expr: X.square().mul(4).add(Y.mul(2).sub(2).square()).add(Z.square().mul(4)).add(12).square().sub(X.square().mul(4).add(Y.mul(2).sub(2).square()).mul(53))
            .mul(Z.square().mul(4).add(Y.mul(2).add(2).square()).add(X.square().mul(4)).add(12).square().sub(Z.square().mul(4).add(Y.mul(2).add(2).square()).mul(53)))
            .add(1000)
  },
]

const selectedSurfaceIndex = ref(0)
const showWire = ref(true)
const subdivisionLevel = ref(6)
const color = ref('#2d70b3')

function createScene(expr, showWire, subdivisionLevel, color) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#ffffff')

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: '#27081d',
    transparent:true,
    opacity: 0.3,
    wireframe: true,
  })
  const solidMaterial = new THREE.MeshPhongMaterial({
    color,
    side: THREE.DoubleSide,
    shininess: 50,
  })
  const geometries = []
  plotExpr(
    expr,
    new Interval(-5, 5), new Interval(-5, 5), new Interval(-5, 5),
    10 / (1 << subdivisionLevel),
    (xi, yi, zi) => {
      for (let geo of marchingCubes(expr, xi, yi, zi)) {
        geometries.push(geo)
      }
    }
  )

  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
  const solidMesh = new THREE.Mesh(mergedGeometry, solidMaterial)
  solidMesh.position.set(0, 0, 0)
  scene.add(solidMesh)

  if (showWire) {
    const wireMesh = new THREE.Mesh(mergedGeometry, wireMaterial)
    wireMesh.position.set(0, 0, 0)
    scene.add(wireMesh)
  }

  // AxesHelper：辅助观察的坐标系
  const axesHelper = new THREE.AxesHelper(150)
  scene.add(axesHelper)

  // 环境光
  const light = new THREE.AmbientLight('#ffffff', 0.3)
  scene.add(light)

  return scene
}

function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000)
  camera.position.set(10, 10, 10)
  camera.lookAt(0, 0, 0)
  camera.up.set(0, 0, 1)

  // 相机光源
  const light = new THREE.PointLight('#ffffff', 50, 0, 1)
  light.position.set(0, 0, -1)
  camera.add(light)

  return camera
}

function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  return renderer
}

onMounted(() => {
  const width = 800
  const height = 500

  const camera = createCamera(width, height)
  const renderer = createRenderer(width, height)
  graphContainer.value.appendChild(renderer.domElement)

  let scene = null

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', function () {
    renderer.render(scene, camera)
  })
  controls.enableDamping = true

  watch([selectedSurfaceIndex, showWire, subdivisionLevel, color], () => {
    scene = createScene(surfaces[selectedSurfaceIndex.value].expr, showWire.value, subdivisionLevel.value, color.value)
    scene.add(camera)
    renderer.render(scene, camera)
  }, {immediate: true})
})
</script>

<style scoped>
.container {
  display: flex;
}
</style>
