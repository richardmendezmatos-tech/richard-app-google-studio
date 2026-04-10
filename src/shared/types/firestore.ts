export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toMillis?: () => number;
}
