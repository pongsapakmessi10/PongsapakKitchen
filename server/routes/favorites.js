const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth'); // เรียกใช้ตัวตรวจบัตร
const Favorite = require('../models/Favorite');

// 1. ดูรายการโปรดทั้งหมด (GET /api/favorites)
router.get('/', auth, async (req, res) => {
  try {
    // หาเมนูที่ user คนนี้บันทึกไว้ เรียงจากใหม่ไปเก่า
    const favorites = await Favorite.find({ user: req.user.id }).sort({ savedAt: -1 });
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. บันทึกเมนูโปรด (POST /api/favorites)
router.post('/', auth, async (req, res) => {
  try {
    const { recipeId, title, image, missedIngredientCount, usedIngredientCount } = req.body;

    // เช็คว่าเคยบันทึกเมนูนี้ไปหรือยัง?
    let fav = await Favorite.findOne({ user: req.user.id, recipeId });
    if (fav) {
      return res.status(400).json({ msg: 'เมนูนี้ถูกบันทึกไปแล้ว' });
    }

    // ดึงรายละเอียดสูตรเต็มเพื่อแคชไว้ (เผื่อ API quota หมด)
    let cachedRecipe = null;
    try {
      const detailRes = await axios.get(
        `https://api.spoonacular.com/recipes/${recipeId}/information`,
        {
          params: { apiKey: process.env.SPOONACULAR_API_KEY, includeNutrition: true },
        }
      );
      const data = detailRes.data;
      cachedRecipe = {
        id: data.id,
        title: data.title,
        image: data.image,
        readyInMinutes: data.readyInMinutes,
        servings: data.servings,
        summary: data.summary,
        extendedIngredients: data.extendedIngredients?.map((ing) => ({
          id: ing.id,
          original: ing.original,
          image: ing.image,
        })),
        analyzedInstructions: data.analyzedInstructions?.map((ins) => ({
          name: ins.name,
          steps: ins.steps?.map((step) => ({
            number: step.number,
            step: step.step,
          })),
        })),
        nutrition: {
          nutrients: data.nutrition?.nutrients?.map((n) => ({
            name: n.name,
            amount: n.amount,
            unit: n.unit,
          })),
        },
      };
    } catch (err) {
      console.error('ไม่สามารถดึงข้อมูลสูตรเต็มเพื่อแคชได้', err.message);
    }

    // สร้างข้อมูลใหม่
    const newFav = new Favorite({
      user: req.user.id,
      recipeId,
      title,
      image,
      missedIngredientCount,
      usedIngredientCount,
      cachedRecipe,
    });

    const favorite = await newFav.save();
    res.json(favorite);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. ลบเมนูโปรด (DELETE /api/favorites/:id)
router.delete('/:id', auth, async (req, res) => {
  try {
    // หาเมนูตาม ID ที่ส่งมา (ไม่ใช่ ID อาหารนะ เป็น ID ของข้อมูลใน Database เรา)
    const fav = await Favorite.findById(req.params.id);

    if (!fav) return res.status(404).json({ msg: 'ไม่พบข้อมูล' });

    // เช็คว่าเป็นเจ้าของเมนูนี้จริงไหม (เผื่อคนอื่นมั่วลบ)
    if (fav.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'ไม่ได้รับอนุญาต' });
    }

    await fav.deleteOne();
    res.json({ msg: 'ลบเมนูเรียบร้อย' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
