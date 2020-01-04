// BgBoard_class.js
'use strict';

class BgBoard {
  constructor(game) {
    this.gameObj = game;
    this.mainBoard = $('#board'); //need to define before bgBoardConfig()
    this.bgBoardConfig();
    this.prepareSvgDice();
    this.setDomNameAndStyle();
  } //end of constructor()

  prepareSvgDice() {
    this.svgDice = [];
    this.svgDice[0]  = '';
    this.svgDice[1]  = '<svg class="dice-one" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[1] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[1] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[1] += '</svg>';
    this.svgDice[2]  = '<svg class="dice-two" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[2] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[2] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[2] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[2] += '</svg>';
    this.svgDice[3]  = '<svg class="dice-three" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[3] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[3] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[3] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[3] += '<circle cx="132" cy="48" r="8" stroke-width="18" />';
    this.svgDice[3] += '</svg>';
    this.svgDice[4]  = '<svg class="dice-four" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[4] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[4] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[4] += '</svg>';
    this.svgDice[5]  = '<svg class="dice-five" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[5] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[5] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[5] += '</svg>';
    this.svgDice[6]  = '<svg class="dice-six" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[6] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[6] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="48" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[6] += '</svg>';
  }

  setDomNameAndStyle() {
    let xh;
    xh = '<div id="bar" class="bar"></div>';
    this.mainBoard.append(xh);
    $("#bar").css(this.getPosObj(this.pointX[0], 0));

    xh  = '<div id="offtray1" class="offtray"></div>';
    xh += '<div id="offtray2" class="offtray"></div>';
    this.mainBoard.append(xh);
    $("#offtray1").css(this.getPosObj(13 * this.pointWidth, 50 * this.vh));
    $("#offtray2").css(this.getPosObj(13 * this.pointWidth, 0));

    //point triangles
    this.point = [];
    const pointColorClass = ["pt_dnev", "pt_dnod", "pt_upev", "pt_upod"];
    for (let i = 1; i < 25; i++) {
      const colfig = ((i>12) ? 1 : 0) * 2 + (i % 2); //0=under+even, 1=under+odd, 2=upper+even, 3=upper+odd
      const xh = '<div id="pt' + i + '" class="point ' + pointColorClass[colfig] + '"></div>';
      this.mainBoard.append(xh);
      this.point[i] = $('#pt' + i);
      const ey = (i > 12) ? 0 : this.mainBoardHeight - this.point[i].height();
      this.point[i].css(this.getPosObj(this.pointX[i], ey));
    }
    this.pointAll = $(".point");

    //cube
    xh  = '<div id="cube" class="cube">64</div>';
    this.mainBoard.append(xh);
    this.cube = $('#cube');
    this.cube.css(this.getPosObj(this.cubeX, this.cubeY[0]));

    //dice
    xh  = '<div id="dice10" class="dice"></div>';
    xh += '<div id="dice11" class="dice"></div>';
    xh += '<div id="dice20" class="dice"></div>';
    xh += '<div id="dice21" class="dice"></div>';
    this.mainBoard.append(xh);
    this.dice = [[],[$('#dice10'),$('#dice11')],[$('#dice20'),$('#dice21')]];
    this.dice[1][0].css(this.getPosObj(this.dice10X, this.diceY));
    this.dice[1][1].css(this.getPosObj(this.dice11X, this.diceY));
    this.dice[2][0].css(this.getPosObj(this.dice20X, this.diceY));
    this.dice[2][1].css(this.getPosObj(this.dice21X, this.diceY));

    //stack counter
    this.stacks = [];
    for (let i = 0; i < 28; i++) {
      const xh = '<div id="st' + i + '" class="stack"></div>';
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
    const cubePosClass = ["cubepos0", "cubepos1", "cubepos2"];
    const cubePosJoin = cubePosClass.join(" ");
    this.cube.text(cubeval).css(this.getPosObj(this.cubeX, this.cubeY[cubepos]))
             .removeClass(cubePosJoin).addClass(cubePosClass[cubepos])
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
    const dicefaceClass = ["", "diceface1", "diceface2"];
    this.dice[turn][0].html(this.svgDice[d0]);
    this.dice[turn][1].html(this.svgDice[d1]);
    this.dice[turn][0].children("svg").addClass(dicefaceClass[turn]);
    this.dice[turn][1].children("svg").addClass(dicefaceClass[turn]);
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

    let ex, ey, ty, sf, bf;
    let ptStack = Array(28);
    ptStack.fill(0);
    for (let player = 1; player <= 2; player++) {
      for (let i=0; i<15; i++) {
        const pt = this.chequer[player][i].point;
        const st = this.chequer[player][i].stack;
        bf = false;

        if (pt == 26 || pt == 27) { //bear off
          bf = true;
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
        this.chequer[player][i].dom.css(position).css("z-index", zindex).toggleClass("bearoff", bf);
        const stackColorClass = ["", "stackcol1", "stackcol2"];
        this.stacks[pt].text("").removeClass(stackColorClass.join(" "));
        if (sf) {
          this.stacks[pt].text(st).css(position).addClass(stackColorClass[player]);
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
    this.vw = this.mainBoardWidth / 84;
    this.vh = this.mainBoardHeight / 100;

    this.pointWidth = 6 * this.vw; // equal to width in css
    this.pieceWidth = this.pointWidth;
    let pieceHeightRatio = this.mainBoardHeight / 13 / this.pieceWidth;
    pieceHeightRatio = (pieceHeightRatio > 1) ? 1 : pieceHeightRatio;
    this.pieceHeight = this.pieceWidth * pieceHeightRatio;
    this.boffHeight = this.pieceWidth / 4 ; // bearoff chequer height

console.log("bgBoardConfig", this.mainBoardWidth,this.mainBoardHeight, this.vw, this.vh, this.pointWidth, pieceHeightRatio);

    this.pointX = [6, 12, 11, 10,  9,  8,  7,  5,  4,  3,  2,  1,  0,
                       0,  1,  2,  3,  4,  5,  7,  8,  9, 10, 11, 12,  6, 13, 13];
    for (let i=0; i< this.pointX.length; i++) {
      this.pointX[i] *= this.pointWidth;
    }

    const offtrayMargin = 6; // equal to offtray border size
    this.pointX[26] += offtrayMargin;
    this.pointX[27] += offtrayMargin;

    this.yupper = 0;
    this.ylower = this.mainBoardHeight - this.pieceWidth;

    const tray2Y = -0.4 * this.pieceHeight;
    const tray1Y = this.mainBoardHeight - this.pieceWidth - tray2Y;
    this.offY = [null, tray1Y, tray2Y];

    this.diceSize = this.pointWidth;
    this.diceY = this.mainBoardHeight / 2 - this.diceSize / 2;
    this.dice10X = this.pointX[3];
    this.dice11X = this.pointX[4];
    this.dice20X = this.pointX[9];
    this.dice21X = this.pointX[10];

    this.pointStackThreshold = 5;
    this.barStackThreshold = 3;

    this.cubeSize = 0.9 * this.pointWidth;
    this.cubeX = this.pointX[0] + 0.1 * this.vw; // cube class widthを加味
    const cubeY0 = Math.round(this.mainBoardHeight / 2 - this.cubeSize / 2);
    const cubeY2 = 5;
    const cubeY1 = this.mainBoardHeight - this.cubeSize - cubeY2;
    this.cubeY = [cubeY0, cubeY1, cubeY2];

    const bar1Y = this.cubeSize + 5;
    const bar2Y = this.mainBoardHeight - bar1Y - this.pieceHeight;
    this.barY = [null, bar1Y, bar2Y];
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
