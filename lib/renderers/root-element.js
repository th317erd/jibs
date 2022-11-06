
const TYPE_ELEMENT  = 1;
const TYPE_TEXT     = 3;
const TYPE_COMMENT  = 8;
const TYPE_PORTAL   = 15;

export class RootElement {
  static TYPE_ELEMENT  = TYPE_ELEMENT;

  static TYPE_TEXT     = TYPE_TEXT;

  static TYPE_COMMENT  = TYPE_COMMENT;

  static TYPE_PORTAL   = TYPE_PORTAL;

  constructor(type, id, value, props) {
    this.isJibsVirtualElement = true;
    this.type   = type;
    this.id     = id;
    this.value  = value;
    this.props  = props || {};
  }
}
