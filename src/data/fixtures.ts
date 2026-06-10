export interface TeamSeed {
  name: string;
  code: string;
  group_code: string;
  flag: string; // emoji
}

export interface MatchSeed {
  match_number: number;
  round: 'GROUP';
  group_code: string;
  home_code: string;
  away_code: string;
  kickoff_at: string; // ISO 8601 UTC
  venue: string;
  verified: boolean;
}

export const TEAMS: TeamSeed[] = [
  // Group A
  { name: 'Mexico', code: 'MEX', group_code: 'A', flag: '🇲🇽' },
  { name: 'South Africa', code: 'RSA', group_code: 'A', flag: '🇿🇦' },
  { name: 'South Korea', code: 'KOR', group_code: 'A', flag: '🇰🇷' },
  { name: 'Czechia', code: 'CZE', group_code: 'A', flag: '🇨🇿' },
  // Group B
  { name: 'Canada', code: 'CAN', group_code: 'B', flag: '🇨🇦' },
  { name: 'Bosnia-Herzegovina', code: 'BIH', group_code: 'B', flag: '🇧🇦' },
  { name: 'Qatar', code: 'QAT', group_code: 'B', flag: '🇶🇦' },
  { name: 'Switzerland', code: 'SUI', group_code: 'B', flag: '🇨🇭' },
  // Group C
  { name: 'Brazil', code: 'BRA', group_code: 'C', flag: '🇧🇷' },
  { name: 'Morocco', code: 'MAR', group_code: 'C', flag: '🇲🇦' },
  { name: 'Haiti', code: 'HAI', group_code: 'C', flag: '🇭🇹' },
  { name: 'Scotland', code: 'SCO', group_code: 'C', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Group D
  { name: 'United States', code: 'USA', group_code: 'D', flag: '🇺🇸' },
  { name: 'Paraguay', code: 'PAR', group_code: 'D', flag: '🇵🇾' },
  { name: 'Australia', code: 'AUS', group_code: 'D', flag: '🇦🇺' },
  { name: 'Türkiye', code: 'TUR', group_code: 'D', flag: '🇹🇷' },
  // Group E
  { name: 'Germany', code: 'GER', group_code: 'E', flag: '🇩🇪' },
  { name: 'Curaçao', code: 'CUW', group_code: 'E', flag: '🇨🇼' },
  { name: 'Ivory Coast', code: 'CIV', group_code: 'E', flag: '🇨🇮' },
  { name: 'Ecuador', code: 'ECU', group_code: 'E', flag: '🇪🇨' },
  // Group F
  { name: 'Netherlands', code: 'NED', group_code: 'F', flag: '🇳🇱' },
  { name: 'Japan', code: 'JPN', group_code: 'F', flag: '🇯🇵' },
  { name: 'Sweden', code: 'SWE', group_code: 'F', flag: '🇸🇪' },
  { name: 'Tunisia', code: 'TUN', group_code: 'F', flag: '🇹🇳' },
  // Group G
  { name: 'Belgium', code: 'BEL', group_code: 'G', flag: '🇧🇪' },
  { name: 'Egypt', code: 'EGY', group_code: 'G', flag: '🇪🇬' },
  { name: 'Iran', code: 'IRN', group_code: 'G', flag: '🇮🇷' },
  { name: 'New Zealand', code: 'NZL', group_code: 'G', flag: '🇳🇿' },
  // Group H
  { name: 'Spain', code: 'ESP', group_code: 'H', flag: '🇪🇸' },
  { name: 'Cape Verde', code: 'CPV', group_code: 'H', flag: '🇨🇻' },
  { name: 'Saudi Arabia', code: 'KSA', group_code: 'H', flag: '🇸🇦' },
  { name: 'Uruguay', code: 'URU', group_code: 'H', flag: '🇺🇾' },
  // Group I
  { name: 'France', code: 'FRA', group_code: 'I', flag: '🇫🇷' },
  { name: 'Senegal', code: 'SEN', group_code: 'I', flag: '🇸🇳' },
  { name: 'Iraq', code: 'IRQ', group_code: 'I', flag: '🇮🇶' },
  { name: 'Norway', code: 'NOR', group_code: 'I', flag: '🇳🇴' },
  // Group J
  { name: 'Argentina', code: 'ARG', group_code: 'J', flag: '🇦🇷' },
  { name: 'Algeria', code: 'ALG', group_code: 'J', flag: '🇩🇿' },
  { name: 'Austria', code: 'AUT', group_code: 'J', flag: '🇦🇹' },
  { name: 'Jordan', code: 'JOR', group_code: 'J', flag: '🇯🇴' },
  // Group K
  { name: 'Portugal', code: 'POR', group_code: 'K', flag: '🇵🇹' },
  { name: 'DR Congo', code: 'COD', group_code: 'K', flag: '🇨🇩' },
  { name: 'Uzbekistan', code: 'UZB', group_code: 'K', flag: '🇺🇿' },
  { name: 'Colombia', code: 'COL', group_code: 'K', flag: '🇨🇴' },
  // Group L
  { name: 'England', code: 'ENG', group_code: 'L', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Croatia', code: 'CRO', group_code: 'L', flag: '🇭🇷' },
  { name: 'Ghana', code: 'GHA', group_code: 'L', flag: '🇬🇭' },
  { name: 'Panama', code: 'PAN', group_code: 'L', flag: '🇵🇦' },
];

// verified=false means kickoff time/venue is estimated and may need correction
export const GROUP_FIXTURES: MatchSeed[] = [
  // GROUP A
  { match_number: 1, round: 'GROUP', group_code: 'A', home_code: 'MEX', away_code: 'RSA', kickoff_at: '2026-06-11T19:00:00Z', venue: 'Estadio Azteca, Mexico City', verified: true },
  { match_number: 2, round: 'GROUP', group_code: 'A', home_code: 'KOR', away_code: 'CZE', kickoff_at: '2026-06-12T02:00:00Z', venue: 'Estadio Akron, Guadalajara', verified: true },
  { match_number: 3, round: 'GROUP', group_code: 'A', home_code: 'CZE', away_code: 'RSA', kickoff_at: '2026-06-18T16:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', verified: true },
  { match_number: 4, round: 'GROUP', group_code: 'A', home_code: 'MEX', away_code: 'KOR', kickoff_at: '2026-06-19T01:00:00Z', venue: 'Estadio Akron, Guadalajara', verified: true },
  { match_number: 5, round: 'GROUP', group_code: 'A', home_code: 'CZE', away_code: 'MEX', kickoff_at: '2026-06-25T01:00:00Z', venue: 'Estadio Azteca, Mexico City', verified: true },
  { match_number: 6, round: 'GROUP', group_code: 'A', home_code: 'RSA', away_code: 'KOR', kickoff_at: '2026-06-25T01:00:00Z', venue: 'Estadio BBVA, Monterrey', verified: true },

  // GROUP B
  { match_number: 7, round: 'GROUP', group_code: 'B', home_code: 'CAN', away_code: 'BIH', kickoff_at: '2026-06-12T19:00:00Z', venue: 'BMO Field, Toronto', verified: true },
  { match_number: 8, round: 'GROUP', group_code: 'B', home_code: 'QAT', away_code: 'SUI', kickoff_at: '2026-06-13T19:00:00Z', venue: "Levi's Stadium, Santa Clara", verified: true },
  { match_number: 9, round: 'GROUP', group_code: 'B', home_code: 'SUI', away_code: 'BIH', kickoff_at: '2026-06-18T19:00:00Z', venue: 'SoFi Stadium, Los Angeles', verified: true },
  { match_number: 10, round: 'GROUP', group_code: 'B', home_code: 'CAN', away_code: 'QAT', kickoff_at: '2026-06-18T22:00:00Z', venue: 'BC Place, Vancouver', verified: true },
  { match_number: 11, round: 'GROUP', group_code: 'B', home_code: 'SUI', away_code: 'CAN', kickoff_at: '2026-06-24T19:00:00Z', venue: 'BC Place, Vancouver', verified: true },
  { match_number: 12, round: 'GROUP', group_code: 'B', home_code: 'BIH', away_code: 'QAT', kickoff_at: '2026-06-24T19:00:00Z', venue: 'Lumen Field, Seattle', verified: true },

  // GROUP C
  { match_number: 13, round: 'GROUP', group_code: 'C', home_code: 'BRA', away_code: 'MAR', kickoff_at: '2026-06-13T22:00:00Z', venue: 'MetLife Stadium, East Rutherford', verified: true },
  { match_number: 14, round: 'GROUP', group_code: 'C', home_code: 'HAI', away_code: 'SCO', kickoff_at: '2026-06-14T01:00:00Z', venue: 'Gillette Stadium, Foxborough', verified: true },
  { match_number: 15, round: 'GROUP', group_code: 'C', home_code: 'SCO', away_code: 'MAR', kickoff_at: '2026-06-19T22:00:00Z', venue: 'Gillette Stadium, Foxborough', verified: false },
  { match_number: 16, round: 'GROUP', group_code: 'C', home_code: 'BRA', away_code: 'HAI', kickoff_at: '2026-06-20T01:00:00Z', venue: 'Lincoln Financial Field, Philadelphia', verified: false },
  { match_number: 17, round: 'GROUP', group_code: 'C', home_code: 'SCO', away_code: 'BRA', kickoff_at: '2026-06-25T22:00:00Z', venue: 'Hard Rock Stadium, Miami Gardens', verified: true },
  { match_number: 18, round: 'GROUP', group_code: 'C', home_code: 'MAR', away_code: 'HAI', kickoff_at: '2026-06-25T22:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', verified: true },

  // GROUP D
  { match_number: 19, round: 'GROUP', group_code: 'D', home_code: 'USA', away_code: 'PAR', kickoff_at: '2026-06-13T01:00:00Z', venue: 'SoFi Stadium, Los Angeles', verified: true },
  { match_number: 20, round: 'GROUP', group_code: 'D', home_code: 'AUS', away_code: 'TUR', kickoff_at: '2026-06-13T04:00:00Z', venue: 'BC Place, Vancouver', verified: true },
  { match_number: 21, round: 'GROUP', group_code: 'D', home_code: 'USA', away_code: 'AUS', kickoff_at: '2026-06-19T19:00:00Z', venue: 'Lumen Field, Seattle', verified: false },
  { match_number: 22, round: 'GROUP', group_code: 'D', home_code: 'TUR', away_code: 'PAR', kickoff_at: '2026-06-20T04:00:00Z', venue: "Levi's Stadium, Santa Clara", verified: false },
  { match_number: 23, round: 'GROUP', group_code: 'D', home_code: 'USA', away_code: 'TUR', kickoff_at: '2026-06-26T01:00:00Z', venue: 'AT&T Stadium, Arlington', verified: false },
  { match_number: 24, round: 'GROUP', group_code: 'D', home_code: 'PAR', away_code: 'AUS', kickoff_at: '2026-06-26T01:00:00Z', venue: 'Arrowhead Stadium, Kansas City', verified: false },

  // GROUP E
  { match_number: 25, round: 'GROUP', group_code: 'E', home_code: 'GER', away_code: 'CUW', kickoff_at: '2026-06-14T17:00:00Z', venue: 'NRG Stadium, Houston', verified: true },
  { match_number: 26, round: 'GROUP', group_code: 'E', home_code: 'CIV', away_code: 'ECU', kickoff_at: '2026-06-14T23:00:00Z', venue: 'Lincoln Financial Field, Philadelphia', verified: true },
  { match_number: 27, round: 'GROUP', group_code: 'E', home_code: 'GER', away_code: 'CIV', kickoff_at: '2026-06-20T20:00:00Z', venue: 'BMO Field, Toronto', verified: false },
  { match_number: 28, round: 'GROUP', group_code: 'E', home_code: 'ECU', away_code: 'CUW', kickoff_at: '2026-06-21T00:00:00Z', venue: 'Arrowhead Stadium, Kansas City', verified: false },
  { match_number: 29, round: 'GROUP', group_code: 'E', home_code: 'CUW', away_code: 'CIV', kickoff_at: '2026-06-26T20:00:00Z', venue: 'Lincoln Financial Field, Philadelphia', verified: false },
  { match_number: 30, round: 'GROUP', group_code: 'E', home_code: 'ECU', away_code: 'GER', kickoff_at: '2026-06-26T20:00:00Z', venue: 'NRG Stadium, Houston', verified: false },

  // GROUP F
  { match_number: 31, round: 'GROUP', group_code: 'F', home_code: 'NED', away_code: 'JPN', kickoff_at: '2026-06-14T20:00:00Z', venue: 'AT&T Stadium, Arlington', verified: true },
  { match_number: 32, round: 'GROUP', group_code: 'F', home_code: 'SWE', away_code: 'TUN', kickoff_at: '2026-06-15T02:00:00Z', venue: 'Estadio Akron, Guadalajara', verified: false },
  { match_number: 33, round: 'GROUP', group_code: 'F', home_code: 'NED', away_code: 'SWE', kickoff_at: '2026-06-20T17:00:00Z', venue: 'NRG Stadium, Houston', verified: true },
  { match_number: 34, round: 'GROUP', group_code: 'F', home_code: 'TUN', away_code: 'JPN', kickoff_at: '2026-06-21T04:00:00Z', venue: 'Estadio BBVA, Monterrey', verified: true },
  { match_number: 35, round: 'GROUP', group_code: 'F', home_code: 'NED', away_code: 'TUN', kickoff_at: '2026-06-27T20:00:00Z', venue: 'AT&T Stadium, Arlington', verified: false },
  { match_number: 36, round: 'GROUP', group_code: 'F', home_code: 'JPN', away_code: 'SWE', kickoff_at: '2026-06-27T20:00:00Z', venue: 'Lumen Field, Seattle', verified: false },

  // GROUP G
  { match_number: 37, round: 'GROUP', group_code: 'G', home_code: 'BEL', away_code: 'EGY', kickoff_at: '2026-06-15T19:00:00Z', venue: 'Lumen Field, Seattle', verified: true },
  { match_number: 38, round: 'GROUP', group_code: 'G', home_code: 'IRN', away_code: 'NZL', kickoff_at: '2026-06-16T04:00:00Z', venue: 'SoFi Stadium, Los Angeles', verified: true },
  { match_number: 39, round: 'GROUP', group_code: 'G', home_code: 'BEL', away_code: 'IRN', kickoff_at: '2026-06-21T19:00:00Z', venue: 'SoFi Stadium, Los Angeles', verified: false },
  { match_number: 40, round: 'GROUP', group_code: 'G', home_code: 'NZL', away_code: 'EGY', kickoff_at: '2026-06-22T01:00:00Z', venue: 'BC Place, Vancouver', verified: false },
  { match_number: 41, round: 'GROUP', group_code: 'G', home_code: 'BEL', away_code: 'NZL', kickoff_at: '2026-06-26T19:00:00Z', venue: 'Lumen Field, Seattle', verified: false },
  { match_number: 42, round: 'GROUP', group_code: 'G', home_code: 'EGY', away_code: 'IRN', kickoff_at: '2026-06-26T19:00:00Z', venue: 'AT&T Stadium, Arlington', verified: false },

  // GROUP H
  { match_number: 43, round: 'GROUP', group_code: 'H', home_code: 'ESP', away_code: 'CPV', kickoff_at: '2026-06-15T17:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', verified: true },
  { match_number: 44, round: 'GROUP', group_code: 'H', home_code: 'KSA', away_code: 'URU', kickoff_at: '2026-06-15T22:00:00Z', venue: 'Hard Rock Stadium, Miami', verified: true },
  { match_number: 45, round: 'GROUP', group_code: 'H', home_code: 'ESP', away_code: 'KSA', kickoff_at: '2026-06-21T16:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', verified: true },
  { match_number: 46, round: 'GROUP', group_code: 'H', home_code: 'CPV', away_code: 'URU', kickoff_at: '2026-06-21T22:00:00Z', venue: 'Hard Rock Stadium, Miami', verified: false },
  { match_number: 47, round: 'GROUP', group_code: 'H', home_code: 'ESP', away_code: 'URU', kickoff_at: '2026-06-26T22:00:00Z', venue: 'AT&T Stadium, Arlington', verified: false },
  { match_number: 48, round: 'GROUP', group_code: 'H', home_code: 'CPV', away_code: 'KSA', kickoff_at: '2026-06-26T22:00:00Z', venue: 'NRG Stadium, Houston', verified: false },

  // GROUP I
  { match_number: 49, round: 'GROUP', group_code: 'I', home_code: 'FRA', away_code: 'SEN', kickoff_at: '2026-06-16T19:00:00Z', venue: 'MetLife Stadium, East Rutherford', verified: true },
  { match_number: 50, round: 'GROUP', group_code: 'I', home_code: 'IRQ', away_code: 'NOR', kickoff_at: '2026-06-16T22:00:00Z', venue: 'Gillette Stadium, Foxborough', verified: true },
  { match_number: 51, round: 'GROUP', group_code: 'I', home_code: 'FRA', away_code: 'IRQ', kickoff_at: '2026-06-22T21:00:00Z', venue: 'Lincoln Financial Field, Philadelphia', verified: true },
  { match_number: 52, round: 'GROUP', group_code: 'I', home_code: 'NOR', away_code: 'SEN', kickoff_at: '2026-06-23T00:00:00Z', venue: 'MetLife Stadium, East Rutherford', verified: true },
  { match_number: 53, round: 'GROUP', group_code: 'I', home_code: 'FRA', away_code: 'NOR', kickoff_at: '2026-06-26T22:00:00Z', venue: 'Hard Rock Stadium, Miami', verified: false },
  { match_number: 54, round: 'GROUP', group_code: 'I', home_code: 'SEN', away_code: 'IRQ', kickoff_at: '2026-06-26T22:00:00Z', venue: 'Gillette Stadium, Foxborough', verified: false },

  // GROUP J
  { match_number: 55, round: 'GROUP', group_code: 'J', home_code: 'ARG', away_code: 'ALG', kickoff_at: '2026-06-17T01:00:00Z', venue: 'Arrowhead Stadium, Kansas City', verified: true },
  { match_number: 56, round: 'GROUP', group_code: 'J', home_code: 'AUT', away_code: 'JOR', kickoff_at: '2026-06-17T04:00:00Z', venue: "Levi's Stadium, Santa Clara", verified: true },
  { match_number: 57, round: 'GROUP', group_code: 'J', home_code: 'ARG', away_code: 'AUT', kickoff_at: '2026-06-22T17:00:00Z', venue: 'AT&T Stadium, Arlington', verified: true },
  { match_number: 58, round: 'GROUP', group_code: 'J', home_code: 'JOR', away_code: 'ALG', kickoff_at: '2026-06-23T03:00:00Z', venue: "Levi's Stadium, Santa Clara", verified: true },
  { match_number: 59, round: 'GROUP', group_code: 'J', home_code: 'ARG', away_code: 'JOR', kickoff_at: '2026-06-27T17:00:00Z', venue: 'Arrowhead Stadium, Kansas City', verified: false },
  { match_number: 60, round: 'GROUP', group_code: 'J', home_code: 'ALG', away_code: 'AUT', kickoff_at: '2026-06-27T17:00:00Z', venue: "Levi's Stadium, Santa Clara", verified: false },

  // GROUP K
  { match_number: 61, round: 'GROUP', group_code: 'K', home_code: 'POR', away_code: 'COD', kickoff_at: '2026-06-17T17:00:00Z', venue: 'NRG Stadium, Houston', verified: true },
  { match_number: 62, round: 'GROUP', group_code: 'K', home_code: 'UZB', away_code: 'COL', kickoff_at: '2026-06-18T02:00:00Z', venue: 'Estadio Azteca, Mexico City', verified: true },
  { match_number: 63, round: 'GROUP', group_code: 'K', home_code: 'POR', away_code: 'UZB', kickoff_at: '2026-06-22T17:00:00Z', venue: 'NRG Stadium, Houston', verified: true },
  { match_number: 64, round: 'GROUP', group_code: 'K', home_code: 'COL', away_code: 'COD', kickoff_at: '2026-06-23T02:00:00Z', venue: 'Estadio Akron, Guadalajara', verified: true },
  { match_number: 65, round: 'GROUP', group_code: 'K', home_code: 'POR', away_code: 'COL', kickoff_at: '2026-06-27T21:00:00Z', venue: 'AT&T Stadium, Arlington', verified: false },
  { match_number: 66, round: 'GROUP', group_code: 'K', home_code: 'COD', away_code: 'UZB', kickoff_at: '2026-06-27T21:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', verified: false },

  // GROUP L
  { match_number: 67, round: 'GROUP', group_code: 'L', home_code: 'ENG', away_code: 'CRO', kickoff_at: '2026-06-17T20:00:00Z', venue: 'AT&T Stadium, Arlington', verified: true },
  { match_number: 68, round: 'GROUP', group_code: 'L', home_code: 'GHA', away_code: 'PAN', kickoff_at: '2026-06-17T23:00:00Z', venue: 'BMO Field, Toronto', verified: true },
  { match_number: 69, round: 'GROUP', group_code: 'L', home_code: 'ENG', away_code: 'GHA', kickoff_at: '2026-06-23T20:00:00Z', venue: 'Gillette Stadium, Foxborough', verified: true },
  { match_number: 70, round: 'GROUP', group_code: 'L', home_code: 'PAN', away_code: 'CRO', kickoff_at: '2026-06-23T23:00:00Z', venue: 'BMO Field, Toronto', verified: true },
  { match_number: 71, round: 'GROUP', group_code: 'L', home_code: 'ENG', away_code: 'PAN', kickoff_at: '2026-06-27T23:00:00Z', venue: 'MetLife Stadium, East Rutherford', verified: false },
  { match_number: 72, round: 'GROUP', group_code: 'L', home_code: 'CRO', away_code: 'GHA', kickoff_at: '2026-06-27T23:00:00Z', venue: 'Lumen Field, Seattle', verified: false },
];

// Knockout placeholders (teams are set by admin as bracket fills)
// R32 bracket pairs based on the draw (approx dates Jul 1-4)
export const KNOCKOUT_PLACEHOLDERS = [
  // Round of 32 (16 matches)
  { match_number: 73, round: 'R32' as const, home_placeholder: '1A', away_placeholder: '2B', kickoff_at: '2026-07-01T17:00:00Z', venue: 'TBD' },
  { match_number: 74, round: 'R32' as const, home_placeholder: '1B', away_placeholder: '2A', kickoff_at: '2026-07-01T21:00:00Z', venue: 'TBD' },
  { match_number: 75, round: 'R32' as const, home_placeholder: '1C', away_placeholder: '2D', kickoff_at: '2026-07-02T17:00:00Z', venue: 'TBD' },
  { match_number: 76, round: 'R32' as const, home_placeholder: '1D', away_placeholder: '2C', kickoff_at: '2026-07-02T21:00:00Z', venue: 'TBD' },
  { match_number: 77, round: 'R32' as const, home_placeholder: '1E', away_placeholder: '2F', kickoff_at: '2026-07-03T17:00:00Z', venue: 'TBD' },
  { match_number: 78, round: 'R32' as const, home_placeholder: '1F', away_placeholder: '2E', kickoff_at: '2026-07-03T21:00:00Z', venue: 'TBD' },
  { match_number: 79, round: 'R32' as const, home_placeholder: '1G', away_placeholder: '2H', kickoff_at: '2026-07-04T17:00:00Z', venue: 'TBD' },
  { match_number: 80, round: 'R32' as const, home_placeholder: '1H', away_placeholder: '2G', kickoff_at: '2026-07-04T21:00:00Z', venue: 'TBD' },
  { match_number: 81, round: 'R32' as const, home_placeholder: '1I', away_placeholder: '2J', kickoff_at: '2026-07-05T17:00:00Z', venue: 'TBD' },
  { match_number: 82, round: 'R32' as const, home_placeholder: '1J', away_placeholder: '2I', kickoff_at: '2026-07-05T21:00:00Z', venue: 'TBD' },
  { match_number: 83, round: 'R32' as const, home_placeholder: '1K', away_placeholder: '2L', kickoff_at: '2026-07-06T17:00:00Z', venue: 'TBD' },
  { match_number: 84, round: 'R32' as const, home_placeholder: '1L', away_placeholder: '2K', kickoff_at: '2026-07-06T21:00:00Z', venue: 'TBD' },
  { match_number: 85, round: 'R32' as const, home_placeholder: 'Best 3rd (A/B/C)', away_placeholder: 'Best 3rd (D/E/F)', kickoff_at: '2026-07-07T17:00:00Z', venue: 'TBD' },
  { match_number: 86, round: 'R32' as const, home_placeholder: 'Best 3rd (G/H/I)', away_placeholder: 'Best 3rd (J/K/L)', kickoff_at: '2026-07-07T21:00:00Z', venue: 'TBD' },
  { match_number: 87, round: 'R32' as const, home_placeholder: 'Best 3rd (A/B/D)', away_placeholder: 'Best 3rd (C/E/G)', kickoff_at: '2026-07-08T17:00:00Z', venue: 'TBD' },
  { match_number: 88, round: 'R32' as const, home_placeholder: 'Best 3rd (H/I/K)', away_placeholder: 'Best 3rd (F/J/L)', kickoff_at: '2026-07-08T21:00:00Z', venue: 'TBD' },
  // Round of 16 (8 matches) - Jul 10-13
  { match_number: 89, round: 'R16' as const, home_placeholder: 'W73', away_placeholder: 'W74', kickoff_at: '2026-07-10T17:00:00Z', venue: 'TBD' },
  { match_number: 90, round: 'R16' as const, home_placeholder: 'W75', away_placeholder: 'W76', kickoff_at: '2026-07-10T21:00:00Z', venue: 'TBD' },
  { match_number: 91, round: 'R16' as const, home_placeholder: 'W77', away_placeholder: 'W78', kickoff_at: '2026-07-11T17:00:00Z', venue: 'TBD' },
  { match_number: 92, round: 'R16' as const, home_placeholder: 'W79', away_placeholder: 'W80', kickoff_at: '2026-07-11T21:00:00Z', venue: 'TBD' },
  { match_number: 93, round: 'R16' as const, home_placeholder: 'W81', away_placeholder: 'W82', kickoff_at: '2026-07-12T17:00:00Z', venue: 'TBD' },
  { match_number: 94, round: 'R16' as const, home_placeholder: 'W83', away_placeholder: 'W84', kickoff_at: '2026-07-12T21:00:00Z', venue: 'TBD' },
  { match_number: 95, round: 'R16' as const, home_placeholder: 'W85', away_placeholder: 'W86', kickoff_at: '2026-07-13T17:00:00Z', venue: 'TBD' },
  { match_number: 96, round: 'R16' as const, home_placeholder: 'W87', away_placeholder: 'W88', kickoff_at: '2026-07-13T21:00:00Z', venue: 'TBD' },
  // Quarter-finals (4 matches) - Jul 15-16
  { match_number: 97, round: 'QF' as const, home_placeholder: 'W89', away_placeholder: 'W90', kickoff_at: '2026-07-15T17:00:00Z', venue: 'TBD' },
  { match_number: 98, round: 'QF' as const, home_placeholder: 'W91', away_placeholder: 'W92', kickoff_at: '2026-07-15T21:00:00Z', venue: 'TBD' },
  { match_number: 99, round: 'QF' as const, home_placeholder: 'W93', away_placeholder: 'W94', kickoff_at: '2026-07-16T17:00:00Z', venue: 'TBD' },
  { match_number: 100, round: 'QF' as const, home_placeholder: 'W95', away_placeholder: 'W96', kickoff_at: '2026-07-16T21:00:00Z', venue: 'TBD' },
  // Semi-finals (2 matches) - Jul 19-20
  { match_number: 101, round: 'SF' as const, home_placeholder: 'W97', away_placeholder: 'W98', kickoff_at: '2026-07-19T21:00:00Z', venue: 'TBD' },
  { match_number: 102, round: 'SF' as const, home_placeholder: 'W99', away_placeholder: 'W100', kickoff_at: '2026-07-20T21:00:00Z', venue: 'TBD' },
  // 3rd Place - Jul 22
  { match_number: 103, round: 'THIRD_PLACE' as const, home_placeholder: 'L101', away_placeholder: 'L102', kickoff_at: '2026-07-22T17:00:00Z', venue: 'TBD' },
  // Final - Jul 23 at MetLife Stadium
  { match_number: 104, round: 'FINAL' as const, home_placeholder: 'W101', away_placeholder: 'W102', kickoff_at: '2026-07-23T21:00:00Z', venue: 'MetLife Stadium, East Rutherford' },
];
