export class Elements {
  static getElement(element) {
    return document.querySelector(element);
  }

  static getAllElements(element) {
    return [...new Set(document.querySelectorAll(element))];
  }
}
