import { RootElement } from './root-element.js';

export class CommentElement extends RootElement {
  static TYPE = RootElement.TYPE_COMMENT;

  constructor(id, value, props) {
    super(RootElement.TYPE_COMMENT, id, value, props);
  }
}
