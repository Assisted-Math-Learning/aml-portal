export interface Learner {
  identifier: string;
  username: string;
  taxonomy: {
    board: {
      identifier: string;
    };
    class: {
      identifier: string;
    };
  };
}
