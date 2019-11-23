// BgGame_class.js
'use strict';

class BgGame {
  constructor() {
    this.player = false; //true=player1, false=player2
    this.matchLength = 5;
    this.matchflg = true;
    this.matchwinflg = false;
    this.gamescore = 0;

    this.score = [0,0,0];
    this.cubeValue = 1; // =2^0
    this.xgidstrbf = "";
    this.undoStack = [];
    this.crawford = false;
    this.xgid = new Xgid();
    this.board = new BgBoard(this);

    this.setDomNames();
    this.setEventHandler();
    this.showpipflg = true;
    this.useclockflg = false;
    this.setChequerDraggable();
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
    this.gameendnextbtn= $("#gameendnextbtn");
    this.gameendokbtn  = $("#gameendokbtn");

    //infos
    this.playerinfo = [undefined, $("#playerinfo1"), $("#playerinfo2")];
    this.scoreinfo  = [undefined, $("#score1"), $("#score2")];
    this.pipinfo    = [undefined, $("#pip1"), $("#pip2")];
    this.matchinfo  = $("#matchinfo");

    //panel
    this.panelholder  = $("#panelholder");
    this.allpanel     = $(".area");
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
    this.kifusource  = $("#kifusource");

    //chequer
    this.chequerall = $(".chequer");
  }

  setEventHandler() {
    //Button Click Event
    this.rollbtn.    on('click', () => { this.rollAction(false); });
    this.doublebtn.  on('click', () => { this.doubleAction(); });
    this.resignbtn.  on('click', () => { this.resignAction(); });
    this.takebtn.    on('click', () => { this.takeAction(); });
    this.dropbtn.    on('click', () => { this.dropAction(); });
    this.donebtn.    on('click', () => { this.doneAction(); });
    this.undobtn.    on('click', () => { this.undoAction(); });
    this.openrollbtn.on('click', () => { this.rollAction(true); });
    this.gameendnextbtn.on('click', () => { this.gameendNextAction(); });
    this.gameendokbtn.on('click', () => { this.gameendOkAction(); });

    this.setChequerDraggable();

    //設定画面
    this.settingbtn.on('click', () => {
      this.settings.css(this.calcCenterPosition("S", this.settings)).slideToggle("normal"); //画面表示
      this.settingbtn.prop("disabled", true);
    });
//    this.resetscorebtn.on('click', () => {
//      this.score = [0,0,0];
//      this.scoreinfo[1].text(0);
//      this.scoreinfo[2].text(0);
//    });
    this.newgamebtn.on('click', () => {
      this.settings.slideToggle("normal"); //画面を消す
      this.settingbtn.prop("disabled", false);
      this.initGameOption();
      this.beginNewGame(true);
    });
    this.cancelbtn.on('click', () => {
      this.settings.slideToggle("normal"); //画面を消す
      this.settingbtn.prop("disabled", false);
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
//console.log("initGameOption", this.showpipflg, this.useclockflg, this.flashflg, this.matchLength);
  }

  beginNewGame(newmatch = false) {
//console.log("beginNewGame");
//    const initpos   = "-bbCEABCA--g---aab--------";
    const initpos = "-b----E-C---eE---c-e----B-";
    this.xgid.initialize(initpos, newmatch, this.matchLength);
    this.board.showBoard2(this.xgid);
    this.showPipInfo();
    this.setDraggableChequer(true, true);
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
    this.board.animateDice(800);
    this.board.showBoard2(this.xgid);
    if (openroll) {
      this.player = (dice[0] > dice[1]);
      this.xgid.turn = this.player2xgturn(this.player);
    }
console.log("rollAction", openroll, this.player, this.xgid.dice, this.xgid.xgidstr);
    this.setDraggableChequer(this.player);
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
    this.xgid.turn = this.player2xgturn(this.player);
    this.showPipInfo();
    this.board.showBoard2(this.xgid);
    this.setDraggableChequer(true, true);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showRollDoubleResignPanel(this.player);
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

  doubleAction() {
console.log("doubleAction");
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dbloffer = true;
    this.xgid.cube += 1;
    this.xgid.cubepos = BgUtil.getXgOppo(this.xgid.turn);
    this.swapXgTurn();
    this.board.showBoard2(this.xgid); //double offer
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
    this.xgid.dbloffer = false;
    this.calcScore(this.player);
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
  }

  gameendNextAction() {
console.log("gameendNextAction");
    this.hideAllPanel();
    this.showScoreInfo();
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
    this.gamescore = this.xgid.get_gamesc( this.player2xgturn(player) );
    const w = this.player2idx( player);
    const l = this.player2idx(!player);
    this.xgid.crawford = this.xgid.checkCrawford(this.score[w], this.gamescore, this.score[l]);
    this.score[w] += this.gamescore;
    this.xgid.sc_me = this.score[1];
    this.xgid.sc_yu = this.score[2];
    this.matchwinflg = (this.matchLength != 0) && (this.score[w] >= this.matchLength);
console.log("calcScore", player, this.xgid.crawford, this.score[w], this.gamescore, this.score[l], this.score);
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
console.log("showDoneUndoPanel", player);
    this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
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

  showGameEndPanel(player) {
console.log("showGameEndPanel", player);
    const mes1 = "You WIN" + ((this.matchwinflg) ? " and the MATCH" : "");
    this.gameend.children('.mes1').text(mes1);

    const mes2 = "Get " + this.gamescore + "pt";
    this.gameend.children('.mes2').text(mes2);

    const p1 = this.player2idx(player);
    const p2 = this.player2idx(!player);
    const mes3 = this.score[p1] + " - " + this.score[p2] + ((!this.matchflg) ? "" : "&emsp;(" +this.matchLength + "pt)");
    this.gameend.children('.mes3').html(mes3);

console.log("showGameEndPanel", mes1, mes2, mes3);
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
    this.kifusource.append(xgid + "\n");
  }

  player2xgturn(player) {
    return (player) ? 1 : -1;
  }
  player2idx(player) {
    return (player) ? 1 : 2;
  }
  player2flipclass(player) {
    return (player) ? 'turn2' : 'turn1';
  }
  swapTurn() {
    this.player = !this.player;
  }
  swapXgTurn() {
    this.xgid.turn = -1 * this.xgid.turn;
  }

  returnXgid(xgidstr) {
    this.xgid = new Xgid(xgidstr);
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
    this.dragStartPt = this.board.calcStartPt(this.dragObject); //dragStartPt is player relative
    this.dragStartPos = ui.position;
    this.flashOnMovablePoint(this.dragStartPt);
console.log("dragStart", this.dragStartPt);
  }

  dragStopAction(event, ui) {
    this.flashOffMovablePoint();
    this.dragEndPt = this.board.calcPosition2Point(ui.position, this.player2idx(this.player));
    const xg = this.xgid;
    const ok = xg.isMovable(this.dragStartPt, this.dragEndPt, this.flashflg);
    const hit = xg.isHitted(this.dragEndPt);
console.log("dragStopOK?", ok, hit, this.dragStartPt, this.dragEndPt);

    if (ok) {
      if (hit) {
        const movestr = this.dragEndPt + "/25";
        this.xgid = this.xgid.moveChequer(movestr);
        const oppoplayer = this.player2idx(!this.player);
        const oppoChequer = this.board.getOppoChequerAndGotoBar(this.dragEndPt, oppoplayer);
        const barPt = this.board.getBarPos(oppoplayer);
        oppoChequer.dom.animate(barPt, 300, () => { this.board.showBoard2(this.xgid); });
        const bar = (this.player) ? 25 : 0;
console.log("dragStopHIT", movestr, this.xgid.xgidstr);
      }
      const movestr = this.dragStartPt + "/" + this.dragEndPt;
      this.xgid = this.xgid.moveChequer(movestr);
//      this.pushXgidPosition();
console.log("dragStopOK ", movestr, this.xgid.xgidstr);
      if (!hit) {
        this.board.showBoard2(this.xgid);
      }
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
console.log("dragStop button", this.xgid.moveFinished() , this.flashflg);
    this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
    const turn = this.player2xgturn(this.player);
    if (this.xgid.get_boff(turn) == 15) { this.bearoffAllAction(); }
  }

  setDraggableChequer(player, init = false) {
    this.chequerall.draggable({disabled: true});
    if (init) { return; }
    const plyr = this.player2idx(player);
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
      this.board.flashOnMovablePoint(dest2, this.player2idx(this.player));
    }
  }
  flashOffMovablePoint() {
    this.board.flashOffMovablePoint();
  }

} //end of class BgGame
