export interface LotteryDraw {
  date: string;
  numbers: number[];
  stars: number[];
  bonus?: number;
  winners?: number;
  jackpotAmount?: string;
  hasJackpotWinner?: boolean;
}

export interface PredictionCard {
  numbers: number[];
  stars: number[];
  valueScore: number;
  oddsExponent: string;
  payoutPower: string;
  label: string;
  objective: string;
  explanation: string;
}

export interface WeeklyDrawPrediction {
  drawName: string; // e.g. "Tuesday Draw (Midweek)" or "Wednesday Draw (Midweek)"
  day: string; // e.g. "Tuesday" or "Wednesday"
  type: string;
  predictions: PredictionCard[]; // Exactly 2 predictions per draw
}

export interface DatasetResponse {
  gameName: string;
  totalDraws: number;
  lastDrawDate: string;
  latestNumbers: number[];
  latestBonus?: number;
  latestStars: number[];
  history: LotteryDraw[];
  frequencies: number[];
  starFrequencies: number[];
  gaps: number[];
  statistics: {
    hotNumbers: number[];
    coldNumbers: number[];
    oddEvenSplit: { odd: number; even: number };
    sumGaussian: { avg: number; min: number; max: number; stdDev: number };
    birthdayAvoidanceRate: number;
  };
  weeklyPredictions: WeeklyDrawPrediction[]; // Midweek and Weekend draw predictions containing 2 predictions each
}

export interface CustomPredictionResult {
  numbers: number[];
  stars: number[];
  gameTheoryIndex: number;
  entropyLevel: number;
  volatility: string;
  scenarios: {
    splitPotRisk: string;
    expectedJackpotMultiplier: string;
  };
}
