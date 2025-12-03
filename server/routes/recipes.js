const express = require('express');
const router = express.Router();
const axios = require('axios');
const translate = require('translate-google');
const Favorite = require('../models/Favorite');

// Helper: translate with graceful fallback
const translateSafe = async (text, to = 'th') => {
  try {
    return await translate(text, { to });
  } catch (err) {
    console.error('Translate failed, returning original text', err.message);
    return text;
  }
};

// Helper: serve cached recipe (e.g., when API quota exceeded)
const serveCachedRecipe = async (recipeId, lang) => {
  const cached = await Favorite.findOne({ recipeId: Number(recipeId) });
  if (!cached?.cachedRecipe) return null;

  const recipe = { ...cached.cachedRecipe, id: cached.recipeId };

  if (lang === 'th') {
    recipe.summary = await translateSafe(recipe.summary);
    recipe.extendedIngredients = await Promise.all(
      (recipe.extendedIngredients || []).map(async (ing) => ({
        ...ing,
        original: await translateSafe(ing.original),
      }))
    );
    recipe.analyzedInstructions = await Promise.all(
      (recipe.analyzedInstructions || []).map(async (instruction) => ({
        ...instruction,
        steps: await Promise.all(
          (instruction.steps || []).map(async (step) => ({
            ...step,
            step: await translateSafe(step.step),
          }))
        ),
      }))
    );
  }

  return recipe;
};

// GET /api/recipes/search?ingredients=apple,flour
router.get('/search', async (req, res) => {
  try {
    let { ingredients } = req.query;

    if (!ingredients) {
      return res.status(400).json({ msg: 'Please provide ingredients' });
    }

    // 2. เช็คว่าเป็นภาษาไทยหรือไม่? (Regular Expression เช็ค ก-ฮ)
    const isThai = /[ก-๙]/.test(ingredients);

    if (isThai) {
      try {
        // 3. ถ้าเป็นไทย ให้แปลเป็นอังกฤษ (en)
        // translate-google จะคืนค่ากลับมาเป็น String ภาษาอังกฤษ
        ingredients = await translate(ingredients, { to: 'en' });
        console.log(`Translated: ${req.query.ingredients} -> ${ingredients}`); 
      } catch (err) {
        console.error("Translation Error:", err);
        // ถ้าแปลไม่ได้ ก็ใช้คำเดิมไปเสี่ยงดวงเอา
      }
    }

    // 4. ส่ง ingredients (ที่เป็นอังกฤษแล้ว) ไปหา Spoonacular
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/findByIngredients`, 
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          ingredients: ingredients, // ตัวนี้จะเป็นภาษาอังกฤษแล้ว
          number: 10,
          ranking: 1,
          ignorePantry: true 
        }
      }
    );

    res.json(response.data);
  } catch (err) {

    if (err.response && err.response.status === 402) {
      console.error("Spoonacular Quota Exceeded");
      return res.status(402).json({ msg: "API Quota เต็มแล้ว โปรดรอวันถัดไป" });
    }

    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    // ยิงไป Spoonacular เพื่อขอข้อมูลละเอียด (Information)
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`, 
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeNutrition: true,
        }
      }
    );

    const recipe = response.data;

    // ถ้าขอภาษไทยให้แปลแบบ on-the-fly
    if (lang === 'th') {
      // แปลข้อความหลัก
      recipe.summary = await translateSafe(recipe.summary);

      // แปลวัตถุดิบ
      recipe.extendedIngredients = await Promise.all(
        recipe.extendedIngredients.map(async (ing) => ({
          ...ing,
          original: await translateSafe(ing.original),
        }))
      );

      // แปลขั้นตอน
      recipe.analyzedInstructions = await Promise.all(
        recipe.analyzedInstructions.map(async (instruction) => ({
          ...instruction,
          steps: await Promise.all(
            instruction.steps.map(async (step) => ({
              ...step,
              step: await translateSafe(step.step),
            }))
          ),
        }))
      );
    }

    res.json(recipe);
  } catch (err) {

    // Try serving cached favorite recipe first
    const cachedRecipe = await serveCachedRecipe(req.params.id, req.query.lang);
    if (cachedRecipe) {
      return res.json(cachedRecipe);
    }

    if (err.response && err.response.status === 402) {
      return res.status(402).json({ msg: "API Quota เต็มแล้ว โปรดรอวันถัดไป" });
    }

    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
