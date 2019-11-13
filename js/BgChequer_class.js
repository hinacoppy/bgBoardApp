// BgChequer_class.js
'use strict';

class Chequer {
  constructor(player, idx) { //player = 1 or 2, idx = 0..14
    this._player = player;
    this._idx = idx;
    this._idsep = ["z", "w", "b"];
    this._turncolor = ["", "#9ce", "#456"]; // color code name
    this._color = this._turncolor[player];
    this._domid = "p" + this._idsep[player] + idx;
    this._domhtml = this._makeDomHtml();
    this._dom = null;
    this._position = {left:0, top:0};
    this._point = 0;
    this._stack = 0;
  }

  _makeDomHtml() {
    let xh;
    xh = '<span id="' + this._domid + '" class="chequer fa-layers fa-fw">';
    xh += '<i class="fas fa-circle" style="color:gray"></i>';
    xh += '<i class="fas fa-circle" style="color:'+ this._color +'" data-fa-transform="shrink-1"></i>';
    xh += '</span>';
    return xh;
  }

  //global function
  set_jQueryDom()    { this._dom = $("#" + this._domid); }

  //setter method
  set position(x) { this._position = x;     }
  set point(x)    { this._point = x;  }
  set stack(x)    { this._stack = x;  }

  //getter method
  get dom()      { return this._dom; }
  get domid()    { return this._domid; }
  get domhtml()  { return this._domhtml; }
  get color()    { return this._color; }
  get position() { return this._position; }
  get point()    { return this._point; }
  get stack()    { return this._stack; }

} //class Chequer
