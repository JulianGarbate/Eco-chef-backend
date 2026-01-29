import dotenv from 'dotenv';

dotenv.config();

let groqClient: any = null;

async function getGroqClient(): Promise<any> {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('Inicializando Groq con apiKey:', apiKey ? 'presente' : 'FALTA');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no está configurada en .env');
    }
    const { default: Groq } = await import('groq-sdk');
    groqClient = new (Groq as any)({ apiKey });
  }
  return groqClient;
}

export interface GeneratedRecipe {
  id: number;
  title: string;
  description: string;
  image: string;
  readyInMinutes: number;
  ingredients: string[];
  ingredientMeasures: Array<{ name: string; amount: number; unit: string }>;
  instructions: string[];
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Array<{ name: string }>;
  usedIngredients: Array<{ name: string }>;
  unusedIngredients: Array<{ name: string }>;
  type: string;
}

export const generateRecipesWithGroq = async (
  ingredients: string[]
): Promise<GeneratedRecipe[]> => {
  console.log('🔍 Iniciando generación de recetas con Groq...');
  const ingredientList = ingredients.join(', ');

  const prompt = `Eres un chef experto. Genera exactamente 6 recetas creativas y deliciosas usando estos ingredientes: ${ingredientList}

Para CADA receta, responde en este EXACTO formato JSON (sin markdown, solo JSON puro):
[
  {
    "id": 1,
    "title": "Nombre de la receta en español",
    "description": "Una descripción corta (1-2 líneas) de la receta",
    "image": "https://images.pexels.com/search/chicken%20recipe/",
    "readyInMinutes": 30,
    "type": "main course",
    "ingredients": ["2 pechugas de pollo", "1 cebolla grande", "3 tomates frescos"],
    "ingredientMeasures": [
      {"name": "pechuga de pollo", "amount": 2, "unit": "piezas"},
      {"name": "cebolla", "amount": 1, "unit": "grande"},
      {"name": "tomates frescos", "amount": 3, "unit": "piezas"}
    ],
    "instructions": ["Paso 1 detallado de la preparación", "Paso 2 detallado", "Paso 3 detallado"],
    "usedIngredientCount": 3,
    "missedIngredientCount": 0,
    "usedIngredients": [{"name": "ingrediente1"}, {"name": "ingrediente2"}],
    "missedIngredients": [],
    "unusedIngredients": []
  }
]

IMPORTANTE:
- Genera EXACTAMENTE 6 recetas diferentes
- Los títulos deben ser en ESPAÑOL
- Las descripciones deben ser cortas (1-2 líneas)
- El array "ingredients" debe contener los ingredientes con su cantidad: "2 pechugas de pollo", "1 cebolla grande", etc.
- El array "ingredientMeasures" DEBE contener objetos con: name (nombre del ingrediente), amount (cantidad numérica), unit (unidad: piezas, tazas, gramos, ml, kg, cucharadas, etc.)
- El array "instructions" debe contener 5-7 pasos detallados y específicos de preparación como strings
- Para "image", genera URLs de Pexels: https://images.pexels.com/search/[titulo]/
- readyInMinutes debe ser un número entre 15-90
- type puede ser: "main course", "side dish", "salad", "soup", "dessert", "breakfast"
- usedIngredientCount debe ser entre 2-5
- missedIngredientCount debe ser 0-2
- Responde SOLO con el JSON, sin explicaciones adicionales`;

  try {
    console.log('📡 Obteniendo cliente de Groq...');
    const client = await getGroqClient();
    console.log('✅ Cliente de Groq obtenido');

    console.log('🚀 Llamando a Groq API...');
    const message = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.7,
    });

    console.log('✅ Respuesta recibida de Groq');

    if (!message.choices?.[0]?.message?.content) {
      throw new Error('Respuesta inválida de Groq');
    }

    const responseText = message.choices[0].message.content;
    console.log('📝 Respuesta (primeros 200 chars):', responseText.substring(0, 200));

    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('🔄 Parseando JSON...');
    const recipes: GeneratedRecipe[] = JSON.parse(cleanedResponse);
    console.log('✅ Recetas generadas:', recipes.length);

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error('No se generaron recetas válidas');
    }

    return recipes;
  } catch (error) {
    console.error('❌ Error:', error);
    throw new Error(`Error al generar recetas: ${String(error)}`);
  }
};
