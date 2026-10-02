// Typed by an admin to confirm starting a new season, which deletes the current season's data.
export const NEW_SEASON_CONFIRMATION = 'remove data and start new season';

export interface SeasonSummaryModel {
  sessions: number,
  signups: number,
  completions: number,
}
