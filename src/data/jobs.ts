/**
 * Open positions.
 *
 * ⚠️ EMPTY ON PURPOSE. The careers page renders a "no current openings" state
 * while this list is empty, rather than advertising roles that do not exist.
 *
 * Posting a job you are not hiring for wastes applicants' time and, once
 * indexed by Google Jobs and Indeed, keeps attracting applications for months
 * after you take it down. Add a role when you are actually recruiting, and
 * remove it when the seat is filled.
 */

export interface JobOpening {
  slug: string;
  title: string;
  /** e.g. "Full-time", "Part-time", "Seasonal". */
  type: string;
  /** Free text — "Phoenix, AZ" or "Metro Phoenix (field-based)". */
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  /** Leave empty to omit the pay line entirely rather than saying "competitive". */
  payRange: string;
}

export const jobOpenings: JobOpening[] = [];

/**
 * Reasons to work here, shown whether or not there are open roles.
 *
 * ⚠️ Only keep lines the business genuinely offers. An applicant who finds out
 * at the interview that the "company vehicle" is not real does not take the
 * job, and does tell other technicians.
 */
export const jobPerks: string[] = [];
