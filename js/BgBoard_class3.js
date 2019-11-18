// BgBoard_class.js
'use strict';

class BgBoard {
  constructor(game) {
    this.gameObj = game;
    this.mainBoard = $('#board'); //need to define before prepareBoard()
    this.bgBoardConfig();
    this.setDomNameAndStyle();
//    this.prepareBoard();
//    this.setDomNames(); //and another DOMs define after prepareBoard()
//    this.applyDomStyle();
//    this.resetBoard();
//    this.dragStartPos = null;
//    this.dragObject = null;
    this.player = 0;
  } //end of constructor()

  // Generate container and board image HTML
  __prepareBoard() {
    let i, j, k, xh = "";
    // cube
    xh += '<span id="cube" class="cubeclass fa-layers fa-fw cubecenter">';
    xh += '<i class="fas fa-square"></i>';
    xh += '<span class="fa-layers-text fa-inverse" data-fa-transform="shrink-8" style="font-weight:900">64</span>';
    xh += '</span>';

    // dice
    xh += '<span id="dice10" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[1] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[1] +'"></i></span>';
    xh += '<span id="dice11" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[1] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[1] +'"></i></span>';
    xh += '<span id="dice20" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[2] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[2] +'"></i></span>';
    xh += '<span id="dice21" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[2] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[2] +'"></i></span>';
    // point triangles
    let colfig;
    for (i = 1; i < 25; i++) {
      k = 'pt' + i;
      colfig = ((i>12) ? 1 : 0) * 2 + (i % 2); //0=under+even, 1=under+odd, 2=upper+even, 3=upper+odd
      xh += '<div id="' + k + '" class="point ' + this.pointcolfigclass[colfig] + '"> </div>';
    }
    // stack counter
    for (i = 0; i < 26; i++) {
      k = 'st' + i;
      xh += '<span id="' + k + '" class="stack"> </span>';
    }
    // chequer
    for (j = 1; j < 3; j++) {
      for (i = 0; i < 15; i++) {
        const htm = this.chequer[j][i].domhtml;
        xh += htm;
      }
    }

    this.mainBoard.html(xh);
  }

  __setChequerDraggable() {
    $(".chequer").draggable({
      //event
      start: ( event, ui ) => {
        this.dragStartAction(event, ui);
      },
      stop: ( event, ui ) => {
        this.dragStopAction(event, ui);
      },
      //options
      containment: 'parent',
      opacity: 0.6,
      zIndex: 99,
      revertDuration: 200
    });
  }

  __dragStartAction(event, ui) {
//    console.log("dragStart", this, this.dragStartPos, $(event.currentTarget));
    this.dragObject = $(event.currentTarget);
    let id = this.dragObject.attr("id");
    this.dragStartPos = ui.position;
    this.dragStartPt = this.calcPosition2Point(ui.position, this.player);
    if (this.gameObj.frashflg) {
      const xg = this.gameObj.xgid;
      const destpt = xg.movablePoint(this.dragStartPt);
      for (let i=0; i < destpt.length; i++) {
//        this.pointObj[destpt[i]].toggleClass("flash", true);
      }
    }
    console.log("dragStart", id, this.dragStartPt, this.dragStartPos);
//    console.log("dragStart this.gameObj", this.gameObj);
    this.gameObj.pushXgidPosition();
  }
  __dragStopAction(event, ui) {
    let id = this.dragObject.attr("id");
console.log("dragStop", id, ui.position);
//    this.pointObjAll.removeClass("flash");
    this.dragStartPt = this.callStartPt(id);
    this.dragEndPt = this.calcPosition2Point(ui.position, this.player);
    const xg = this.gameObj.xgid;
    const ok = xg.isMovable(this.dragStartPt, this.dragEndPt);
console.log("dragStopOK?", ok, this.dragStartPt, this.dragEndPt);

    if (ok) {
      const movestr = this.dragStartPt + "/" +this.dragEndPt;
      this.gameObj.moveChequer(movestr, (this.player==1));
      this.gameObj.pushXgidPosition();
console.log("dragStopOK", movestr, this.gameObj.xgid.xgidstr);
      this.showBoard2(this.gameObj.xgid);
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
  }

  __callStartPt(id) {
    const c = id.substr(1,1);
    const player = (c == "w") ? 1 : 2;
    const num = parseInt(id.substr(2) );
    let point = this.chequer[player][num].point;
    point = (point == 0) ? 25 : point;
    const outpt = (player == 1) ? point : 25 - point;
console.log("callStartPt", id, c, player, num, point, outpt);
    return outpt;
  }

  setDomNameAndStyle() {
    //cube
    let xh = '<span id="cube" class="cubeclass fa-layers fa-fw cubecenter">';
    xh += '<i class="fas fa-square"></i>';
    xh += '<span class="fa-layers-text fa-inverse" data-fa-transform="shrink-8" style="font-weight:900">64</span>';
    xh += '</span>';
    this.mainBoard.append(xh);
    this.cubeDisp = $('#cube');
    this.cubeDisp.css(this.getPosObj(this.cubeX, this.cubeY[0]));

    //dice
    let xh = '<span id="dice10" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[1] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[1] +'"></i></span>';
    xh += '<span id="dice11" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[1] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[1] +'"></i></span>';
    xh += '<span id="dice20" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[2] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[2] +'"></i></span>';
    xh += '<span id="dice21" class="dice fa-layers fa-fw">';
    xh += '<i class="fas fa-square" style="color:' + this.dicepipcolor[2] + '"></i>';
    xh += '<i class="diceface fas" style="color:'+ this.turncolor[2] +'"></i></span>';
    this.mainBoard.append(xh);
    this.diceimgs = [[],[$('#dice10'),$('#dice11')],[$('#dice20'),$('#dice21')]];
    this.diceimgs[1][0].css(this.getPosObj(this.dice10x, this.dicey));
    this.diceimgs[1][1].css(this.getPosObj(this.dice11x, this.dicey));
    this.diceimgs[2][0].css(this.getPosObj(this.dice20x, this.dicey));
    this.diceimgs[2][1].css(this.getPosObj(this.dice21x, this.dicey));

    //point triangles
    this.point = [];
    for (let i = 1; i < 25; i++) {
      const ey = (i > 12) ? 0 : this.mainBoardHeight - this.point[i].height();
      const colfig = ((i>12) ? 1 : 0) * 2 + (i % 2); //0=under+even, 1=under+odd, 2=upper+even, 3=upper+odd
      const xh = '<div id="pt' + i + '" class="point ' + this.pointcolfigclass[colfig] + '"></div>';
      this.mainBoard.append(xh);
      this.point[i] = $('#pt' + i);
      this.point[i].css(this.getPosObj(this.pointx[i], ey));
    }
    this.pointAll = $(".point");

    //stack counter
    this.stacks = [];
    for (let i = 0; i < 26; i++) {
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

  }

  resetBoard() {
    this.showBoard("XGID=--------------------------:0:0:0:00:0:0:0:0:0");
  }

  showBoard(xgidstr) { // input for XGID string
    this.showBoard2( new Xgid(xgidstr) );
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
    const cubepos = BgUtil.cvtTurnXg2kv(pos);
    const cubeval = BgUtil.calcCubeDisp(val, crawford);
    this.cubeDisp.children("span").text(cubeval);
    this.cubeDisp.css(this.getPosObj(this.cubeX, this.cubeY[cubepos]));
    this.cubeDisp.removeClass("cubecenter turn1 turn2").addClass(this.cubePosClass[cubepos])
                 .toggleClass("cubeoffer", offer);
    if (offer) {
      this.animateCube(500);
    }
//console.log("showCube",cubepos, cubeval, offer, crawford, this.getPosObj(this.cubeX, this.cubeY[cubepos]));
  }

  showDiceAll(turn, d1, d2) {
//console.log("showDiceAll",turn, d1, d2);
    switch( BgUtil.cvtTurnXg2kv(turn) ) {
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
    this.diceimgs[turn][0].children(".diceface").removeClass(diceclasses).addClass(dicepip[d0]);
    this.diceimgs[turn][1].children(".diceface").removeClass(diceclasses).addClass(dicepip[d1]);
    (d0 == 0) ? this.diceimgs[turn][0].hide() : this.diceimgs[turn][0].show();
    (d1 == 0) ? this.diceimgs[turn][1].hide() : this.diceimgs[turn][1].show();
  }

  showPosition(xg) {
    let piecePointer = [0, 0, 0];
    for (let pt = 0; pt <= 25; pt++) {
      const num = xg.get_ptno(pt);
      const player = BgUtil.cvtTurnXg2kv(xg.get_ptcol(pt));
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
          ex = this.pointx[26];
          sf = false;
          ey = (player == 1) ? this.offYpos[player] - (ptStack[pt] * this.boffHeight)
                             : this.offYpos[player] + (ptStack[pt] * this.boffHeight); //player==2
        } else if (pt == 0 || pt == 25) { //on the bar
          ex = this.pointx[pt];
          sf = (st > this.barstackthreshold + 1);
          ty = (ptStack[pt] > this.barstackthreshold) ? this.barstackthreshold : ptStack[pt];
          ey = (pt == 0) ? this.barYpos[player] + (ty * this.pieceHeight)
                         : this.barYpos[player] - (ty * this.pieceHeight); //pt==25
        } else { //in field
          ex = this.pointx[pt];
          sf = (st > this.pointstackthreshold + 1);
          ty = (ptStack[pt] > this.pointstackthreshold) ? this.pointstackthreshold : ptStack[pt];
          ey = (pt > 12) ? this.yupper + (ty * this.pieceHeight)
                         : this.ylower - (ty * this.pieceHeight);
        }
        ptStack[pt] += 1;
        const position = this.getPosObj(ex, ey);
        this.chequer[player][i].position = position;
        this.chequer[player][i].zindex = 10 + ptStack[pt];
        this.chequer[player][i].dom.css(position).css("z-index", this.chequer[player][i].zindex);
//console.log("showPosition2", player, i, position, ptStack[pt]);
        if (sf) {
          this.stacks[pt].text(st).css(position).css("color", this.stackinfocolor[player]);
        }
      }
    }

  }

  animateDice(msec) {
    const animationclass = "faa-shake animated"; //ダイスを揺らすアニメーション
    this.diceimgs[1][0].addClass(animationclass);
    this.diceimgs[1][1].addClass(animationclass);
    this.diceimgs[2][0].addClass(animationclass); //見せないダイスも一緒に揺らす
    this.diceimgs[2][1].addClass(animationclass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //msec秒待ってアニメーションを止める
      this.diceimgs[1][0].removeClass(animationclass);
      this.diceimgs[1][1].removeClass(animationclass);
      this.diceimgs[2][0].removeClass(animationclass);
      this.diceimgs[2][1].removeClass(animationclass);
      defer.resolve();
    }, msec);

    return defer.promise();
  }

  animateCube(msec) {
    const animationclass = "faa-tada animated faa-fast"; //キューブオファーのアニメーション
    this.cubeDisp.addClass(animationclass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //msec秒待ってアニメーションを止める
      this.cubeDisp.removeClass(animationclass);
      defer.resolve();
    }, msec);

    return defer.promise();
  }


  bgBoardConfig() {
    this.mainBoardHeight = this.mainBoard.height()
    this.mainBoardWidth = this.mainBoard.width()
    this.vw_ratio = this.mainBoardWidth / 84; // 84 is grid-area width
    this.vh_ratio = this.mainBoardHeight / 100;

    this.pieceWidth = 5 * this.vw_ratio; // equal to width in css
    this.pieceHeight = 8 * this.vh_ratio;
    this.boffHeight = this.pieceWidth / 3 ; // bear off chequer height
    this.pointWidth = 6 * this.vw_ratio;

    this.pointx = [36, 72, 66, 60, 54, 48, 42, 30, 24, 18, 12,  6,  0,
                        0,  6, 12, 18, 24, 30, 42, 48, 54, 60, 66, 72, 36, 78];
    for (let i=0; i< this.pointx.length; i++) {
      this.pointx[i] *= this.vw_ratio;
    }

    this.yupper = 0;
    this.ylower = this.mainBoardHeight - this.pieceWidth;

    const tray2Y = 10;
    const tray1Y = this.mainBoardHeight - this.pieceWidth - tray2Y;
    this.offYpos = [null, tray1Y, tray2Y];

    this.pointcolfigclass = ["triange_dnev", "triange_dnod", "triange_upev", "triange_upod"];
    this.stackinfocolor = ["gray", "black", "white"]; // color code name
    this.dicepipcolor = ["gray", "black", "white"]; // color code name
    this.turncolor = ["gray", "#9ce", "#456"]; // color code name

    this.diceSize = 5 * this.vw_ratio ; // = 5vw equal to width in css
    this.dicey = this.mainBoardHeight / 2 - this.diceSize / 2;
    this.dice10x = this.pointx[3];
    this.dice11x = this.pointx[4];
    this.dice20x = this.pointx[9];
    this.dice21x = this.pointx[10];

    this.pointstackthreshold = 5;
    this.barstackthreshold = 3;

    this.cubeSize = 5 * this.vw_ratio ; // =5vw equal to width in css
    this.cubeX = this.pointx[0];
    const cubeY0 = Math.round(this.mainBoardHeight / 2 - this.cubeSize / 2);
    const cubeY2 = 5;
    const cubeY1 = this.mainBoardHeight - cubeY2 - this.cubeSize;
    this.cubeY = [cubeY0, cubeY1, cubeY2];
    this.cubePosClass = ["cubecenter", "turn1", "turn2"];

    const bar1ypos = this.cubeSize + 5;
    const bar2ypos = this.mainBoardHeight - bar1ypos - this.pieceHeight;
    this.barYpos = [null, bar1ypos, bar2ypos];
  }

  getVw() {
    return this.vw_ratio;
  }
  getVh() {
    return this.vh_ratio;
  }

  getPosObj(x, y) {
    return {left:x, top:y}
  }

  calcPosition2Point(position, player) {
    const pos2ptz = [13,14,15,16,17,18,25,19,20,21,22,23,24,0,12,11,10,9,8,7,25,6,5,4,3,2,1,0];
    const px = Math.floor(position.left / this.pointWidth);
    const py = Math.floor(position.top / this.mainBoardHeight * 2);
    const pt = pos2ptz[px + py * 14];

console.log("calcPosition2Point", position, this.pointWidth, px, py, px+py*14, pt, player);
    if (pt == 0 || pt == 25) { return pt; }
    else {
      return (player == 1) ? pt : 25 - pt;
    }
  }

  frashOnMovablePoint(destpt) {
    for (let i=0; i < destpt.length; i++) {
      this.point[destpt[i]].toggleClass("flash", true);
    }
  }

  frashOffMovablePoint() {
    this.pointAll.removeClass("flash");
  }

} //class BgBoard
