export interface ColorCombination {
  bg: [number, number, number];
  text: [number, number, number];
  name: string;
}

export class ContrastTester {
  private dyslexicFriendlyColors: ColorCombination[] = [
    {
      bg: [255, 248, 229],
      text: [0, 0, 0],
      name: "Cream & Black"
    },
    {
      bg: [204, 232, 207],
      text: [0, 0, 0],
      name: "Mint & Black"
    },
    {
      bg: [203, 225, 241],
      text: [0, 0, 0],
      name: "Light Blue & Black"
    },
    {
      bg: [44, 44, 44],
      text: [255, 248, 229],
      name: "Dark Mode"
    },
    {
      bg: [250, 226, 197],
      text: [0, 0, 0],
      name: "Peach & Black"
    }
  ];

  private testTexts = [
    "Reading should be comfortable for your eyes.",
    "Focus on the clarity of these letters.",
    "Does this combination reduce visual stress?",
    "Are the words stable or do they move?",
    "Can you distinguish letters easily?"
  ];

  private currentIndex = 0;
  private results: Array<{
    combination: ColorCombination;
    rating: number;
    contrastRatio: number;
  }> = [];

  getCurrentCombination() {
    return this.dyslexicFriendlyColors[this.currentIndex];
  }

  getCurrentText() {
    return this.testTexts[this.currentIndex];
  }

  private calculateContrastRatio(bg: [number, number, number], text: [number, number, number]): number {
    const getLuminance = (rgb: [number, number, number]) => {
      const sRGB = rgb.map(val => val / 255.0);
      const rgbLinear = sRGB.map(val => 
        val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * rgbLinear[0] + 0.7152 * rgbLinear[1] + 0.0722 * rgbLinear[2];
    };

    const l1 = getLuminance(bg);
    const l2 = getLuminance(text);
    return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
  }

  recordFeedback(rating: number) {
    const current = this.getCurrentCombination();
    this.results.push({
      combination: current,
      rating,
      contrastRatio: this.calculateContrastRatio(current.bg, current.text)
    });
  }

  next(): boolean {
    this.currentIndex++;
    return this.currentIndex < this.dyslexicFriendlyColors.length;
  }

  getResults() {
    const bestResult = this.results.reduce((best, current) => {
      const score = 
        (current.rating * 0.6) + // 60% weight to user comfort
        (Math.min(current.contrastRatio / 7.0, 1.0) * 0.4); // 40% weight to WCAG contrast
      
      return score > best.score ? { result: current, score } : best;
    }, { result: this.results[0], score: 0 }).result;

    return {
      best_combination: bestResult.combination.name,
      contrast_ratio: bestResult.contrastRatio.toFixed(2),
      comfort_rating: bestResult.rating,
      recommendations: [
        "Use this color combination for reading materials",
        "Consider adjusting text size and spacing",
        "Take regular breaks to reduce visual stress"
      ]
    };
  }
}