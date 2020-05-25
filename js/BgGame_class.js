// BgGame_class.js
'use strict';

class BgGame {
  constructor() {
    this.player = false; //true=player1, false=player2
    this.gamescore = [];
    this.matchLength = 5;
    this.score = [0,0,0];
    this.matchwinflg = false;
    this.cubeValue = 1; // =2^0
    this.crawford = false;
    this.xgid = new Xgid();
    this.board = new BgBoard("bgBoardApp", this);
    this.undoStack = [];
    this.animDelay = 800;

    this.setDomNames();
    this.setEventHandler();
    this.setChequerDraggable();
    this.showpipflg = true;
    this.useclockflg = false;
    this.flashflg = true;
    this.outerDragFlag = false; //駒でない部分をタップしてドラッグを始めたら true
    this.initGameOption();
    this.beginNewGame(true); //スコアをリセットして新規ゲームを始める
  } //end of constructor()

  setDomNames() {
    //button
    this.rollbtn     = $("#rollbtn");
    this.doublebtn   = $("#doublebtn");
    this.resignbtn   = $("#resignbtn");
    this.takebtn     = $("#takebtn");
    this.dropbtn     = $("#dropbtn");
    this.donebtn     = $("#donebtn");
    this.undobtn     = $("#undobtn");
    this.newgamebtn  = $("#newgamebtn");
    this.cancelbtn   = $("#cancelbtn");
    this.settingbtn  = $("#settingbtn");
    this.openrollbtn = $("#openingroll");
//    this.resetscorebtn = $("#resetscorebtn");
    this.convertkifubtn = $("#convertkifubtn");
    this.gameendnextbtn= $("#gameendnextbtn");
    this.gameendokbtn  = $("#gameendokbtn");
    this.diceAsBtn  = $("#dice10,#dice11,#dice20,#dice21");
    this.pointTriangle = $(".point");

    //infos
    this.playerinfo = [undefined, $("#playerinfo1"), $("#playerinfo2")];
    this.scoreinfo  = [undefined, $("#score1"), $("#score2")];
    this.pipinfo    = [undefined, $("#pip1"), $("#pip2")];
    this.timerinfo    = [undefined, $("#timer1"), $("#timer2")];
    this.matchinfo  = $("#matchinfo");

    //panel
    this.panelholder  = $("#panelholder");
    this.allpanel     = $(".panel");
    this.doubleresign = $("#doubleresign");
    this.doneundo     = $("#doneundo");
    this.gameend      = $("#gameend");
    this.hideAllPanel(); //font awesome が描画するのを待つ必要がある
    this.panelholder.show();

    //settings and valiables
    this.settings    = $("#settings");
    this.showpipflg  = $("[name=showpip]").prop("checked");
    this.useclockflg = $("[name=useclock]").prop("checked");
    this.flashflg    = $("[name=flashdest]").prop("checked"); //ドラッグ開始時に移動可能なポイントを光らせる
    this.matchlen    = $("#matchlen");
    this.kifuxgid    = $("#kifuxgid");
    this.kifumat     = $("#kifumat");

    //chequer
    this.chequerall = $(".chequer");
  }

  setEventHandler() {
    const clickEventType = 'click'; //(( window.ontouchstart!==null ) ? 'click':'touchend');
    //Button Click Event
    this.rollbtn.    on(clickEventType, () => { this.rollAction(false); });
    this.doublebtn.  on(clickEventType, () => { this.doubleAction(); });
    this.resignbtn.  on(clickEventType, () => { this.resignAction(); });
    this.takebtn.    on(clickEventType, () => { this.takeAction(); });
    this.dropbtn.    on(clickEventType, () => { this.dropAction(); });
    this.donebtn.    on(clickEventType, () => { this.doneAction(); });
    this.undobtn.    on(clickEventType, () => { this.undoAction(); });
    this.openrollbtn.on(clickEventType, () => { this.rollAction(true); });
    this.gameendnextbtn.on(clickEventType, () => { this.gameendNextAction(); });
    this.gameendokbtn.on(clickEventType, () => { this.gameendOkAction(); });
    this.diceAsBtn.on(clickEventType, () => { this.diceClickAction(); });

    if (!BgUtil.isIOS()) { //iOSのときはポイントクリックでチェッカーを拾わない
      this.pointTriangle.on('touchstart mousedown', (e) => { this.pointTouchStartAction(e); });
      this.pointTriangle.on('touchend mouseup', (e) => { this.pointTouchEndAction(e); });
    }

    //設定画面
    this.settingbtn.on(clickEventType, () => {
      this.settings.css(this.calcCenterPosition("S", this.settings)).slideToggle("normal"); //画面表示
      this.settingbtn.prop("disabled", true);
    });
//    this.resetscorebtn.on(clickEventType, () => {
//      this.score = [0,0,0];
//      this.scoreinfo[1].text(0);
//      this.scoreinfo[2].text(0);
//    });
    this.newgamebtn.on(clickEventType, () => {
      this.settings.slideToggle("normal"); //画面を消す
      this.settingbtn.prop("disabled", false);
      this.initGameOption();
      this.beginNewGame(true);
    });
    this.convertkifubtn.on(clickEventType, () => { this.convertKifuAction(); });
    this.cancelbtn.on(clickEventType, () => {
      this.settings.slideToggle("normal"); //画面を消す
      this.settingbtn.prop("disabled", false);
    });

    const rotateEvtType = 'resize'; //(BgUtil.isIOS()) ? 'orientationchange' : 'resize';
    //window.addEventListener(rotateEvtType, () => { this.board.showBoard2(this.xgid); alert(rotateEvtType);}
    $(window).on(rotateEvtType, () => {
       //alert(rotateEvtType);
       //this.board.bgBoardConfig();
       //this.board.showBoard2(this.xgid);
       this.board.redraw();
    }); 

  }

  initGameOption() {
    this.useclockflg = $("[name=useclock]") .prop("checked");
    this.showpipflg  = $("[name=showpip]")  .prop("checked");
    this.flashflg    = $("[name=flashdest]").prop("checked");

    $(".clock").toggle(this.useclockflg);
    $(".pip").toggle(this.showpipflg && !this.useclockflg); //クロックモードのときはピップ表示しない

    this.matchLength = this.matchlen.val();
    const matchinfotxt = (this.matchLength == 0) ? "$" : this.matchLength;
    this.matchinfo.text(matchinfotxt);
    this.score = [0,0,0];
    this.scoreinfo[1].text(0);
    this.scoreinfo[2].text(0);
    this.kifuxgid.val("");
    this.kifumat.val("");

console.log("initGameOption", this.showpipflg, this.useclockflg, this.flashflg, this.matchLength);
  }

  beginNewGame(newmatch = false) {
//console.log("beginNewGame");
//    const initpos   = "-bbAA------g--bb----------";
    const initpos = "-b----E-C---eE---c-e----B-";
    this.xgid.initialize(initpos, newmatch, this.matchLength);
    this.board.showBoard2(this.xgid);
    this.showPipInfo();
    this.swapChequerDraggable(true, true);
    this.hideAllPanel();
    this.showOpenRollPanel();
console.log("beginNewGame", this.xgid.xgidstr, this.xgid.matchsc);
  }

  async rollAction(openroll = false) {
    this.hideAllPanel();
    this.undoStack = [];
    const dice = this.randomdice(openroll);
    this.xgid.dice = dice[2];
    this.xgid.usabledice = true;
    this.board.showBoard2(this.xgid);
    await this.board.animateDice(this.animDelay);
    if (openroll) {
      this.player = (dice[0] > dice[1]);
      this.xgid.turn = BgUtil.cvtTurnGm2Xg(this.player);
    }
console.log("rollAction", openroll, this.player, this.xgid.dice, this.xgid.xgidstr);
    this.swapChequerDraggable(this.player);
    this.addKifuXgid(this.xgid.xgidstr);
    this.pushXgidPosition();
    this.showDoneUndoPanel(this.player, openroll);
  }

  undoAction() {
    //ムーブ前のボードを再表示
    if (this.undoStack.length > 0) {
      const xgidstr = this.popXgidPosition();
      this.xgid = new Xgid(xgidstr);
      this.xgid.usabledice = true;
      this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
      this.pushXgidPosition();
console.log("undoAction", xgidstr);
      this.board.showBoard2(this.xgid);
    }
  }

  doneAction() {
console.log("doneAction");
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dice = "00";
    this.xgid.turn = BgUtil.cvtTurnGm2Xg(this.player);
    this.showPipInfo();
    this.board.showBoard2(this.xgid);
    this.swapChequerDraggable(true, true);
//    this.addKifuXgid(this.xgid.xgidstr);
    this.showRollDoubleResignPanel(this.player);
  }

  diceClickAction() {
    const doneflg = this.donebtn.prop("disabled");
console.log("diceClickAction", doneflg);
    if (!doneflg) {
//    if (!this.donebtn.prop("disabled")) {
      this.doneAction();
    }
  }

  resignAction() {
console.log("resignAction");
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dice = "00";
    this.calcScore(this.player);
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
  }

  async doubleAction() {
console.log("doubleAction");
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dbloffer = true;
    this.xgid.cube += 1;
    this.xgid.cubepos = BgUtil.getXgOppo(this.xgid.turn);
    this.swapXgTurn();
    this.board.showBoard2(this.xgid); //double offer
    await this.board.animateCube(this.animDelay); //キューブを揺すのはshowBoard()の後
    this.addKifuXgid(this.xgid.xgidstr);
    this.showTakeDropPanel(this.player);
  }

  takeAction() {
console.log("takeAction");
    this.hideAllPanel();
    this.swapTurn();
    this.swapXgTurn();
    this.xgid.dice = "00";
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showRollDoubleResignPanel(this.player, false); //dont show resign button
  }

  dropAction() {
console.log("dropAction");
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.cube -= 1;
    this.calcScore(this.player); //dblofferフラグをリセットする前に計算する必要あり
    this.xgid.dbloffer = false;
    this.swapXgTurn();
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
  }

  gameendNextAction() {
console.log("gameendNextAction");
    this.hideAllPanel();
    this.showScoreInfo();
    this.addKifuXgid("\n");
    this.beginNewGame(false);
  }

  gameendOkAction() {
console.log("gameendOkAction");
    this.hideAllPanel();
    this.showScoreInfo();
  }

  bearoffAllAction() {
console.log("bearoffAllAction");
    this.calcScore(this.player); // this.player is winner
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
  }

  randomdice(openroll = false) {
    const random6 = (() => Math.floor( Math.random() * 6 ) + 1);
    const d1 = random6();
    let   d2 = random6();
    if (openroll) { //オープニングロールでは同じ目を出さない
      while (d1 == d2) {
        d2 = random6();
      }
    }
    const dicestr = String(d1) + String(d2);
console.log("randomdice", d1, d2, dicestr);
    return [d1, d2, dicestr];
  }

  showPipInfo() {
    this.pipinfo[1].text(this.xgid.get_pip(+1));
    this.pipinfo[2].text(this.xgid.get_pip(-1));
  }
  showScoreInfo() {
    this.scoreinfo[1].text(this.xgid.sc_me);
    this.scoreinfo[2].text(this.xgid.sc_yu);
  }

  calcScore(player) {
    this.gamescore = this.xgid.get_gamesc( BgUtil.cvtTurnGm2Xg(player) );
    const w = BgUtil.cvtTurnGm2Bd( player);
    const l = BgUtil.cvtTurnGm2Bd(!player);
    const scr = this.gamescore[0] * this.gamescore[1];
    this.xgid.crawford = this.xgid.checkCrawford(this.score[w], scr, this.score[l]);
    this.score[w] += scr;
    this.xgid.sc_me = this.score[1];
    this.xgid.sc_yu = this.score[2];
    this.matchwinflg = (this.matchLength != 0) && (this.score[w] >= this.matchLength);
console.log("calcScore", player, this.xgid.crawford, this.score[w], this.gamescore, this.score[l], this.score,  this.matchwinflg, this.matchLength);
  }

  canDouble(player) {
    const candbl = !this.xgid.crawford && (this.xgid.cubepos == 0) || (this.xgid.cubepos == this.xgid.turn);
console.log("canDouble", candbl, this.xgid.cubepos , this.xgid.turn, player);
    return candbl;
  }

  showOpenRollPanel() {
    this.showElement(this.openrollbtn, 'R', true);
  }

  showTakeDropPanel(player) {
console.log("showTakeDropPanel", player);
    if (player) {
      this.showElement(this.takebtn, 'R', player);
      this.showElement(this.dropbtn, 'L', player);
    } else {
      this.showElement(this.takebtn, 'L', player);
      this.showElement(this.dropbtn, 'R', player);
    }
  }

  showRollDoubleResignPanel(player, doubleresignpanel = true) {
console.log("showRollDoubleResignPanel", player);
    this.doublebtn.prop("disabled", !this.canDouble(player) );
    if (player) {
      this.showElement(this.rollbtn, 'R', player);
      if (doubleresignpanel) { this.showElement(this.doubleresign, 'L', player); }
    } else {
      this.showElement(this.rollbtn, 'L', player);
      if (doubleresignpanel) { this.showElement(this.doubleresign, 'R', player); }
    }
  }

  showDoneUndoPanel(player, opening = false) {
const moveFinished = this.xgid.moveFinished();
    this.donebtn.prop("disabled", (!moveFinished && this.flashflg) );
//    this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
console.log("showDoneUndoPanel", player, moveFinished , this.flashflg);
    if (player) {
      this.showElement(this.doneundo, 'L', player);
    } else {
      this.showElement(this.doneundo, 'R', player);
    }
    if (opening) { //オープニングロールのときは出目の大きい側に下にずらして表示
      if (player) {
        this.showElement(this.doneundo, 'R', player, 12);
      } else {
        this.showElement(this.doneundo, 'L', player, -12);
      }
    }
  }

  makeGameEndPanal(player) {
console.log("showGameEndPanel", player);
    const mes1 = "You WIN" + ((this.matchwinflg) ? " and the MATCH" : "");
    this.gameend.children('.mes1').text(mes1);
    const winlevel = ["", "SINGLE", "GAMMON", "BACK GAMMON"];
    const res = winlevel[this.gamescore[1]];
    const mes2 = "Get " + this.gamescore[0] * this.gamescore[1] + "pt (" + res + ")";
    this.gameend.children('.mes2').text(mes2);

    const p1 = BgUtil.cvtTurnGm2Bd(player);
    const p2 = BgUtil.cvtTurnGm2Bd(!player);
    const mes3 = this.score[p1] + " - " + this.score[p2] + ((this.matchLength == 0) ? "" : "&emsp;(" +this.matchLength + "pt)");
    this.gameend.children('.mes3').html(mes3);

console.log("showGameEndPanel", mes1, mes2, mes3);
  }

  showGameEndPanel(player) {
    this.makeGameEndPanal(player);
    this.gameendnextbtn.toggle(!this.matchwinflg);
    this.gameendokbtn.toggle(this.matchwinflg);

    this.gameend.show().toggleClass('turn1', player).toggleClass('turn2', !player)
                .css(this.calcCenterPosition("B", this.gameend));
  }

  hideAllPanel() {
    this.allpanel.hide();
  }

  showElement(elem, pos, player, yoffset=0) {
    elem.show().toggleClass('turn1', player).toggleClass('turn2', !player)
        .css(this.calcCenterPosition(pos, elem, yoffset));
  }

  calcCenterPosition(pos, elem, yoffset=0) {
    let p_top, p_left, p_width, p_height;
    switch (pos) {
    case 'L': //left area
      p_top = 0;
      p_left = 0;
      p_width = 36 * this.board.getVw();
      p_height = 100 * this.board.getVh();
      break;
    case 'R': //right area
      p_top = 0;
      p_left = 42 * this.board.getVw();
      p_width = 36 * this.board.getVw();
      p_height = 100 * this.board.getVh();
      break;
    case 'B': //board area
      p_top = 0;
      p_left = 0;
      p_width = 78 * this.board.getVw();
      p_height = 100 * this.board.getVh();
      break;
    case 'S': //screen (default)
    default:
      p_top = 0;
      p_left = 0;
      p_width = 100 * this.board.getVw();
      p_height = 100 * this.board.getVh();
      break;
    }
    const dy = yoffset * this.board.getVh();
    const wx = p_left + (p_width - elem.outerWidth(true)) / 2;
    const wy = p_top + (p_height - elem.outerHeight(true)) / 2 + dy;

    return {left:wx, top:wy};
  }

  pushXgidPosition() {
console.log("pushXgidPosition", this.xgid.xgidstr);
   this.undoStack.push(this.xgid.xgidstr);
  }
  popXgidPosition() {
    const r = this.undoStack.pop();
console.log("popXgidPosition", r);
    return r;
  }

  addKifuXgid(xgid) {
    this.kifuxgid.append(xgid + "\n");
//    this.kifuxgid.val( this.kifuxgid.val() + xgid + "\n"); //★FIX ME  textarea -> div
  }

/***********************************
  player2xgturn(player) {
    return (player) ? 1 : -1;
  }
  player2idx(player) {
    return (player) ? 1 : 2;
  }
  player2flipclass(player) {
    return (player) ? 'turn2' : 'turn1';
  }
  returnXgid(xgidstr) {
    this.xgid = new Xgid(xgidstr);
  }
*********************************/

  swapTurn() {
    this.player = !this.player;
  }
  swapXgTurn() {
    this.xgid.turn = -1 * this.xgid.turn;
  }

  setChequerDraggable() {
    this.chequerall.draggable({
      //event
      start: ( event, ui ) => { this.dragStartAction(event, ui); },
      stop:  ( event, ui ) => { this.dragStopAction(event, ui); },
      //options
      containment: 'parent',
      opacity: 0.6,
      zIndex: 99,
      //revertDuration: 200
    });
  }

  dragStartAction(event, ui) {
    this.dragObject = $(event.currentTarget);
    const id = this.dragObject.attr("id");
    this.dragStartPt = this.board.getDragStartPoint(id, BgUtil.cvtTurnGm2Bd(this.player));
    if (!this.outerDragFlag) { this.dragStartPos = ui.position; }
    this.outerDragFlag = false;
    this.flashOnMovablePoint(this.dragStartPt);
console.log("dragStart", this.dragStartPt, this.dragObject, event);
  }

  dragStopAction(event, ui) {
    this.flashOffMovablePoint();
    this.dragEndPt = this.board.getDragEndPoint(ui.position, BgUtil.cvtTurnGm2Bd(this.player));
    const xg = this.xgid;
    const ok = xg.isMovable(this.dragStartPt, this.dragEndPt, this.flashflg);
    const hit = xg.isHitted(this.dragEndPt);
console.log("dragStopOK?", ok, hit, this.dragStartPt, this.dragEndPt);

    if (ok) {
      if (hit) {
        const movestr = this.dragEndPt + "/25";
        this.xgid = this.xgid.moveChequer2(movestr);
        const oppoplayer = BgUtil.cvtTurnGm2Bd(!this.player);
        const oppoChequer = this.board.getChequerHitted(this.dragEndPt, oppoplayer);
        const barPt = this.board.getBarPos(oppoplayer);
        if (oppoChequer) {
          oppoChequer.dom.animate(barPt, 300, () => { this.board.showBoard2(this.xgid); });
        }
console.log("dragStopHIT", movestr, this.xgid.xgidstr);
      }
      const movestr = this.dragStartPt + "/" + this.dragEndPt;
      this.xgid = this.xgid.moveChequer2(movestr);
console.log("dragStopOK ", movestr, this.xgid.xgidstr);
      if (!hit) {
        this.board.showBoard2(this.xgid);
      }
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
console.log("dragStop button", this.xgid.moveFinished() , this.flashflg);
    this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
    const turn = BgUtil.cvtTurnGm2Xg(this.player);
    if (this.xgid.get_boff(turn) == 15) { this.bearoffAllAction(); }
  }

  swapChequerDraggable(player, init = false) {
    this.chequerall.draggable({disabled: true});
    if (init) { return; }
    const plyr = BgUtil.cvtTurnGm2Bd(player);
    for (let i = 0; i < 15; i++) {
      const pt = this.board.chequer[plyr][i].point;
      if (pt == 26 || pt == 27) { continue; }
      this.board.chequer[plyr][i].dom.draggable({disabled: false});
    }
  }

  flashOnMovablePoint(startpt) {
    if (this.flashflg) {
      let dest2 = [];
      const destpt = this.xgid.movablePoint(this.dragStartPt, this.flashflg);
      if (this.player) { dest2 = destpt; }
      else {
        for (const p of destpt) {
          const pt = (p == 0) ? 0 : 25 - p;
          dest2.push(pt);
        }
      }
console.log("flashOnMovablePoint", startpt, destpt, dest2);
      this.board.flashOnMovablePoint(dest2, BgUtil.cvtTurnGm2Bd(this.player));
    }
  }
  flashOffMovablePoint() {
    this.board.flashOffMovablePoint();
  }

  pointTouchEndAction() {
//    this.flashOffMovablePoint();
  }

  pointTouchStartAction(event) {
    const id = event.currentTarget.id;
    const pt = parseInt(id.substr(2));
    const chker = this.board.getChequerOnDragging(pt, BgUtil.cvtTurnGm2Bd(this.player));
console.log("pointTouchStartAction", id, pt, chker);

    if (chker) { //chker may be undefined
      const chkerdom = chker.dom;
      if (chkerdom.data('ui-draggable')) {
        this.dragStartPos = chker.position;
        this.outerDragFlag = true;
        const xx = event.pageX - 30;
        const yy = event.pageY - 30;
        chkerdom.css({left: xx, top: yy});
        event.type = "mousedown.draggable";
        event.target = chkerdom;
        chkerdom.trigger(event);
console.log("pointTouchStartAction", chkerdom);
      }
    }
  }

  convertKifuAction() {
    const xgidkifu = this.kifuxgid.val();
    const matkifu = this.convertKifu(xgidkifu);
    this.kifumat.val( matkifu );
  }
  convertKifu(xgidkifu) {
    //★TODO
    return "MAT KIFU\n" + xgidkifu;
  }

} //end of class BgGame
