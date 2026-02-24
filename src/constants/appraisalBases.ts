export interface AppraisalBase {
    category: 'sedan' | 'suv' | 'pickup' | 'luxury' | 'other';
    baseValues: Record<number, number>; // Year -> Base Price
}

export const APPRAISAL_BASES: AppraisalBase[] = [
    {
        category: 'sedan',
        baseValues: {
            2024: 22000,
            2023: 19500,
            2022: 17000,
            2021: 15500,
            2020: 14000,
            2019: 12500,
            2018: 11000,
            2017: 9500,
            2016: 8000,
            2015: 7000,
            2010: 4500
        }
    },
    {
        category: 'suv',
        baseValues: {
            2024: 28000,
            2023: 25500,
            2022: 23000,
            2021: 21000,
            2020: 19000,
            2019: 17000,
            2018: 15000,
            2017: 13500,
            2016: 12000,
            2015: 10500,
            2010: 6500
        }
    },
    {
        category: 'pickup',
        baseValues: {
            2024: 35000,
            2023: 31000,
            2022: 28000,
            2021: 25500,
            2020: 23000,
            2019: 21000,
            2018: 19000,
            2017: 17000,
            2016: 15500,
            2015: 14000,
            2010: 9500
        }
    },
    {
        category: 'luxury',
        baseValues: {
            2024: 45000,
            2023: 40000,
            2022: 36000,
            2021: 32000,
            2020: 28000,
            2019: 25000,
            2018: 22000,
            2017: 19500,
            2016: 17500,
            2015: 15500,
            2010: 11000
        }
    }
];

export const getAppraisalBaseValue = (year: number, make: string): number => {
    const brand = make.toLowerCase();
    let category: AppraisalBase['category'] = 'sedan';

    // Luxury heuristics
    if (['bmw', 'mercedes', 'lexus', 'audi', 'porsche', 'land rover', 'tesla'].includes(brand)) {
        category = 'luxury';
    } else if (['jeep', 'ford', 'chevrolet', 'toyota'].includes(brand)) {
        // Simple heuristic for SUV preference in these brands
        category = 'suv';
    }

    const base = APPRAISAL_BASES.find(b => b.category === category) || APPRAISAL_BASES[0];

    // Find closest year
    const availableYears = Object.keys(base.baseValues).map(Number).sort((a, b) => b - a);
    const closestYear = availableYears.find(y => y <= year) || availableYears[availableYears.length - 1];

    return base.baseValues[closestYear] || 15000;
};
