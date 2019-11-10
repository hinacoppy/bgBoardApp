// BgBoard_class.js
'use strict';

class BgBoard {
  constructor() {
    this.mainBoard = $('#board'); //need to define before prepareBoard()
    this.xgidstr = "XGID=--------------------------:0:0:0:00:0:0:0:0:0";
    this.bgBoardConfig();
    this.playcols = [" ", "w", "b"];
    this.toPointArray = new Array(28);
    this.leftrightFlag = true; //true: Left bearoff, false: Right bearoff
    this.topbottomFlag = true; //true: player2 is bottom, player1 is top
    this.prepareBoard();
    this.openingRollFlag = false;
    this.setDomNames(); //and another DOMs define after prepareBoard()
    this.applyDomStyle();
//    this.resetBoard();
    this.setChequerDraggable();
  } //end of constructor()

  setDomNames() {
    this.cubeDisp = $('#cube');
    this.diceimgs = [[],[$('#dice10'),$('#dice11')],[$('#dice20'),$('#dice21')]];
    this.labels = [];
    for (let i = 1; i < 25; i++) {
      this.labels[i] = $('#lb'+i);
    }
    this.stacks = [];
    for (let i = 0; i < 26; i++) {
      this.stacks[i] = $('#st'+i);
    }
    this.pieces = [[],[],[]];
    for (let j = 1; j < 3; j++) {
      for (let i = 0; i < 15; i++) {
        this.pieces[j][i] = $('#p' + this.playcols[j] + i);
      }
    }
  }

  // Generate container and board image HTML
  prepareBoard() {
    let i, j, k, xh = "";
    // base board
//    xh += '<img src="' + this.boardimg + '">';
    // cube
    xh += '<span id="cube" class="cubeclass fa-layers fa-fw cubecenter">';
    xh += '<i class="fas fa-square"></i>';
    xh += '<span class="fa-layers-text fa-inverse" data-fa-transform="shrink-8" style="font-weight:900">64</span>';
    xh += '</span>';

    // dice
/**********************************************
    xh += '<span id="dice10" class="dice fa-layers fa-fw col_player1">';
    xh += '<i class="fas fa-square col_player2"></i>';
    xh += '<i class="diceface fas fa-dice-two"></i></span>';
    xh += '<span id="dice11" class="dice fa-layers fa-fw col_player1">';
    xh += '<i class="fas fa-square col_player2"></i>';
    xh += '<i class="diceface fas fa-dice-six"></i></span>';
    xh += '<span id="dice20" class="dice fa-layers fa-fw col_player2">';
    xh += '<i class="fas fa-square col_player1"></i>';
    xh += '<i class="diceface fas fa-dice-five"></i></span>';
    xh += '<span id="dice21" class="dice fa-layers fa-fw col_player2">';
    xh += '<i class="fas fa-square col_player1"></i>';
    xh += '<i class="diceface fas fa-dice-four"></i></span>';
************************************************/
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
    // label
//    for (i = 1; i < 25; i++) {
//      k = 'lb' + i;
//      xh += '<span id="' + k + '" class="label"> </span>';
//    }
    // stack counter
    for (i = 0; i < 26; i++) {
      k = 'st' + i;
      xh += '<span id="' + k + '" class="stack"> </span>';
    }
    // chequer
    for (j = 1; j < 3; j++) {
      for (i = 0; i < 15; i++) {
        k = 'p' + this.playcols[j] + i;
        xh += '<span id="' + k + '" class="chequer fa-layers fa-fw">';
        xh += '<i class="fas fa-circle" style="color:gray"></i>';
        xh += '<i class="fas fa-circle" style="color:'+ this.turncolor[j] +'" data-fa-transform="shrink-1"></i></span>';
/********************************
<div id="p11" class="chequer fa-layers fa-fw col_player1">
<i class="fas fa-circle" style="color:gray"></i>
<i class="fas fa-circle col_player1" data-fa-transform="shrink-1"></i></div>
*********************************/
      }
    }

    this.mainBoard.html(xh);
  }

  setChequerDraggable() {
    $(".chequer").draggable();
  }

  getPosObj(x, y) {
    const xx = x * this.xratio;
    const yy = y * this.yratio;
    return {left:xx, top:yy}
  }

  applyDomStyle() {
//    this.mainBoard.width(this.boardWidth).height(this.boardHeight);
    this.cubeDisp.css(this.getPosObj(this.cubeX, this.cubeY[0]));
    this.diceimgs[1][0].css(this.getPosObj(this.dice10x, this.dicey));
    this.diceimgs[1][1].css(this.getPosObj(this.dice11x, this.dicey));
    this.diceimgs[2][0].css(this.getPosObj(this.dice20x, this.dicey));
    this.diceimgs[2][1].css(this.getPosObj(this.dice21x, this.dicey));

//    for (let i = 1; i < 25; i++) {
//      let ey = (i > 12) ? this.upperlabelY : this.lowerlabelY;
//      this.labels[i].css({left: this.pointx[i], top: ey});
//    }
    for (let i = 0; i < 26; i++) {
      let ey = (i > 12) ? this.yupper + (this.pointstackthreshold * this.pieceHeight)
                        : this.ylower - (this.pointstackthreshold * this.pieceHeight);
      ey = (i == 0)  ? this.barYpos[1] + (this.barstackthreshold * this.pieceHeight) : ey;
      ey = (i == 25) ? this.barYpos[2] + (this.barstackthreshold * this.pieceHeight) : ey;
      this.stacks[i].css(this.getPosObj(this.pointx[i], ey));
    }
  }


  resetBoard() {
//    this.showBoard("XGID=--------------------------:0:0:0:00:0:0:0:0:0");
    this.showBoard("XGID=-BABAACCAA--a---ab-cbcab--:1:1:0:54:3:1:0:7:10");
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
    this.showLabels(xg.get_turn());
  }

  showCube(pos, val, offer, crawford){
    const cubepos = BgUtil.cvtTurnXg2kv(pos);
    const cubeval = BgUtil.calcCubeDisp(val, crawford);
    this.cubeDisp.children("span").text(cubeval);
    this.cubeDisp.css(this.getPosObj(this.cubeX, this.cubeY[cubepos]));
    this.cubeDisp.removeClass("cubecenter turn1 turn2").addClass(this.cubePosClass[cubepos])
                 .toggleClass("cubeoffer", offer);
console.log("showCube",cubepos, cubeval, this.getPosObj(this.cubeX, this.cubeY[cubepos]));
  }

  showDiceAll(turn, d1, d2) {
console.log("showDiceAll",turn, d1, d2);
//    const sw = (this.openingRollFlag) ? 3 : BgUtil.cvtTurnXg2kv(turn);
//    switch( sw ) {
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
//    case 3:
//      this.showDice(1, d1, 0);
//      this.showDice(2, d2, 0);
//      break;
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

  showLabels(xgturn) {
    const which = (xgturn == 1 && this.topbottomFlag == true) || (xgturn == -1 && this.topbottomFlag == false);
    for (let i = 1; i < 25; i++) {
      let c = (xgturn == 0) ? "" : (which) ? i : 25 - i;
      this.labels[i].text(c);
    }
  }

  showPosition(xg) {
    let num, player, pt, i, j, ey, ex, zx, ty, st, p2move;
    let piecePointer = [0, 0, 0];
    for (i = 0; i < this.toPointArray.length; i++) {
      this.toPointArray[i] = [];
    }
    for (pt = 0; pt <= 25; pt++) {
      num = xg.get_ptno(pt);
      player = BgUtil.cvtTurnXg2kv(xg.get_ptcol(pt));
      if (num > 0) { 
        for (j = 0; j < num; j++) {
          if (pt == 0 || pt == 25) { //on the bar
            ty = (j > this.barstackthreshold) ? this.barstackthreshold : j;
            ey = this.get_barYpos(player) + (ty * this.pieceHeight);
            st = (num > this.barstackthreshold +1) ? num : "";
          } else { //in field
            ey = this.get_ptYpos(j, pt);
            st = (num > this.pointstackthreshold +1) ? num : "";
          }
          ex = this.pointx[pt];
          zx = 10 + j;
          p2move = this.pieces[player][piecePointer[player]++];
//console.log("showPosition", pt, j, player, ex, ey, zx)
          p2move.css(this.getPosObj(ex, ey)).css({"z-index":zx});
          this.toPointArray[pt].push(p2move);
        }
      }
      if (num == 0) { st = ""; }
      this.stacks[pt].text(st).css("color", this.stackinfocolor[player]);
    }

    // now move any unused pieces to the off tray
    for (player = 1; player < 3; player++) {
      ex = this.pointx[26];
      for (i = piecePointer[player]; i < 15; i++) {
        p2move = this.pieces[player][i];
        ey = this.get_offYpos(player) + (i * this.boffHeight);
        p2move.css(this.getPosObj(ex, ey)).css({"z-index":10});
        pt = (player == 2) ? 26 : 27;
        this.toPointArray[pt].push(p2move);
      }
    }
  }

  animateChequer(xg, frpt, topt, delay, n) {
    const player = BgUtil.cvtTurnXg2kv(xg.turn);
    const frabs = (player == 2) ? frpt : 25 - frpt;
    let toabs;

    if (topt == 0)       { toabs = (player == 2) ? 26 : 27; } //bear off
    else if (topt == 25) { toabs = (player == 2) ? 0 : 25; } //to bar
    else                 { toabs = (player == 2) ? topt : 25 - topt; } //in field

    const p2move = this.toPointArray[frabs].pop();
    const topos = this.calcAftPosition(xg, toabs);
    this.toPointArray[toabs].push(p2move);
    const duration = (topt == 25) ? delay/2 : delay;
    const promise = p2move.css({"z-index": 20 + n}).animate({left: topos[0], top: topos[1]}, duration).promise();
    if (topos[2] != "") {
      this.stacks[toabs].text(topos[2]).css("color", this.stackinfocolor[player]);
    }
    return promise;
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

  calcAftPosition(xg, pt) {
    let ty, ey, ex, st;
    const player = BgUtil.cvtTurnXg2kv(xg.turn);
    const oppo = BgUtil.getOppo(player);
    const num = this.toPointArray[pt].length

    if (pt == 26 || pt == 27) { //bear off
      ex = this.pointx[26];
      ey = this.get_offYpos(player) + (15 - num - 2) * this.boffHeight; // -2 is draw offset
      st = "";
    } else if (pt == 0 || pt == 25) { //on the bar
      ty = (num > this.barstackthreshold) ? this.barstackthreshold : num;
      ey = this.get_barYpos(oppo) + (ty * this.pieceHeight);
      ex = this.pointx[pt];
      st = (num > this.barstackthreshold +1) ? num : "";
    } else { //in field
      ey = this.get_ptYpos(num, pt);
      ex = this.pointx[pt];
      st = (num > this.pointstackthreshold +1) ? num : "";
    }
    return [ex, ey, st];
  }

  //sub routine for upsidedown
  get_cubeYpos(turn) {
    const which = (this.topbottomFlag) ? turn : BgUtil.getOppo(turn);
    return this.cubeY[which];
  }
  get_offYpos(turn) {
    const which = (this.topbottomFlag) ? turn : BgUtil.getOppo(turn);
    return this.offYpos[which];
  }
  get_barYpos(turn) {
    const which = (this.topbottomFlag) ? turn : BgUtil.getOppo(turn);
    return this.barYpos[which];
  }
  get_ptYpos(num, pt) {
    const which = (pt > 12 && this.topbottomFlag == true) || (pt <= 12 && this.topbottomFlag == false);
    const ty = (num > this.pointstackthreshold) ? this.pointstackthreshold : num;
    const ey = (which) ? this.yupper + (ty * this.pieceHeight) : this.ylower - (ty * this.pieceHeight);
//console.log("get_ptYpos", num, pt, which, ty, ey);
    return ey;
  }

  bgBoardConfig() {
//console.log("bgBoardConfig", this.mainBoard.height(), this.mainBoard.width());
    this.boardWidth = 540;
    this.boardHeight = 410;

    this.xratio = this.mainBoard.width() / this.boardWidth;
    this.yratio = this.mainBoard.height() / this.boardHeight;
console.log("bgBoardConfig", this.mainBoard.height(), this.mainBoard.width(), this.xratio, this.yratio);
    this.boardFrame = 15;
    this.pieceWidth = 30; // equal to width in css
    this.pieceHeight = 30;
    this.boffHeight = 11; // bear off chequer height

    this.pointx = [255, 60, 90, 120, 150, 180, 210, 300, 330, 360, 390, 420, 450,
                   450, 420, 390, 360, 330, 300, 210, 180, 150, 120, 90, 60, 255, 13];
    this.leftSideOff = this.boardFrame; // Off tray x coord (left)
    this.rightSideOff = this.boardWidth - this.pieceWidth - this.boardFrame; // Off tray x coord (right)

    this.yupper = this.boardFrame;
    this.ylower = this.boardHeight - this.pieceHeight - this.boardFrame;

    this.uppertrayY = 10; // Y coord of upper off side tray
    this.lowertrayY = this.boardHeight / 2 + this.uppertrayY;
    this.offYpos = [null, this.uppertrayY, this.lowertrayY];

    this.stackinfocolor = ["gray", "black", "white"]; // color code name
    this.dicepipcolor = ["", "black", "white"]; // color code name
    this.turncolor = ["", "#9ce", "#456"]; // color code name

    this.diceSize = 35; // equal to width in css
    this.dicey = Math.round(this.boardHeight / 2 - this.diceSize / 2); // dice y coord
    this.dice10x = Math.round(this.pieceWidth * 3 - 1.3 * this.diceSize +  60);
    this.dice11x = Math.round(this.dice10x + 1.6 * this.diceSize);
    this.dice20x = Math.round(this.pieceWidth * 3 - 1.3 * this.diceSize + 300);
    this.dice21x = Math.round(this.dice20x + 1.6 * this.diceSize);
    this.upperlabelY = 0;
    this.lowerlabelY = this.boardHeight - this.boardFrame;

    this.pointstackthreshold = 4; // Max pieces per layer on a point (+1)
    this.barstackthreshold = 3; // Max pieces per layer on the bar (+1)

    this.cubeSize = 40; // equal to width in css
    this.cubeX = Math.round(this.boardWidth / 2 - this.cubeSize / 2);
    this.cubeY = [,,];
    this.cubeY[0] = Math.round(this.boardHeight / 2 - this.cubeSize / 2);
    this.cubeY[1] = this.yupper + 1;
    this.cubeY[2] = this.ylower - 1;
    this.cubePosClass = ["cubecenter", "turn2", "turn1"];

    this.bar1ypos = this.cubeY[1] + this.cubeSize + 2;
    this.bar2ypos = this.boardHeight - this.cubeSize - this.pieceHeight * 4 - 10;
    this.barYpos = [null, this.bar1ypos, this.bar2ypos];
  }

} //class BgBoard
