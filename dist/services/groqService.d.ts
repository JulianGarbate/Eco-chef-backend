export interface GeneratedRecipe {
    id: number;
    title: string;
    description: string;
    image: string;
    readyInMinutes: number;
    ingredients: string[];
    ingredientMeasures: Array<{
        name: string;
        amount: number;
        unit: string;
    }>;
    instructions: string[];
    usedIngredientCount: number;
    missedIngredientCount: number;
    missedIngredients: Array<{
        name: string;
    }>;
    usedIngredients: Array<{
        name: string;
    }>;
    unusedIngredients: Array<{
        name: string;
    }>;
    type: string;
}
export declare const generateRecipesWithGroq: (ingredients: string[]) => Promise<GeneratedRecipe[]>;
//# sourceMappingURL=groqService.d.ts.map