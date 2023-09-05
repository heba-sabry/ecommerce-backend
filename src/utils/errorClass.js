export class ErrorClass extends Error {
  constructor(massage, status) {
    super(massage);
    this.status = status;
  }
}
