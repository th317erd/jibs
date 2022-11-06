import { RootElement } from './root-element.js';

export class NativeElement extends RootElement {
  static TYPE = RootElement.TYPE_ELEMENT;

  constructor(id, value, props) {
    super(RootElement.TYPE_ELEMENT, id, value, props);
  }
}
