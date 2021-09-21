<template>
  <div class="kukudoge">
    <p class="log">{{ log }}</p>
    <div class="game-space" :style="resolveGameSpaceWidthHeight()">
      <!-- 裤裤的位置 -->
      <div class="kuku" :style="resolvePositonAndDirection()" ref="kuku">🐕</div>
      <!-- 地图 -->
      <div class="map">
        <div v-for="(col, i) in gameSpace[0]" :key="i" class="game-space-h">
          <div v-for="(row, j) in gameSpace[1]" :key="j" class="game-space-w" :class="resolveCellKind(i, j)"></div>
        </div>
      </div>
    </div>
    <!-- 状态提示 -->
    <div class="kuku-state">
      <p class="tips">裤存:<span v-for="(item, i) in kuku.shits" :key="i">💩</span></p>
    </div>
    <!-- PC UI -->
    <div class="tips-content">
      <p class="tips">⬅️➡️移动，🔼上楼， ⬇️下楼/拉💩</p>
    </div>
    <!-- 移动端 UI -->
    <div class="mobile-ui">
      <div class="line">
        <div class="button" @click="kukuGo('left')">⬅️</div>
        <div class="button" @click="kukuShit()">💩</div>
        <div class="button" @click="kukuGo('right')">➡️</div>
      </div>
      <div class="line">
        <div class="button" @click="kukuGoDown()">⬇️</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gameSpace: [10, 6], // 游戏网格的数量 [ 横, 纵向]
      gameCell: [30, 1], // 游戏单个网格的大小 [大小,网格间隔尺寸]
      kuku: {
        // 裤裤的属性参数
        position: [0, 0], // 裤裤的位置参数
        direction: 1, // 裤裤的朝向，1 代表右，-1 代表左
        shits: 4, // 还可以拉的次数
      },
      cellKind: [
        // 记录地形 0 代表空，1 代表地面， 2 代表床，3 代表粑粑  ，4 代表梯子
        '0000000000/',
        '1111101141/',
        '0000000040/',
        '1114110111/',
        '0004000002/',
        '1111110111/',
      ],
      log: '控制一只叫【裤裤】的 🐕 把 💩拉在 🛌上', // logo
    }
  },
  created: function () {
    // 添加全局快捷键监听
    var _this = this
    document.onkeydown = function () {
      let key = window.event.keyCode
      if (key == 32 || key == 37 || key == 38 || key == 39 || key == 40) {
        _this.onType(key)
      }
    }
  },
  methods: {
    resolvePositonAndDirection() {
      //计算裤裤的坐标和朝向
      const x = this.kuku.position[0] * (this.gameCell[0] + 2 * this.gameCell[1])
      const y = this.kuku.position[1] * (this.gameCell[0] + 2 * this.gameCell[1])
      const direction = this.kuku.direction
      return 'left:' + x + 'px; top:' + y + 'px;' + 'transform:scaleX(' + -1 * direction + ')'
    },
    resolveGameSpaceWidthHeight() {
      //计算地图的大小
      const width = (this.gameCell[0] + 2 * this.gameCell[1]) * this.gameSpace[0]
      const height = (this.gameCell[0] + 2 * this.gameCell[1]) * this.gameSpace[1]
      return 'width:' + width + 'px; height:' + height + 'px;'
    },
    resolveCellKind(i, j) {
      //绘制地形
      let kind = 0
      if (j < this.cellKind.length) {
        kind = this.cellKind[j][i]
      } else {
        kind = 1
      }
      return 'cell-kind-' + kind
    },
    onType(key) {
      //监听快捷键 38 代表上，40 代表下，37 代表左，39 代表右，32 代表空格
      switch (key) {
        case 37:
          this.kukuGo('left')
          break
        case 38:
          this.kukuClimbUp()
          break
        case 40:
          this.kukuDown()
          break
        case 39:
          this.kukuGo('right')
          break
        case 32:
          this.log = '裤裤想跳，但是我没做这个功能'
          break
        default:
      }
    },
    kukuGo(direction) {
      // 裤裤的行动
      let target = [] //想去哪
      let directionIsOk = false //方向是否正确
      if (direction == 'left') {
        //去左边的话
        target = [this.kuku.position[0] - 1, this.kuku.position[1]]
        if (this.kuku.direction == -1) {
          directionIsOk = true
        } else {
          this.kuku.direction = -1 //向左转
        }
      } else if (direction == 'right') {
        //去右边的话
        target = [this.kuku.position[0] + 1, this.kuku.position[1]]
        if (this.kuku.direction == 1) {
          directionIsOk = true
        } else {
          this.kuku.direction = 1 //向右转
        }
      }
      if (this.canKukuGo(target) && directionIsOk) {
        //测试能去
        this.$set(this.kuku, 'position', [target[0], target[1]])
        this.log = '裤裤移动了'
      } else {
        //如果没有移动
        if (directionIsOk) {
          //是不能去的地方
          this.log = '裤裤想去不能去'
        } else {
          //换个方向
          this.log = '裤裤掉头了'
        }
      }
    },
    canKukuGo(target) {
      // 裤裤能行么
      if ((this.isTargetBlank(target) || this.isTargetLadder(target)) && this.isTargetNotCliff(target)) {
        return true
      } else {
        return false
      }
    },
    isTargetLadder(target) {
      //前面是梯子
      const cellTarget = this.cellKind[target[1]][target[0]]
      if (this.isInMap(target) && cellTarget === '4') {
        return true
      } else {
        return false
      }
    },
    isTargetBlank(target) {
      //前面是空地
      const cellTarget = this.cellKind[target[1]][target[0]]
      if (this.isInMap(target) && cellTarget === '0') {
        return true
      } else if (cellTarget === '2') {
        return true
      } else {
        return false
      }
    },
    isInMap(target) {
      //在地图中
      if (target[0] >= 0 && target[1] >= 0 && target[0] < this.gameSpace[0] && target[1] < this.gameSpace[1]) {
        return true
      } else {
        return false
      }
    },
    isTargetNotCliff(target) {
      //前面不是悬崖
      const cellUnderTarget = this.cellKind[target[1] + 1][target[0]]
      if (cellUnderTarget !== '0') {
        return true
      } else {
        return false
      }
    },
    targetIsBed(target) {
      //前面是床
      const cellTarget = this.cellKind[target[1]][target[0]]
      if (cellTarget === '2') {
        return true
      } else {
        return false
      }
    },
    kukuShit() {
      //控制裤裤拉粑粑
      let target = [this.kuku.position[0] - this.kuku.direction, this.kuku.position[1]]
      if (this.targetAllows(target)) {
        this.kuku.shits -= 1
        target = this.testTarget(target)
        if (this.targetIsBed(target)) {
          this.startShit(target)
          this.log = '💩拉床上了!!!!!!!!!!!!!!'
          alert('YOU WIN : 💩拉床上了!!!!!!!!!!!!!!')
        } else {
          this.startShit(target)
        }
      } else {
        this.log = '不能在这里拉'
      }
    },
    startShit(target) {
      //开始拉
      this.log = '裤裤拉屎了' //说明
      this.changeCell(target, 3) //变化地形
    },
    targetAllows(target) {
      //当前地形是否允许拉
      if (this.isTargetBlank(target) || this.isTargetLadder(target)) {
        return true
      } else {
        return false
      }
    },
    changeCell(target, _kind) {
      //地形变化函数
      const arr = this.cellKind[target[1]] //要变化的数据
      this.cellKind[target[1]] = this.replaceArr(arr, target[0] + 1, 3)
    },
    replaceArr(arr, order, to) {
      return arr.substring(0, order - 1) + to + arr.substring(order)
    },
    testTarget(target) {
      if (!this.isTargetNotCliff(target)) {
        return [target[0], target[1] + 1]
      } else {
        return target
      }
    },
    kukuClimbUp() {
      if (this.canUp()) {
        this.log = '向上爬'
        const target = [this.kuku.position[0], this.kuku.position[1] - 1]
        this.$set(this.kuku, 'position', [target[0], target[1]])
      }
    },
    canUp() {
      const now = [this.kuku.position[0], this.kuku.position[1]]
      if (this.kuku.position[1] > 0 && this.isTargetLadder(now)) {
        return true
      } else {
        this.log = '裤裤想上去，但是上不去'
        return false
      }
    },
    kukuDown() {
      const target = [this.kuku.position[0], this.kuku.position[1] + 1]
      if (this.isTargetLadder(target)) {
        this.log = '裤裤下楼了'
        this.$set(this.kuku, 'position', [target[0], target[1]])
      } else {
        if (this.kuku.shits > 0) {
          this.kukuShit()
        } else {
          this.log = '没有料了'
        }
      }
    },
    kukuGoDown() {
      const target = [this.kuku.position[0], this.kuku.position[1] + 1]
      if (this.isTargetLadder(target)) {
        this.log = '下楼了'
        this.$set(this.kuku, 'position', [target[0], target[1]])
      } else {
        this.log = '裤裤想下去，下不去'
      }
    },
  },
}
</script>

<style lang="stylus">
// 变量
$game-cell = 30px
$game-cell-margin = 1px
// 绘制裤裤
.kukudoge
  .game-space
    position relative
    margin auto
    .kuku
      width $game-cell
      height $game-cell
      position absolute
      margin $game-cell-margin
      line-height $game-cell
      transition .2s left ease-in-out, .2s top ease-in-out
      font-size 24px
      z-index 100
// 游戏区域绘制
.kukudoge
  .game-space .map
    overflow hidden
    background-color #f5f5f5
    margin 60px auto
    display flex
    flex-direction row
    justify-content: center
    .game-space-h
      width 100%
      display flex
      flex-direction column
      justify-content: flex-start
      width $game-cell
      margin 0 $game-cell-margin
      .game-space-w
        background-color #ccc
        height 100%
        margin $game-cell-margin 0
        width $game-cell
        height $game-cell
// 游戏地形绘制
.kukudoge
  .game-space .map .game-space-h .game-space-w
    &.cell-kind-0  // 空洞地形
      background-color #f5f5f5
    &.cell-kind-1  // 地面地形
      background-color #000
    &.cell-kind-2  // 床地形
      position relative
      &:before
        content '🛌'
        display block
        width $game-cell
        height $game-cell
        line-height $game-cell
        text-align center
        font-size 24px
    &.cell-kind-3  // 粑粑地形
      position relative
      &:before
        content '💩'
        display block
        width $game-cell
        height $game-cell
        line-height $game-cell
        text-align center
        font-size 24px
    &.cell-kind-4  // 梯子地形
      background url('../assets/tizi.svg') 100%
// 游戏 UI-PC
.kukudoge
  .log
    display block
    width 100%
    height 40px
    margin auto
    background-color #ebebeb
    color #333
    line-height 40px
    font-size 14px
  .tips
    text-align center
    font-size 16px
    color #999
    margin 14px 0
  .tips-content
    width 320px
    margin 40px auto
  @media (max-device-width: 500px)
    .tips-content
      display none
// 游戏 UI-移动端
.kukudoge
  .mobile-ui
    display none
  @media (max-device-width: 500px)
    .mobile-ui
      display block
      margin 60px auto
      width 280px
      .line
        width 280px
        display flex
        margin 0 0 20px 0
        justify-content center
      .button
        display block
        width 50px
        height 50px
        background-color #f5f5f5
        font-size 24px
        line-height 50px
        margin 0 10px
// 状态提示栏
.kukudoge .kuku-state
  margin 24px 0
  background-color #f5f5f5
  width 320px
  margin auto
  height 40px
  p
    line-height 32px
    font-size 14px
    text-align left
    padding 0 12px
    span
      font-size 24px
      line-height 34px
      position relative
      top 4px
      &:first-child
        margin-left 12px
</style>
