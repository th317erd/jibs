import { RootElement } from './root-element.js';

export class TextElement extends RootElement {
  static TYPE = RootElement.TYPE_TEXT;

  constructor(id, value, props) {
    super(RootElement.TYPE_TEXT, id, value, props);
  }
}
