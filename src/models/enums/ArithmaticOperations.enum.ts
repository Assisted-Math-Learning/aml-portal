export enum ArithmaticOperations {
  ADDITION = 'Addition',
  SUBTRACTION = 'Subtraction',
  MULTIPLICATION = 'Multiplication',
  DIVISION = 'Division',
}

export const operationMap: Record<string, string> = {
  [ArithmaticOperations.ADDITION]: '+',
  [ArithmaticOperations.SUBTRACTION]: '-',
  [ArithmaticOperations.MULTIPLICATION]: '×',
  [ArithmaticOperations.DIVISION]: '÷',
};
