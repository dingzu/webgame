<template>
  <div class="kukudoge">
    这是一个小游戏
    游戏区域大小 
    <input type="text" v-model.number="gameSpace[0]"/> x 
    <input type="text" v-model.number="gameSpace[1]"/>
    <p>当前裤裤在</p>
    <input type="text" v-model.number="kuku.position[0]"/> ,
    <input type="text" v-model.number="kuku.position[1]"/>
    <p>现在发生了啥子: {{log}}</p>
    <p>游戏目标: 控制 裤裤doge 把粑粑拉在床上</p>
    <p>注释: 黑色是墙，黄色是床，褐色是粑粑，左右方向键移动，下键拉粑粑（0.2版本,可以无限拉）</p>
    <div class="game-space" :style="resolveGameSpaceWidthHeight()">
      <!-- 裤裤的位置 -->
      <div class="kuku" :style="resolvePositonAndDirection()" ref="kuku">➤</div>
      <!-- 地图 -->
      <div class="map">
        <div v-for="(col,i) in gameSpace[0]" :key="i" class="game-space-h">
          <div v-for="(row,j) in gameSpace[1]" :key="j" class="game-space-w" :class="resolveCellKind(i,j)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            gameSpace: [10,6],  // 游戏网格的数量 [ 横, 纵向]
            gameCell: [30, 1],  // 游戏单个网格的大小 [大小,网格间隔尺寸]
            kuku: {             // 裤裤的属性参数
              position: [1,1],  // 裤裤的位置参数
              direction: 1,     // 裤裤的朝向，1 代表右，-1 代表左
            },
            cellKind: [        // 记录地形 0 代表空，1 代表地面， 2 代表床，3 代表粑粑  ，4 代表梯子
               '1111111111/' ,
               '1111111111/' ,
               '1111111111/' ,
               '1111111111/' ,
               '0000000002/' ,
               '1111110111/' ,
            ],       
            log: '啥子都没发生' // logo
        }
    },
    created: function() {       // 添加全局快捷键监听  
        var _this = this;
        document.onkeydown = function(e) {
            let key = window.event.keyCode;
            if (key == 32 || key == 37 || key == 38 || key == 39 || key == 40) {
                _this.onType(key);
            }
        };
    },
    methods : {
        resolvePositonAndDirection() { //计算裤裤的坐标和朝向
            const x = this.kuku.position[0] * (this.gameCell[0] + 2 * this.gameCell[1])
            const y = this.kuku.position[1] * (this.gameCell[0] + 2 * this.gameCell[1])
            const direction = this.kuku.direction
            return "left:" + x +"px; bottom:"+ y +"px;" + "transform:scale("+direction +")"
        },
        resolveGameSpaceWidthHeight() { //计算地图的大小
            const width = (this.gameCell[0]+ 2 * this.gameCell[1]) * this.gameSpace[0]
            const height = (this.gameCell[0]+ 2 * this.gameCell[1]) * this.gameSpace[1]
            return "width:" + width +"px; height:"+ height +"px;"
        },
        resolveCellKind(i,j) { //绘制地形
            const kind = this.cellKind[j][i]
            return "cell-kind-" + kind
        },
        onType(key) { //监听快捷键 38 代表上，40 代表下，37 代表左，39 代表右，32 代表空格
            switch(key) {
              case 37: this.kukuGo('left')
              break;
              case 38: this.log = "裤裤想往上走，但是这里没有梯子"
              break;
              case 40: this.kukuShit()
              break;
              case 39: this.kukuGo('right')
              break;
              case 32: this.log = "裤裤想跳，但是我没做这个功能"
              break;
              default:
            } 
        },
        kukuGo(direction) { // 裤裤的行动
            let target = []   //想去哪
            let directionIsOk = false //方向是否正确
            if (direction == 'left') {   //去左边的话
                target = [this.kuku.position[0]-1,this.kuku.position[1]]
                if (this.kuku.direction == -1) {
                    directionIsOk = true
                } else {
                    this.kuku.direction = -1  //向左转
                }
            }
            else if (direction == 'right') {   //去右边的话
                target = [this.kuku.position[0]+1,this.kuku.position[1]]
                if (this.kuku.direction == 1) {
                    directionIsOk = true
                } else {
                    this.kuku.direction = 1  //向右转
                }
            }
            if (this.canKukuGo(target) && directionIsOk ){ //测试能去
                this.$set(this.kuku, 'position', [target[0],target[1]])
                this.log = "裤裤移动了"
            } else { //如果没有移动
                if (directionIsOk) {   //是不能去的地方
                    this.log = "裤裤想去不能去"
                } else {              //换个方向
                    this.log = "裤裤掉头了"
                }
            }
        },
        canKukuGo(target) { // 裤裤能行么
            if(this.isTargetBlank(target) && this.isTargetNotCliff(target)) {
                return true
            } else {
                return false
            }
        },
        isTargetBlank(target){ //前面是空地
            const newArry =[...this.cellKind].reverse() //获取地形数据
            const cellTarget = newArry[target[1]][target[0]]
            if(this.isInMap(target) && cellTarget === '0') {
                return true
            } else if (cellTarget === '2'){
                return true
            } else {
                return false
            }
        },
        isInMap(target){ //在地图中
            if(target[0]>=0 && target[1]>=0 && target[0]< this.gameSpace[0] && target[1]< this.gameSpace[1]) {
                return true
            } else {
                return false
            }
        },
        isTargetNotCliff(target){ //前面不是悬崖
            const newArry =[...this.cellKind].reverse() //获取地形数据
            const cellUnderTarget = newArry[target[1]-1][target[0]]
            if (cellUnderTarget !== '0') {
                return true
            } else {
                return false
            }
        },
        targetIsBed(target){ //前面是床
            const newArry =[...this.cellKind].reverse() //获取地形数据
            const cellTarget = newArry[target[1]][target[0]]
            if(cellTarget === '2') {
                return true
            } else {
                return false
            }
        },
        kukuShit() { //控制裤裤拉粑粑
            const newArry =[...this.cellKind].reverse() //获取地形数据
            let target = [this.kuku.position[0] - this.kuku.direction,this.kuku.position[1]]
            if (this.targetAllows(target)) {
                target = this.testTarget(target)
                if (this.targetIsBed(target)) {
                   this.startShit(target)
                   this.log = "💩拉床上了!!!!!!!!!!!!!!"
                   alert("💩拉床上了!!!!!!!!!!!!!!")
                } else {
                   this.startShit(target)
                }
            } else {
                this.log = "不能在这里拉"
            }
        },
        startShit(target){ //开始拉
            this.log = "裤裤拉屎了" //说明
            this.changeCell(target, 3) //变化地形
        },
        targetAllows(target) { //当前地形是否允许拉
           if (this.isTargetBlank(target)){  
               return true
           } else {
               return false
           }
        },
        changeCell(target, kind){ //地形变化函数
           const arr = this.cellKind[this.gameSpace[1]-target[1]-1] //要变化的数据
           this.cellKind[this.gameSpace[1]-target[1]-1] = this.replaceArr(arr, target[0]+1, 3)
        },
        replaceArr(arr, order, to){
           return arr.substring(0,order-1)+to+arr.substring(order);
        },
        testTarget(target){
           if (!this.isTargetNotCliff(target)){
               return [target[0],target[1]-1]
           } else {
               return target
           }
        }
    }
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
      background-color red
      position absolute
      margin $game-cell-margin
      color #fff
      line-height $game-cell
      transition .2s left ease-in-out
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
      background-color #ffff00
    &.cell-kind-3  // 粑粑地形
      background-color brown
</style>