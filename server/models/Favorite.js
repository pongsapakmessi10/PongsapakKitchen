const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // เชื่อมโยงไปหา User คนที่เป็นเจ้าของ
    required: true
  },
  recipeId: {
    type: Number, // ID จาก Spoonacular (เช่น 12345)
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  // เก็บ JSON ของวัตถุดิบไว้ด้วย เผื่อเอามาโชว์โดยไม่ต้องยิง API
  missedIngredientCount: { type: Number },
  usedIngredientCount: { type: Number },
  cachedRecipe: {
    id: { type: Number },
    title: String,
    image: String,
    readyInMinutes: Number,
    servings: Number,
    summary: String,
    extendedIngredients: [
      {
        id: Number,
        original: String,
        image: String,
      },
    ],
    analyzedInstructions: [
      {
        name: String,
        steps: [
          {
            number: Number,
            step: String,
          },
        ],
      },
    ],
    nutrition: {
      nutrients: [
        {
          name: String,
          amount: Number,
          unit: String,
        },
      ],
    },
  },
  
  savedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
