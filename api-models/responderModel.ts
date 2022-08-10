export default interface ResponderModel {
  id: number;
  name: string;
  email: string;
  eventId: number;
  unitId: number;
  /**
   * The date/time the user expects to be at command post.
   * Can be used to express interest in a future event.
   * null = ASAP
   */
  eta?: string;
  /**
   * The date/time the user began their response (got in their vehicle).
   */
  responding?: string;
  /**
   * The date/time the user did (or will) arrive home. The responder has cleared
   * the command post and does not need tracking/accountability anymore.
   */
  timeOut?: string;
  /**
   * The number of miles the user ended up driving on this event.
   */
  miles?: number;
}