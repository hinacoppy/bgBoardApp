// BgXgid_class.js
'use strict';

class Xgid {
  constructor(xgid) {
    if (xgid == null || xgid == "") {
      xgid = "XGID=--------------------------:0:0:0:00:0:0:0:0:0";
    }
    this._xgid = xgid;
    this._position = "--------------------------";
    this._cube = 0;
    this._cubepos = 0;
    this._turn = 0;
    this._dice = "00";
    this._dice_odr = "00";
    this._dice_ary = [0, 0, 0];
    this._sc_me = 0;
    this._sc_yu = 0;
    this._jb = 0;
    this._matchsc = 0;
    this._maxcube = 0;
    this._crawford = false;
    this._ptno = new Array(26);
    this._ptcol = new Array(26);
    this._pip = [0, 0];
    this._boff = [0, 0];
    this._gamesc = [[], []];
    this._bgarea = [0, 0]; // BG負けエリアの駒の数
    this._gmarea = [0, 0]; //  G負けエリアの駒の数
    this._dbloffer = false;

    this._parse_xgid(this._xgid); // XGIDを解析
    this._parse_position(this._position); // ボード状態を解析
    this._calc_score(); // ゲームスコアを計算
    this.zorome = (this.get_dice(1) == this.get_dice(2));
    this._usable_dice = this._setUsableDice(); //ムーブに使えるダイスリスト
    this._turnpos = ((p) => (this._turn == 1) ? p : 25 - p);
  }

  // XGIDをパースし状態をローカル変数に格納
  _parse_xgid(xgidstr) {
    const xgidstr2 = xgidstr.substr("XGID=".length);
    const s = xgidstr2.split(":");

    if (s[4] == "D") { s[4] = "00"; this._dbloffer = true; }

    this._position= s[0];
    this._cube    = Number(s[1]);
    this._cubepos = Number(s[2]);
    this._turn    = Number(s[3]);
    this._set_dice(s[4]);
    this._sc_me   = Number(s[5]);
    this._sc_yu   = Number(s[6]);
    this._jb      = Number(s[7]);
    this._matchsc = Number(s[8]);
    this._maxcube = Number(s[9]);

    // クロフォード状態を確認
    this._crawford = (this._matchsc > 0 && this._jb != 0) ? true : false;
  }

  _set_dice(dicestr) {
    this._dice = dicestr;
    // dice_odrはダイスを昇順にして保持する
    const dice1 = dicestr.substr(0,1);
    const dice2 = dicestr.substr(1,1);
    if (dice1 > dice2) { this._dice_odr = dice2 + dice1; }
    this._dice_ary = [0, parseInt(dice1), parseInt(dice2)];
    this._dbloffer = false;
    this.zorome = (dice1 == dice2);
  }

  //ポジション情報をパースし状態をローカル変数に格納
  //ついでに、ピップ数とベアオフチェッカーを数えておく
  _parse_position(pt) {
    this._pip[0]  = this._pip[1]  = 0;
    this._boff[0] = this._boff[1] = 15;

    const posary = pt.split("");  // 一文字ずつに分解
    for (let i=0; i<=25; i++) {
      const asc = posary[i].charCodeAt(0);
      if (asc == "-".charCodeAt(0)) {
        this._ptno[i] = 0; this._ptcol[i] = 0;
      } else if (asc >= "a".charCodeAt(0) && asc <= "z".charCodeAt(0)) {
        this._ptno[i] = asc - "a".charCodeAt(0) + 1;
        this._ptcol[i] = -1;
        this._boff[1] -= this._ptno[i];
        if (i< 7) { this._bgarea[1] += this._ptno[i]; }
        if (i<19) { this._gmarea[1] += this._ptno[i]; }
        this._pip[1] += this._ptno[i] * (25 - i); // ピップ数を計算
      } else if (asc >= "A".charCodeAt(0) && asc <= "Z".charCodeAt(0)) {
        this._ptno[i] = asc - "A".charCodeAt(0) + 1;
        this._ptcol[i] = 1;
        this._boff[0] -= this._ptno[i];
        if (i>18) { this._bgarea[0] += this._ptno[i]; }
        if (i> 6) { this._gmarea[0] += this._ptno[i]; }
        this._pip[0] += this._ptno[i] * (i - 0); // ピップ数を計算
      }
    } // for
  }

  _makeXgidStr() {
    this._xgid = "XGID=" +
                 this._position + ":" +
                 this._cube + ":" +
                 this._cubepos + ":" +
                 this._turn + ":" +
                 (this._dbloffer ? "D" : this._dice) + ":" +
                 this._sc_me + ":" +
                 this._sc_yu + ":" +
                 ((this._matchsc > 0) ? (this._crawford ? 1 : 0) : this._jb) + ":" +
                 this._matchsc + ":" +
                 this._maxcube ;
  }

  _calc_score() {
    // 負け側の駒を数えて、勝ち側のスコアを計算する
    const cubeprice = Math.pow(2, this._cube);
    const contact = this._have_contact();
    if (this._boff[0] > 0)        { this._gamesc[1] = [cubeprice, 1]; }
    else if (contact)             { this._gamesc[1] = [cubeprice, 3]; }
    else if (this._bgarea[0] > 0) { this._gamesc[1] = [cubeprice, 3]; }
    else if (this._gmarea[0] > 0) { this._gamesc[1] = [cubeprice, 2]; }
    else                          { this._gamesc[1] = [cubeprice, 1]; }
    if (this._boff[1] > 0)        { this._gamesc[0] = [cubeprice, 1]; }
    else if (contact)             { this._gamesc[0] = [cubeprice, 3]; }
    else if (this._bgarea[1] > 0) { this._gamesc[0] = [cubeprice, 3]; }
    else if (this._gmarea[1] > 0) { this._gamesc[0] = [cubeprice, 2]; }
    else                          { this._gamesc[0] = [cubeprice, 1]; }
  }

  _have_contact() {
    // 駒の色を見て、変化が2回あればコンタクトありと判断
    let co = 0, bf = 0, cntct = 0;
    for (let i=0; i<=25; i++) {
      co = this._ptcol[i];
      if (co == 0) { continue; }
      if (bf != co) { cntct += 1; }
      bf = co;
    }
    return (cntct > 2);
  }

  // getter functions
  get_xgidstr()  { return this._xgid; }
  get_position() { return this._position; }
  get_cube()     { return this._cube; }
  get_cubepos()  { return this._cubepos; }
  get_turn()     { return this._turn; }
  get_dice(n)    {
    if (n == 1 || n == 2) { return this._dice_ary[n]; }
    else                  { return this._dice; }
  }
  get_dice_odr() { return this._dice_odr; }
  get_sc_me()    { return this._sc_me; }
  get_sc_yu()    { return this._sc_yu; }
  get_jb()       { return this._jb; }
  get_matchsc()  { return this._matchsc; }
  get_maxcube()  { return this._maxcube; }
  get_crawford() { return this._crawford; }
  get_ptno(p)    { return this._ptno[p]; }
  get_ptcol(p)   { return this._ptcol[p]; }
  get_pip(t)     { return (t == -1) ? this._pip[1] : (t == 1) ? this._pip[0] : 0; }
  get_boff(t)    { return (t == -1) ? this._boff[1] : (t == 1) ? this._boff[0] : 0; }
  get_gamesc(t)  { return (t == -1) ? this._gamesc[1] : (t == 1) ? this._gamesc[0] : [0,0]; }
  get_dbloffer() { return this._dbloffer; }

  //setter method
  set position(x) { this._position = x; this._makeXgidStr(); this._parse_position(x); this._calc_score(); }
  set cube(x)     { this._cube = x;     this._makeXgidStr(); this._calc_score(); }
  set cubepos(x)  { this._cubepos = x;  this._makeXgidStr(); }
  set turn(x)     { this._turn = x;     this._makeXgidStr(); }
  set dice(x)     { this._set_dice(x);  this._makeXgidStr(); }
  set sc_me(x)    { this._sc_me = x;    this._makeXgidStr(); }
  set sc_yu(x)    { this._sc_yu = x;    this._makeXgidStr(); }
  set jb(x)       { this._jb = x;       this._makeXgidStr(); }
  set matchsc(x)  { this._matchsc = x;  this._makeXgidStr(); }
  set maxcube(x)  { this._maxcube = x;  this._makeXgidStr(); }
  set crawford(x) { this._crawford = x; this._makeXgidStr(); }
  set dbloffer(x) { this._dbloffer = x; this._makeXgidStr(); }
  set usabledice(x) { this._usable_dice = this._setUsableDice(); }

  //getter method
  get xgidstr()  { return this._xgid; }
  get position() { return this._position; }
  get cube()     { return this._cube; }
  get cubepos()  { return this._cubepos; }
  get turn()     { return this._turn; }
  get dice()     { return this._dice; }
  get dice_odr() { return this._dice_odr; }
  get sc_me()    { return this._sc_me; }
  get sc_yu()    { return this._sc_yu; }
  get jb()       { return this._jb; }
  get matchsc()  { return this._matchsc; }
  get maxcube()  { return this._maxcube; }
  get crawford() { return this._crawford; } //boolean
  get dbloffer() { return this._dbloffer; } //boolean

  //public functions
  checkCrawford(winnerscr, delta, loserscr) {
    return ((winnerscr + delta == this._matchsc - 1) && (loserscr != this._matchsc - 1)) ? true : false;
  }

  _incdec(chr, delta, turn) {
    const stdchar = (turn == 1) ? "A" : "a";
    const charcd = stdchar.charCodeAt(0);
    const numbfr = (chr == "-") ? 0 : chr.charCodeAt(0) - charcd + 1;
    const numaft = numbfr + delta;
    return (numaft == 0) ? "-" : String.fromCharCode(numaft + charcd - 1);
  }


  moveChequer(move) {
    const pos = this.position; //debug後削除可
    const turn = this.turn;
    const posary = this.position.split("");
    const frto = move.split("/");
    const fr = parseInt(frto[0]);
    const to = parseInt(frto[1]);
    const fpt = this._turnpos(fr);
    const tpt = this._turnpos(to);
    if (fr > to) { //normal move
      posary[fpt] = this._incdec(posary[fpt], -1, turn);
      if (to != 0) {
        posary[tpt] = this._incdec(posary[tpt], +1, turn);
      }
      this._use_dice(fr, to);
    } else { //hit move (to the bar)
      const oppo = (-1) * turn;
      const bar = this._turnpos(0);
      posary[fpt] = this._incdec(posary[fpt], -1, oppo);
      posary[bar] = this._incdec(posary[bar], +1, oppo);
    }
    this.position = posary.join("");
    return this;

  }

  _use_dice(fr, to) {
    const dd = fr - to;
    const idx = this._usable_dice.findIndex(d => d == dd);
    if (idx != -1) {
      this._usable_dice.splice(idx, 1); //見つかればそれを削除
    } else if (dd == this._usable_dice[0] + this._usable_dice[1]) {
      this._usable_dice.splice(0, 2);   //目を組み合わせて使う
    } else if (dd == this._usable_dice[0] + this._usable_dice[1] + this._usable_dice[2]) {
      this._usable_dice.splice(0, 3);   //ゾロ目のときは前から使う
    } else if (dd == this._usable_dice[0] + this._usable_dice[1] + this._usable_dice[2] + this._usable_dice[3]) {
      this._usable_dice.splice(0, 4);
    } else if (to == 0) {
      this._usable_dice.splice(-1, 1);  //上記で使えなかったときは大きい目から使う
    }
  }

  isBlocked(p) {
    if (p == 0) { return false; }
    const pt = this._turnpos(p);
    return (this._ptno[pt] >= 2 && this._ptcol[pt] != this._turn);
  }

  isHitted(p) {
    const pt = this._turnpos(p);
    const ret =  (this._ptno[pt] == 1 && this._ptcol[pt] != this._turn);
    return ret;
  }

  isMovable(fr, to, strict=false) {
    const movable = this.movablePoint(fr, strict);
    return movable.includes(to);
  }

//★TODO 片方の目しか使えないときは大きい目を使わなければならない
//★TODO 動かせる目があるときは必ず使わなければならない
//例：XGID=-abHDA--a--a----abb-ba-b-A:0:0:1:61:0:0:0:5:0  OK:25/18 21/20 NG:25/24

  _isMovableWithDice(fr, to) {
    //オンザバーのときはそれしか動かせない
    const bar = this._turnpos(25);
    if (fr != 25 && this.get_ptno(bar) > 0) { return false; }

    //ベアオフのときはベアインしていることが必要
    if (to == 0) {
      for (let q=7; q<=25; q++) {
        const qt = this._turnpos(q);
        if (this.get_ptcol(qt) == this.turn && this.get_ptno(qt) > 0) { return false; }
      }
    }

    let piplist = [];
    let w = 0;
    for (const d of this._usable_dice) {
      //オンザバーに2個以上あるときは、ダイスの目を組み合わせて使えない。ex.2ゾロで21ptに出られない
      if (this.get_ptno(bar) >= 2) { w  = d; }
      else                         { w += d; }
      if (!piplist.includes(d)) { piplist.push(d); }
      if (!piplist.includes(w)) { piplist.push(w); }
    }

    const f_topt = ((f, d) => (f - d < 0) ? 0 : (f - d));
    const f_existBacker = ((f) => {
      for (let q = f+1; q<25; q++) {
        const p = this._turnpos(q);
        if (this._ptcol[p] == this._turn && this._ptno[p] > 0) { return true; }
      }
      return false;
    });

    const delta = (this.zorome) ? 2 : 1;
    let blocked = 0;
    let movable = [];
    for (const d of piplist.sort((a, b) => a - b)) {
      const p = f_topt(fr, d); //定数関数で計算
      if (fr-d < 0 && f_existBacker(fr)) { continue; }
      if (blocked < 2 && !this.isBlocked(p)) {
         movable.push(p);
      } else {
         blocked += delta;
      }
    }
    return movable.includes(to);
  }

  movablePoint(fr, strict=false) {
    //frの駒が進めるポイントをリストで返す(前＆ブロックポイント以外)
    //strict=trueのときは、ダイスの目に従って進めるポイントを計算する
    let movable = [];
    for (let p=0; p<fr; p++) {
      if (!this.isBlocked(p)) {
        if (strict && !this._isMovableWithDice(fr, p)) { continue; }
        movable.push(p);
      }
    }
    return movable;
  }

  moveFinished() {
    if (this._usable_dice.length == 0) { return true; } //使える目がなくなった時
    for (let q=1; q<25; q++) { //動かせる先がなくなった時
      if (this._ptcol[q] != this.turn) { continue; }
      const pt = this._turnpos(q);
      for (const d of this._usable_dice) {
        const ds = (pt - d < 0) ? 0 : (pt - d);
        if (this.isMovable(pt, ds, true)) { return false; }
      }
    }
    return true;
  }

  _setUsableDice() {
    let usabledice = [];
    usabledice.push(this.get_dice(1));
    usabledice.push(this.get_dice(2));
    if (this.zorome) {
      usabledice.push(this.get_dice(1));
      usabledice.push(this.get_dice(1));
    }
    return usabledice.sort(); //ベアオフで後ろから使うように昇順にしておく
  }

  initialize(pos="--------------------------", newmatch=false, matchlen=0) {
    this.position = pos;
    this.matchsc  = matchlen;
    this.sc_me    = (newmatch) ? 0: this.sc_me;
    this.sc_yu    = (newmatch) ? 0: this.sc_yu;
    this.crawford = (newmatch) ? false : this.crawford;
    this.cube     = 0;
    this.cubepos  = 0;
    this.turn     = 0;
    this.dice     = "00";
    this.jb       = 0;
    this.maxcube  = 0;
  }

} //class Xgid
