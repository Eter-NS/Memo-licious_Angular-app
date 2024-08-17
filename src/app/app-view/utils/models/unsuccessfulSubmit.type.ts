export type SubmitValidState =
  | { state: false }
  | { state: true; cause: string };
