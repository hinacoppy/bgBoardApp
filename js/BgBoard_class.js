// BgBoard_class.js
'use strict';

class BgBoard {
  constructor(game) {
    this.gameObj = game;
    this.mainBoard = $('#board'); //need to define before bgBoardConfig()
    this.bgBoardConfig();
    this.setDomNameAndStyle();
    this.player = 0;
  } //end of constructor()

  setDomNameAndStyle() {
    let xh;
    //cube
    xh  = '<span id="cube" class="cubeclass fa-layers fa-fw cubecenter">';
    xh += '<i class="fas fa-square"></i>';
    xh += '<span class="fa-layers-text fa-inverse" data-fa-transform="shrink-8" style="font-weight:900">64</span>';
    xh += '</span>';
    this.mainBoard.append(xh);
    this.cube = $('#cube');
    this.cube.css(this.getPosObj(this.cubeX, this.cubeY[0]));

    //dice
    xh  = '<span id="dice10" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicePipColor[1] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turnColor[1] +'"></i></span>';
    xh += '<span id="dice11" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicePipColor[1] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turnColor[1] +'"></i></span>';
    xh += '<span id="dice20" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicePipColor[2] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turnColor[2] +'"></i></span>';
    xh += '<span id="dice21" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicePipColor[2] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turnColor[2] +'"></i></span>';
    this.mainBoard.append(xh);
    this.dice = [[],[$('#dice10'),$('#dice11')],[$('#dice20'),$('#dice21')]];
    this.dice[1][0].css(this.getPosObj(this.dice10X, this.diceY));
    this.dice[1][1].css(this.getPosObj(this.dice11X, this.diceY));
    this.dice[2][0].css(this.getPosObj(this.dice20X, this.diceY));
    this.dice[2][1].css(this.getPosObj(this.dice21X, this.diceY));

    //point triangles
    this.point = [];
    for (let i = 1; i < 25; i++) {
      const colfig = ((i>12) ? 1 : 0) * 2 + (i % 2); //0=under+even, 1=under+odd, 2=upper+even, 3=upper+odd
      const xh = '<div id="pt' + i + '" class="point ' + this.pointColorClass[colfig] + '"></div>';
      this.mainBoard.append(xh);
      this.point[i] = $('#pt' + i);
      const ey = (i > 12) ? 0 : this.mainBoardHeight - this.point[i].height();
      this.point[i].css(this.getPosObj(this.pointX[i], ey));
    }
    this.pointAll = $(".point");

    //stack counter
    this.stacks = [];
    for (let i = 0; i < 28; i++) {
      const xh = '<span id="st' + i + '" class="stack"></span>';
      this.mainBoard.append(xh);
      this.stacks[i] = $('#st' + i);
    }

    //Chequer
    this.chequer = [[],[],[]];
    for (let j = 1; j < 3; j++) {
      for (let i = 0; i < 15; i++) {
        this.chequer[j][i] = new Chequer(j, i);
        const xh = this.chequer[j][i].domhtml;
        this.mainBoard.append(xh);
        this.chequer[j][i].set_jQueryDom();
      }
    }

    this.offtray = [null, $('#offtray1'), $('#offtray2')];

  }

/**********************************
  resetBoard() {
    this.showBoard("XGID=--------------------------:0:0:0:00:0:0:0:0:0");
  }

  showBoard(xgidstr) { // input for XGID string
    this.showBoard2( new Xgid(xgidstr) );
  }
**************************************/

  showBoard2(xg) { // input for XGID object
    this.xgidstr = xg.xgidstr;
    if (xg.get_boff(0) < 0 || xg.get_boff(1) < 0) {
      alert("Invalid XGID!!\n" + xg.xgidstr + "\nbearoff(0)=" + xg.get_boff(0) + "\nbearoff(1)=" + xg.get_boff(1));
    }
    this.showPosition(xg);
    this.showDiceAll(xg.get_turn(), xg.get_dice(1), xg.get_dice(2));
    this.showCube(xg.get_cubepos(),xg.get_cube(),xg.get_dbloffer(),xg.get_crawford());
  }

  showCube(pos, val, offer, crawford){
    const cubepos = BgUtil.cvtTurnXg2Bd(pos);
    const cubeval = BgUtil.calcCubeDisp(val, crawford);
    this.cube.children("span").text(cubeval);
    this.cube.css(this.getPosObj(this.cubeX, this.cubeY[cubepos]))
             .removeClass("cubecenter turn1 turn2").addClass(this.cubePosClass[cubepos])
             .toggleClass("cubeoffer", offer);
    if (offer) {
      this.animateCube(500);
    }
  }

  showDiceAll(turn, d1, d2) {
    switch( BgUtil.cvtTurnXg2Bd(turn) ) {
    case 0:
      this.showDice(1, d1, 0);
      this.showDice(2, d2, 0);
      break;
    case 1:
      this.showDice(1, d1, d2);
      this.showDice(2, 0,  0);
      break;
    case 2:
      this.showDice(1, 0,  0);
      this.showDice(2, d1, d2);
      break;
    }
  }

  showDice(turn, d0, d1) {
    const dicepip = {0:"fa-square", 1:"fa-dice-one", 2:"fa-dice-two", 3:"fa-dice-three",
                     4:"fa-dice-four", 5:"fa-dice-five", 6:"fa-dice-six"};
    const diceclasses = "fa-dice-one fa-dice-two fa-dice-three fa-dice-four fa-dice-five fa-dice-six";
    this.dice[turn][0].children(".diceface").removeClass(diceclasses).addClass(dicepip[d0]);
    this.dice[turn][1].children(".diceface").removeClass(diceclasses).addClass(dicepip[d1]);
    (d0 == 0) ? this.dice[turn][0].hide() : this.dice[turn][0].show();
    (d1 == 0) ? this.dice[turn][1].hide() : this.dice[turn][1].show();
  }

  showPosition(xg) {
    let piecePointer = [0, 0, 0];
    for (let pt = 0; pt <= 25; pt++) {
      const num = xg.get_ptno(pt);
      const player = BgUtil.cvtTurnXg2Bd(xg.get_ptcol(pt));
      for (let j = 0; j < num; j++) {
        this.chequer[player][piecePointer[player]].point = pt;
        this.chequer[player][piecePointer[player]].stack = num;
        piecePointer[player] += 1;
      }
    }

    // now move any unused pieces to the off tray
    for (let player = 1; player <= 2; player++) {
      for (let i = piecePointer[player]; i < 15; i++) {
        const pt = (player == 2) ? 26 : 27;
        this.chequer[player][i].point = pt;
        this.chequer[player][i].stack = 15 - piecePointer[player];
      }
    }

    let ex, ey, ty, sf;
    let ptStack = Array(28);
    ptStack.fill(0);
    for (let player = 1; player <= 2; player++) {
      for (let i=0; i<15; i++) {
        const pt = this.chequer[player][i].point;
        const st = this.chequer[player][i].stack;

        if (pt == 26 || pt == 27) { //bear off
          ex = this.pointX[26];
          sf = false;
          ey = (player == 1) ? this.offY[player] - (ptStack[pt] * this.boffHeight)
                             : this.offY[player] + (ptStack[pt] * this.boffHeight); //player==2
        } else if (pt == 0 || pt == 25) { //on the bar
          ex = this.pointX[pt];
          sf = (st > this.barStackThreshold + 1);
          ty = (ptStack[pt] > this.barStackThreshold) ? this.barStackThreshold : ptStack[pt];
          ey = (pt == 0) ? this.barY[player] - (ty * this.pieceHeight)
                         : this.barY[player] + (ty * this.pieceHeight); //pt==25
        } else { //in field
          ex = this.pointX[pt];
          sf = (st > this.pointStackThreshold + 1);
          ty = (ptStack[pt] > this.pointStackThreshold) ? this.pointStackThreshold : ptStack[pt];
          ey = (pt > 12) ? this.yupper + (ty * this.pieceHeight)
                         : this.ylower - (ty * this.pieceHeight);
        }
        ptStack[pt] += 1;
        const position = this.getPosObj(ex, ey);
        const zindex = 10 + ptStack[pt];
        this.chequer[player][i].position = position;
        this.chequer[player][i].zindex = zindex;
        this.chequer[player][i].dom.css(position).css("z-index", zindex);
        this.stacks[pt].text("");
        if (sf) {
          this.stacks[pt].text(st).css(position).css("color", this.stackColor[player]);
        }
      }
    }

  }

  animateDice(msec) {
    const diceanimclass = "faa-shake animated"; //ダイスを揺らすアニメーション
    this.dice[1][0].addClass(diceanimclass);
    this.dice[1][1].addClass(diceanimclass);
    this.dice[2][0].addClass(diceanimclass); //見せないダイスも一緒に揺らす
    this.dice[2][1].addClass(diceanimclass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //msec秒待ってアニメーションを止める
      this.dice[1][0].removeClass(diceanimclass);
      this.dice[1][1].removeClass(diceanimclass);
      this.dice[2][0].removeClass(diceanimclass);
      this.dice[2][1].removeClass(diceanimclass);
      defer.resolve();
    }, msec);

    return defer.promise();
  }

  animateCube(msec) {
    const cubeanimclass = "faa-tada animated faa-fast"; //キューブオファーのアニメーション
    this.cube.addClass(cubeanimclass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //msec秒待ってアニメーションを止める
      this.cube.removeClass(cubeanimclass);
      defer.resolve();
    }, msec);

    return defer.promise();
  }


  bgBoardConfig() {
    this.mainBoardHeight = this.mainBoard.height()
    this.mainBoardWidth = this.mainBoard.width()
    this.vw = this.mainBoardWidth / 84; // 84 is grid-area width
    this.vh = this.mainBoardHeight / 100;

    this.pieceWidth = 5 * this.vw; // equal to width in css
    this.pieceHeight = 8 * this.vh;
    this.boffHeight = this.pieceWidth / 4 ; // bear off chequer height
    this.pointWidth = 6 * this.vw;

console.log("bgBoardConfig", this.mainBoardWidth, this.vw, this.pointWidth);

    this.pointX = [36, 72, 66, 60, 54, 48, 42, 30, 24, 18, 12,  6,  0,
                        0,  6, 12, 18, 24, 30, 42, 48, 54, 60, 66, 72, 36, 78];
    for (let i=0; i< this.pointX.length; i++) {
      this.pointX[i] *= this.vw;
    }

    this.yupper = 0;
    this.ylower = this.mainBoardHeight - this.pieceWidth;

    const tray2Y = 10;
    const tray1Y = this.mainBoardHeight - this.pieceWidth - tray2Y;
    this.offY = [null, tray1Y, tray2Y];

    this.pointColorClass = ["triange_dnev", "triange_dnod", "triange_upev", "triange_upod"];
    this.stackColor   = ["gray", "#000", "#000"];
    this.dicePipColor = ["gray", "#000", "#000"];
    this.turnColor    = ["gray", "#9ce", "#ce9"];

    this.diceSize = 5 * this.vw ; // = 5vw equal to width in css
    this.diceY = this.mainBoardHeight / 2 - this.diceSize / 2;
    this.dice10X = this.pointX[3];
    this.dice11X = this.pointX[4];
    this.dice20X = this.pointX[9];
    this.dice21X = this.pointX[10];

    this.pointStackThreshold = 5;
    this.barStackThreshold = 3;

    this.cubeSize = 5 * this.vw ; // =5vw equal to width in css
    this.cubeX = this.pointX[0];
    const cubeY0 = Math.round(this.mainBoardHeight / 2 - this.cubeSize / 2);
    const cubeY2 = 5;
    const cubeY1 = this.mainBoardHeight - cubeY2 - this.cubeSize;
    this.cubeY = [cubeY0, cubeY1, cubeY2];
    this.cubePosClass = ["cubecenter", "turn1", "turn2"];

    const bar1ypos = this.cubeSize + 5;
    const bar2ypos = this.mainBoardHeight - bar1ypos - this.pieceHeight;
    this.barY = [null, bar1ypos, bar2ypos];
  }

  getVw() {
    return this.vw;
  }
  getVh() {
    return this.vh;
  }

  getPosObj(x, y) {
    return {left:x, top:y}
  }

  getBarPos(player) {
    return this.getPosObj(this.pointX[25], this.barY[player]);
  }

  getDragEndPoint(pos, player) {
    const pos2ptz = [13,14,15,16,17,18,25,19,20,21,22,23,24,0,12,11,10,9,8,7,25,6,5,4,3,2,1,0];
    const px = Math.floor(pos.left / this.pointWidth + 0.5);
    const py = Math.floor(pos.top / this.mainBoardHeight * 2);
    const pt = pos2ptz[px + py * 14];

console.log("getDragEndPoint", pos, this.pointWidth, px, py, px+py*14, pt, player);
    if (pt == 0 || pt == 25) { return pt; }
    else {
      return (player == 1) ? pt : 25 - pt;
    }
  }

  getDragStartPoint(id, player) {
    const chker = this.chequer[player].find(elem => elem.domid == id);
    const pt = chker.point;
    const p = (player == 1) ? pt : 25 - pt;
console.log("getDragStartPoint", id, player, pt);
    return p;
  }

  getChequerOnDragging(pt, player) {
    const chker = this.chequer[player].find(elem => elem.point == pt);
console.log("getChequerOnDragging", pt, player, chker);
    return chker;
  }

  getChequerHitted(ptt, player) {
    const pt = (player == 1) ? 25 - ptt : ptt;
    const chker = this.chequer[player].find(elem => elem.point == pt);
console.log("getOppoChequerAndGotoBar", ptt, pt, player, chker);
    return chker;
  }

  flashOnMovablePoint(destpt, player) {
    for (const dp of destpt) {
      if (dp == 0) { this.offtray[player].toggleClass("flash", true); }
      else { this.point[dp].toggleClass("flash", true); }
    }
  }

  flashOffMovablePoint() {
    this.pointAll.removeClass("flash");
    this.offtray[1].removeClass("flash");
    this.offtray[2].removeClass("flash");
  }

} //class BgBoard
