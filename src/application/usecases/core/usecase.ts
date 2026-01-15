export abstract class UseCase<INPUT, OUTPUT> {
  abstract execute(input: INPUT): Promise<OUTPUT>;
}
