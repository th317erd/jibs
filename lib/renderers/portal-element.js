import { RootElement } from './root-element.js';

export class PortalElement extends RootElement {
  static TYPE = RootElement.TYPE_PORTAL;

  constructor(id, value, props) {
    super(RootElement.TYPE_PORTAL, id, value, props);
  }
}
