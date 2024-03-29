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
    this.gameFinished = true;
    this.settingVars = {}; //設定内容を保持するオブジェクト

    this.closeout = [null, false, false];

    this.clock = [0, 600, 600];
    this.delayInit = 12;
    this.delay = this.delayInit;
    this.clockplayer = 0;
    this.clockobj = 0;

    this.setDomNames();
    this.setEventHandler();
    this.setChequerDraggable();
    this.showpipflg = true;
    this.clockmodeflg = false;
    this.pauseMode = false; //true=ゲーム中、false=ゲーム開始前
    this.flashflg = true;
    this.jacobyflg = true;
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
    this.pausebtn    = $("#pausebtn");
    this.restartbtn  = $("#restartbtn");
    this.openrollbtn = $("#openingroll");
    this.passbtn     = $("#passbtn");
    this.downloadkifubtn = $("#downloadkifubtn");
    this.gameendnextbtn= $("#gameendnextbtn");
    this.gameendokbtn  = $("#gameendokbtn");
    this.diceAsBtn  = $("#dice10,#dice11,#dice20,#dice21");
    this.pointTriangle = $(".point");

    //infos
    this.playerinfo = [undefined, $("#playerinfo1"), $("#playerinfo2")];
    this.scoreinfo  = [undefined, $("#score1"), $("#score2")];
    this.pipinfo    = [undefined, $("#pip1"), $("#pip2")];
    this.timerinfo  = [undefined, $("#timer1"), $("#timer2")];
    this.matchinfo  = $("#matchinfo");

    //panel
    this.panelholder  = $("#panelholder");
    this.allpanel     = $(".panel");
    this.rolldouble   = $("#rolldouble");
    this.doneundo     = $("#doneundo");
    this.gameend      = $("#gameend");
    this.hideAllPanel(); //font awesome が描画するのを待つ必要がある
    this.panelholder.show();

    //settings and valiables
    this.settings    = $("#settings");
    this.showpipflg  = $("[name=showpip]").prop("checked");
    this.clockmodeflg= $("[name=useclock]").prop("checked");
    this.flashflg    = $("[name=flashdest]").prop("checked"); //ドラッグ開始時に移動可能なポイントを光らせる
    this.jacobyflg   = $("[name=jacoby]").prop("checked");
    this.matchlen    = $("#matchlen");
    this.kifuxgid    = $("#kifuxgid");

    //clock
    this.pausepanel  = $("#pausepanel");
    this.selminpoint = $("#selminpoint");
    this.seldelay    = $("#seldelay");

    //chequer
    this.chequerall = $(".chequer");
  }

  setEventHandler() {
    const clickEventType = 'click touchstart'; //(( window.ontouchstart !== null ) ? 'click':'touchstart');
    //Button Click Event
    this.rollbtn.       on(clickEventType, (e) => { e.preventDefault(); this.rollAction(false); });
    this.doublebtn.     on(clickEventType, (e) => { e.preventDefault(); this.doubleAction(); });
    this.resignbtn.     on(clickEventType, (e) => { e.preventDefault(); this.resignAction(); });
    this.takebtn.       on(clickEventType, (e) => { e.preventDefault(); this.takeAction(); });
    this.dropbtn.       on(clickEventType, (e) => { e.preventDefault(); this.dropAction(); });
    this.donebtn.       on(clickEventType, (e) => { e.preventDefault(); this.doneAction(); });
    this.undobtn.       on(clickEventType, (e) => { e.preventDefault(); this.undoAction(); });
    this.openrollbtn.   on(clickEventType, (e) => { e.preventDefault(); this.rollAction(true); });
    this.passbtn.       on(clickEventType, (e) => { e.preventDefault(); this.passAction(); });
    this.gameendnextbtn.on(clickEventType, (e) => { e.preventDefault(); this.gameendNextAction(); });
    this.gameendokbtn.  on(clickEventType, (e) => { e.preventDefault(); this.gameendOkAction(); });
    this.diceAsBtn.     on(clickEventType, (e) => { e.preventDefault(); this.diceAsDoneAction(e); });
    this.settingbtn.    on(clickEventType, (e) => { e.preventDefault(); this.showSettingPanelAction(); });
    this.pausebtn.      on(clickEventType, (e) => { e.preventDefault(); this.pauseClockAction(); });
    this.restartbtn.    on(clickEventType, (e) => { e.preventDefault(); this.restartClockAction(); });
    this.newgamebtn.    on(clickEventType, (e) => { e.preventDefault(); this.newGameAction(); });
    this.downloadkifubtn.on(clickEventType, (e) => { e.preventDefault(); this.downloadKifuAction(); });
    this.cancelbtn.     on(clickEventType, (e) => { e.preventDefault(); this.cancelSettingPanelAction(); });
    this.pointTriangle. on('touchstart mousedown', (e) => { e.preventDefault(); this.pointTouchStartAction(e); });
    $(window).          on('resize',       (e) => { e.preventDefault(); this.board.redraw(); }); 
  }

  initGameOption() {
    this.clockmodeflg= $("[name=useclock]") .prop("checked");
    this.showpipflg  = $("[name=showpip]")  .prop("checked");
    this.flashflg    = $("[name=flashdest]").prop("checked");
    this.jacobyflg   = $("[name=jacoby]")   .prop("checked");

    this.matchLength = parseInt(this.matchlen.val());
    const matchinfotxt = (this.matchLength == 0) ? "$" : this.matchLength;
    this.matchinfo.text(matchinfotxt);
    this.score = [0,0,0];
    this.scoreinfo[1].text(0);
    this.scoreinfo[2].text(0);
    this.setClockOption();

    $(".clock,.delay").toggle(this.clockmodeflg).removeClass("timeupLose");
    $(".pip").toggle(this.showpipflg && !this.clockmodeflg); //クロックモードのときはピップ表示しない
    this.pausebtn.toggle(this.clockmodeflg); //クロックモードでない時はポーズボタンを表示しない
    this.setButtonEnabled(this.pausebtn, false);
//console.log("initGameOption", this.showpipflg, this.jacobyflg, this.flashflg, this.matchLength, this.clockmodeflg);
  }

  beginNewGame(newmatch = false) {
    const initpos = "-b----E-C---eE---c-e----B-";
    this.xgid.initialize(initpos, newmatch, this.matchLength);
    this.board.showBoard2(this.xgid);
    this.showPipInfo();
    this.swapChequerDraggable(true, true);
    this.hideAllPanel();
    this.showOpenRollPanel();
//console.log("beginNewGame", this.xgid.xgidstr, this.xgid.matchsc);
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
      this.tapTimer(this.player);
      this.gameFinished = false;
    }
//console.log("rollAction", openroll, this.player, this.xgid.dice, this.xgid.xgidstr);
    this.swapChequerDraggable(this.player);
    this.addKifuXgid(this.xgid.xgidstr);
    this.pushXgidPosition();
    this.showDoneUndoPanel(this.player, openroll);
  }

  undoAction() {
    //ムーブ前のボードを再表示
    if (this.undoStack.length == 0) { return; }
    const xgidstr = this.popXgidPosition();
    this.xgid = new Xgid(xgidstr);
    this.xgid.usabledice = true;
    this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
    this.pushXgidPosition();
    this.board.showBoard2(this.xgid);
    this.swapChequerDraggable(this.player);
  }

  doneAction() {
    if (this.donebtn.prop("disabled")) { return; }
    if (this.gameFinished) { return; }
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dice = "00";
    this.swapXgTurn();
    this.showPipInfo();
    this.board.showBoard2(this.xgid);
    this.swapChequerDraggable(true, true);
    this.showRollDoublePanel(this.player);
    this.tapTimer(this.player);
  }

  resignAction() {
    this.cancelSettingPanelAction();
    if (this.gameFinished) { return; }
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dice = "00";
    this.calcScore(this.player);
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
    this.gameFinished = true;
    this.pauseTimer(false);
  }

  async doubleAction() {
    if (this.doublebtn.prop("disabled")) { return; }
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dbloffer = true;
    this.board.showBoard2(this.xgid); //double offer
    await this.board.animateCube(this.animDelay); //キューブを揺すのはshowBoard()の後
    this.addKifuXgid(this.xgid.xgidstr);
    this.swapXgTurn(); //XGのturnを変えるのは棋譜用XGID出力後
    this.showTakeDropPanel(this.player);
    this.tapTimer(this.player);
  }

  takeAction() {
    this.hideAllPanel();
    this.swapTurn();
    this.xgid.dice = "00";
    this.xgid.cube += 1;
    this.xgid.cubepos = this.xgid.turn;
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.swapXgTurn(); //XGのturnを変えるのは棋譜用XGID出力後
    this.showRollDoublePanel(this.player);
    this.tapTimer(this.player);
  }

  dropAction() {
    this.hideAllPanel();
    this.swapTurn();
    this.calcScore(this.player); //dblofferフラグをリセットする前に計算する必要あり
    this.xgid.dbloffer = false;
    this.board.showBoard2(this.xgid);
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
    this.gameFinished = true;
    this.pauseTimer(false);
  }

  gameendNextAction() {
    this.hideAllPanel();
    this.showScoreInfo();
    this.addKifuXgid(''); //空行
    this.beginNewGame(false);
  }

  gameendOkAction() {
    this.hideAllPanel();
    this.showScoreInfo();
  }

  bearoffAllAction() {
    this.hideAllPanel();
    this.calcScore(this.player); // this.player is winner
    this.addKifuXgid(this.xgid.xgidstr);
    this.showGameEndPanel(this.player);
    this.gameFinished = true;
    this.pauseTimer(false);
  }

  diceAsDoneAction(e) {
    if (BgUtil.cvtTurnGm2Bd(this.player) != e.currentTarget.id.substr(4,1)) { return; } //ex. id="dice10"
    this.doneAction();
  }

  showSettingPanelAction() {
    this.pauseTimer(this.pauseMode);
    this.settings.css(this.calcCenterPosition("S", this.settings));
    this.settings.slideToggle("normal", () => this.saveSettingVars()); //画面表示、設定情報を退避しておく
    this.setButtonEnabled(this.settingbtn, false);
    this.setButtonEnabled(this.pausebtn, false);
  }

  cancelSettingPanelAction() {
    this.startTimer(this.pauseMode);
    this.settings.slideToggle("normal", () => this.loadSettingVars()); //画面を消す、設定情報を戻す
    this.setButtonEnabled(this.settingbtn, true);
    this.setButtonEnabled(this.pausebtn, this.pauseMode); //ゲーム中でないときは非活性のまま
  }

  newGameAction() {
    this.settings.slideToggle("normal"); //画面を消す
    this.settingbtn.prop("disabled", false);
    this.initGameOption();
    this.clearKifuXgid();
    this.beginNewGame(true);
  }

  resetScoreAction() {
    this.score = [0,0,0];
    this.scoreinfo[1].text(0);
    this.scoreinfo[2].text(0);
  }

  passAction() {
    this.xgid.dice = "66";
    this.addKifuXgid(this.xgid.xgidstr);
    this.doneAction();
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
    return [d1, d2, dicestr];
  }

  showPipInfo() {
    this.pipinfo[1].text(this.xgid.get_pip(+1));
    this.pipinfo[2].text(this.xgid.get_pip(-1));
  }

  showScoreInfo() {
    this.scoreinfo[1].text(this.score[1]);
    this.scoreinfo[2].text(this.score[2]);
  }

  calcScore(player) {
    let [cubeprice, gammonprice] = this.xgid.get_gamesc( BgUtil.cvtTurnGm2Xg(player) );
    if (this.jacobyflg && this.matchLength == 0 && cubeprice == 1) {
      gammonprice = 1;
    }
    this.gamescore = [cubeprice, gammonprice];
    const w = BgUtil.cvtTurnGm2Bd( player);
    const l = BgUtil.cvtTurnGm2Bd(!player);
    const scr = this.gamescore[0] * this.gamescore[1];
    this.xgid.crawford = this.xgid.checkCrawford(this.score[w], scr, this.score[l]);
    this.score[w] += scr;
    this.xgid.sc_me = this.score[1];
    this.xgid.sc_yu = this.score[2];
    this.matchwinflg = (this.matchLength != 0) && (this.score[w] >= this.matchLength);
  }

  canDouble(player) {
    return !this.xgid.crawford && (this.xgid.cubepos == 0) || (this.xgid.cubepos == this.xgid.turn);
  }

  showOpenRollPanel() {
    this.showElement(this.openrollbtn, 'R', true);
  }

  showTakeDropPanel(player) {
    if (player) {
      this.showElement(this.takebtn, 'R', player);
      this.showElement(this.dropbtn, 'L', player);
    } else {
      this.showElement(this.takebtn, 'L', player);
      this.showElement(this.dropbtn, 'R', player);
    }
  }

  showRollDoublePanel(player) {
    this.doublebtn.prop("disabled", !this.canDouble(player) );
    const closeout = this.isCloseout(player);
    this.rollbtn.toggle(!closeout); //rollボタンかpassボタンのどちらかを表示
    this.passbtn.toggle( closeout);
    if (player) {
      this.showElement(this.rolldouble, 'R', player);
    } else {
      this.showElement(this.rolldouble, 'L', player);
    }
  }

  showDoneUndoPanel(player, opening = false) {
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

  makeGameEndPanal(player, timeuplose) {
    const mes1 = "You WIN" + ((this.matchwinflg) ? " and the MATCH" : "");
    this.gameend.children('.mes1').text(mes1);

    if (timeuplose) {
      const mes2 = "Opponent LOSE by Timeup!";
      this.gameend.children('.mes2').text(mes2);
    } else {
      const winlevel = ["", "SINGLE", "GAMMON", "BACK GAMMON"];
      const res = winlevel[this.gamescore[1]];
      const mes2 = "Get " + this.gamescore[0] * this.gamescore[1] + "pt (" + res + ")";
      this.gameend.children('.mes2').text(mes2);
    }

    const p1 = BgUtil.cvtTurnGm2Bd(player);
    const p2 = BgUtil.cvtTurnGm2Bd(!player);
    if (timeuplose) {
      this.score[p1] = this.matchLength;
    }
    const mes3 = this.score[p1] + " - " + this.score[p2] + ((this.matchLength == 0) ? "" : "&emsp;(" +this.matchLength + "pt)");
    this.gameend.children('.mes3').html(mes3);
  }

  showGameEndPanel(player, timeuplose = false) {
    this.makeGameEndPanal(player, timeuplose);
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
   this.undoStack.push(this.xgid.xgidstr);
  }

  popXgidPosition() {
    return this.undoStack.pop();
  }

  swapTurn() {
    this.player = !this.player;
  }

  swapXgTurn() {
    this.xgid.turn = -1 * this.xgid.turn;
  }

  isCloseout(player) {
    const xgturn = BgUtil.cvtTurnGm2Xg(!player); //クローズアウトを確認するのは相手側
    return this.xgid.isCloseout(xgturn);
  }

  setChequerDraggable() {
    //関数内広域変数
    var x;//要素内のクリックされた位置
    var y;
    var dragobj; //ドラッグ中のオブジェクト
    var zidx; //ドラッグ中のオブジェクトのzIndexを保持

    //この関数内の処理は、パフォーマンスのため jQuery Free で記述

    //ドラッグ開始時のコールバック関数
    const evfn_dragstart = ((origevt) => {
      dragobj = origevt.currentTarget; //dragする要素を取得し、広域変数に格納
      if (!dragobj.classList.contains("draggable")) { return; } //draggableでないオブジェクトは無視

      dragobj.classList.add("dragging"); //drag中フラグ(クラス追加/削除で制御)
      zidx = dragobj.style.zIndex;
      dragobj.style.zIndex = 999;

      //マウスイベントとタッチイベントの差異を吸収
      const event = (origevt.type === "mousedown") ? origevt : origevt.changedTouches[0];

      //要素内の相対座標を取得
      x = event.pageX - dragobj.offsetLeft;
      y = event.pageY - dragobj.offsetTop;

      //イベントハンドラを登録
      document.body.addEventListener("mousemove",  evfn_drag,    {passive:false});
      document.body.addEventListener("mouseleave", evfn_dragend, false);
      dragobj.      addEventListener("mouseup",    evfn_dragend, false);
      document.body.addEventListener("touchmove",  evfn_drag,    {passive:false});
      document.body.addEventListener("touchleave", evfn_dragend, false);
      document.body.addEventListener("touchend",   evfn_dragend, false);

      const ui = {position: { //dragStartAction()に渡すオブジェクトを作る
                   left: dragobj.offsetLeft,
                   top:  dragobj.offsetTop
                 }};
      this.dragStartAction(origevt, ui);
    });

    //ドラッグ中のコールバック関数
    const evfn_drag = ((origevt) => {
      origevt.preventDefault(); //フリックしたときに画面を動かさないようにデフォルト動作を抑制

      //マウスイベントとタッチイベントの差異を吸収
      const event = (origevt.type === "mousemove") ? origevt : origevt.changedTouches[0];

      //マウスが動いた場所に要素を動かす
      dragobj.style.top  = event.pageY - y + "px";
      dragobj.style.left = event.pageX - x + "px";
    });

    //ドラッグ終了時のコールバック関数
    const evfn_dragend = ((origevt) => {
      dragobj.classList.remove("dragging"); //drag中フラグを削除
      dragobj.style.zIndex = zidx;

      //イベントハンドラの削除
      document.body.removeEventListener("mousemove",  evfn_drag,    false);
      document.body.removeEventListener("mouseleave", evfn_dragend, false);
      dragobj.      removeEventListener("mouseup",    evfn_dragend, false);
      document.body.removeEventListener("touchmove",  evfn_drag,    false);
      document.body.removeEventListener("touchleave", evfn_dragend, false);
      document.body.removeEventListener("touchend",   evfn_dragend, false);

      const ui = {position: { //dragStopAction()に渡すオブジェクトを作る
                   left: dragobj.offsetLeft,
                   top:  dragobj.offsetTop
                 }};
      this.dragStopAction(origevt, ui);
    });

    //dragできるオブジェクトにdragstartイベントを設定
    for(const elm of this.chequerall) {
      elm.addEventListener("mousedown",  evfn_dragstart, false);
      elm.addEventListener("touchstart", evfn_dragstart, false);
    }
  }

  dragStartAction(event, ui) {
    this.dragObject = $(event.currentTarget); //dragStopAction()で使うがここで取り出しておかなければならない
    const id = event.currentTarget.id;
    this.dragStartPt = this.board.getDragStartPoint(id, BgUtil.cvtTurnGm2Bd(this.player));
    if (!this.outerDragFlag) { this.dragStartPos = ui.position; }
    this.outerDragFlag = false;
    this.flashOnMovablePoint(this.dragStartPt);
  }

  dragStopAction(event, ui) {
    this.flashOffMovablePoint();
    this.dragEndPt = this.board.getDragEndPoint(ui.position, BgUtil.cvtTurnGm2Bd(this.player));
    const xg = this.xgid;
    const ok = xg.isMovable(this.dragStartPt, this.dragEndPt, this.flashflg);
    const hit = xg.isHitted(this.dragEndPt);

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
      }
      const movestr = this.dragStartPt + "/" + this.dragEndPt;
      this.xgid = this.xgid.moveChequer2(movestr);
      if (!hit) {
        this.board.showBoard2(this.xgid);
      }
    } else {
      this.dragObject.animate(this.dragStartPos, 300);
    }
    this.swapChequerDraggable(this.player);
    this.donebtn.prop("disabled", (!this.xgid.moveFinished() && this.flashflg) );
    const turn = BgUtil.cvtTurnGm2Xg(this.player);
    if (this.xgid.get_boff(turn) == 15) { this.bearoffAllAction(); }
  }

  swapChequerDraggable(player, init = false) {
    this.chequerall.removeClass("draggable");
    if (init) { return; }
    const plyr = BgUtil.cvtTurnGm2Bd(player);
    for (let i = 0; i < 15; i++) {
      const pt = this.board.chequer[plyr][i].point;
      if (pt == 26 || pt == 27) { continue; }
      this.board.chequer[plyr][i].dom.addClass("draggable");
    }
  }

  flashOnMovablePoint(startpt) {
    if (!this.flashflg) { return; }
    let dest2 = [];
    const destpt = this.xgid.movablePoint(this.dragStartPt, this.flashflg);
    if (this.player) { dest2 = destpt; }
    else {
      for (const p of destpt) {
        const pt = (p == 0) ? 0 : 25 - p;
        dest2.push(pt);
      }
    }
    this.board.flashOnMovablePoint(dest2, BgUtil.cvtTurnGm2Bd(this.player));
  }

  flashOffMovablePoint() {
    this.board.flashOffMovablePoint();
  }

  pointTouchStartAction(origevt) {
    const id = origevt.currentTarget.id;
    const pt = parseInt(id.substr(2));
    const chker = this.board.getChequerOnDragging(pt, BgUtil.cvtTurnGm2Bd(this.player));
    const evttypeflg = (origevt.type === "mousedown")
    const event = (evttypeflg) ? origevt : origevt.changedTouches[0];

    if (chker) { //chker may be undefined
      const chkerdom = chker.dom;
      if (chkerdom.hasClass("draggable")) {
        this.outerDragFlag = true;
        this.dragStartPos = {left: chkerdom[0].style.left,
                             top:  chkerdom[0].style.top };
        chkerdom.css({left: event.clientX - 30,
                      top:  event.clientY - 30});
        let delegateEvent;
        if (evttypeflg) {
          delegateEvent = new MouseEvent("mousedown", {clientX:event.clientX, clientY:event.clientY});
        } else {
          const touchobj = new Touch({identifier: 12345,
                                      target: chkerdom[0],
                                      clientX: event.clientX,
                                      clientY: event.clientY,
                                      pageX: event.pageX,
                                      pageY: event.pageY});
          delegateEvent = new TouchEvent("touchstart", {changedTouches:[touchobj]});
        }
        chkerdom[0].dispatchEvent(delegateEvent);
      }
    }
  }

  //棋譜処理用ロジック
  clearKifuXgid() {
    this.kifuxgid.text('');
  }

  addKifuXgid(xgid) {
    this.kifuxgid.append(xgid + "\n");
  }

  downloadKifuAction() {
//console.log("downloadKifuAction");
    const kifu = new BgKifu(this);
    kifu.convertKifu();
    kifu.downloadKifu();
  }

  //クロックタイマー用ロジック
  tapTimer(turn) {
    if (!this.clockmodeflg) { return; }

    this.clockplayer = BgUtil.cvtTurnGm2Bd(turn);
    const player = this.clockplayer;
    const oppo = BgUtil.getBdOppo(this.clockplayer);

    this.pauseMode = true; //ゲーム中モード
    this.delay = this.delayInit; //保障時間を設定
    this.stopTimer(); //相手方のクロックをストップし
    this.startTimer(this.pauseMode); //自分方のクロックをスタートさせる

    $("#delay" + player).text(Math.trunc(this.delay)).show();
    $("#delay" + oppo).hide();
    this.setButtonEnabled(this.pausebtn, true);
//console.log("tapTimer", turn, player);
  }

  pauseTimer(pausemode) {
    this.stopTimer();
    this.pauseMode = pausemode;
    this.setButtonEnabled(this.pausebtn, false); //ポーズ時はポーズボタンは非活性
    if (!pausemode) {
      $(".delay").hide(); //ゲーム終了時にはディレイは非表示
    } //ポーズボタン、設定ボタンが押されたとき(ゲーム中モード時)はディレイはそのまま表示
  }

  //クロックをカウントダウン
  countdownClock(player, clockspd) {
    if (this.delay > 0) {
      //保障時間内
      this.delay -= clockspd / 1000;
      $("#delay" + player).text(Math.trunc(this.delay));
    } else {
      //保障時間切れ後
      $("#delay" + player).hide();
      this.clock[player] -= clockspd / 1000;
      this.dispTimer(player, this.clock[player]);
      if (this.clock[player] <= 0) {
        this.timeupLose(player); //切れ負け処理
      }
    }
  }

  startTimer(pausemode) {
    if (!pausemode) { return; }
    const clockspd = 1000;
    this.clockobj = setInterval(() => this.countdownClock(this.clockplayer, clockspd), clockspd);
    //アロー関数で呼び出すことで、コールバック関数内でthisが使える
  }

  stopTimer() {
    clearInterval(this.clockobj);
  }

  dispTimer(player, time) {
    if (time < 0) { time = 0; }
    const min = Math.trunc(time / 60);
    const sec = Math.trunc(time % 60);
    const timestr = ("00" + min).substr(-2) + ":" + ("00" + sec).substr(-2);
    $("#clock" + player).text(timestr);
  }

  timeupLose(player) {
    $("#clock" + player).addClass("timeupLose");
    const oppo = BgUtil.cvtTurnBd2Gm(BgUtil.getBdOppo(player));
    this.matchwinflg = true;
    this.showGameEndPanel(oppo, true); //切れ勝ちの画面を表示
    this.gameFinished = true;
    this.pauseTimer(false);
  }

  pauseClockAction() {
    this.pauseTimer(true); //ポーズボタンを押せるのはゲーム中モードのときのみ
    this.pausepanel.css(this.calcCenterPosition("B", this.pausepanel)).slideToggle("normal"); //画面表示
    this.setButtonEnabled(this.pausebtn, false);
    this.setButtonEnabled(this.settingbtn, false);
  }

  restartClockAction() {
    this.startTimer(true);
    this.pausepanel.slideToggle("normal"); //画面を消す
    this.setButtonEnabled(this.pausebtn, true);
    this.setButtonEnabled(this.settingbtn, true);
  }

  setClockOption() {
    const time = (this.matchLength == 0) ? 100 * 60
                                         : Math.ceil(parseInt(this.matchlen.val()) * parseFloat(this.selminpoint.val())) * 60;
    //設定時間 = ポイント数 x 時間(分) で分単位に切り上げ。このアプリは秒で管理するため、60を掛ける
    this.clock = [0, time, time];
    this.delayInit = parseInt(this.seldelay.val());
    this.dispTimer(1, time);
    this.dispTimer(2, time);
    $("#delay1").text(this.delayInit);
    $("#delay2").text(this.delayInit);
//console.log("setClockOption", this.clock, this.delayInit, time);
  }

  setButtonEnabled(button, enable) {
    button.prop("disabled", !enable);
  }

  saveSettingVars() {
    this.settingVars.matchlen    = $("#matchlen").val();
    this.settingVars.selminpoint = $("#selminpoint").val();
    this.settingVars.seldelay    = $("#seldelay").val();
    this.settingVars.showpip     = $("#showpip").prop("checked");
    this.settingVars.flashdest   = $("#flashdest").prop("checked");
    this.settingVars.useclock    = $("#useclock").prop("checked");
    this.settingVars.jacoby      = $("#jacoby").prop("checked");
  }

  loadSettingVars() {
    $("#matchlen")   .val(this.settingVars.matchlen);
    $("#selminpoint").val(this.settingVars.selminpoint);
    $("#seldelay")   .val(this.settingVars.seldelay);
    $("#showpip")    .prop("checked", this.settingVars.showpip);
    $("#flashdest")  .prop("checked", this.settingVars.flashdest);
    $("#useclock")   .prop("checked", this.settingVars.useclock);
    $("#jacoby")     .prop("checked", this.settingVars.jacoby);
  }

} //end of class BgGame
