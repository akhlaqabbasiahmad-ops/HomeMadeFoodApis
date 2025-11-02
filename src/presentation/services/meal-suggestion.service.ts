import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { FoodItemEntity } from '../../infrastructure/database/entities/food-item.entity';

export interface MealSuggestion {
  meal: {
    name: string;
    description: string;
    category: string;
    price: number;
    restaurantName: string;
    id: string;
    image: string;
    rating: number;
  };
  reason: string;
  nutritionalInfo?: {
    calories?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isSpicy?: boolean;
  };
}

@Injectable()
export class MealSuggestionService {
  private readonly logger = new Logger(MealSuggestionService.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    @InjectRepository(FoodItemEntity)
    private foodRepository: Repository<FoodItemEntity>,
    private configService: ConfigService,
  ) {
    this.httpClient = axios.create({
      timeout: 30000, // 30 seconds timeout
    });
  }

  async suggestTodayMeal(userPreferences?: {
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    maxPrice?: number;
  }): Promise<MealSuggestion> {
    try {
      // Get available food items from database
      const availableItems = await this.foodRepository.find({
        where: { isAvailable: true },
        take: 50, // Limit to 50 items for AI processing
        order: { rating: 'DESC' },
      });

      // Search for external foods if no items or if we want more variety
      let externalFoods: any[] = [];
      try {
        externalFoods = await this.searchExternalFoods(userPreferences);
      } catch (error) {
        this.logger.warn('External food search failed, continuing with internal items only', error.message);
      }

      // Combine internal and external foods
      const allFoodOptions = [...availableItems, ...externalFoods];

      if (allFoodOptions.length === 0) {
        throw new Error('No available food items found');
      }

      // Filter by user preferences if provided
      let filteredItems = allFoodOptions;
      
      if (userPreferences) {
        if (userPreferences.maxPrice) {
          filteredItems = filteredItems.filter(item => {
            const price = 'price' in item ? parseFloat(item.price.toString()) : item.price;
            return price <= userPreferences.maxPrice;
          });
        }
        
        if (userPreferences.favoriteCategories && userPreferences.favoriteCategories.length > 0) {
          filteredItems = filteredItems.filter(item => {
            const category = 'category' in item ? item.category : item.categoryName;
            return userPreferences.favoriteCategories.includes(category);
          });
        }
        
        if (userPreferences.dietaryRestrictions) {
          if (userPreferences.dietaryRestrictions.includes('vegetarian')) {
            filteredItems = filteredItems.filter(item => {
              if ('isVegetarian' in item) {
                return item.isVegetarian;
              }
              return item.isVegetarian || false;
            });
          }
          if (userPreferences.dietaryRestrictions.includes('vegan')) {
            filteredItems = filteredItems.filter(item => {
              if ('isVegan' in item) {
                return item.isVegan;
              }
              return item.isVegan || false;
            });
          }
          if (userPreferences.dietaryRestrictions.includes('no-spicy')) {
            filteredItems = filteredItems.filter(item => {
              if ('isSpicy' in item) {
                return !item.isSpicy;
              }
              return !item.isSpicy || true;
            });
          }
        }
      }

      if (filteredItems.length === 0) {
        filteredItems = allFoodOptions; // Fallback to all items if filters too strict
      }

      // Use AI to suggest a meal
      const suggestion = await this.getAISuggestion(filteredItems);

      return suggestion;
    } catch (error) {
      this.logger.error('Error in suggestTodayMeal', error);
      
      // Fallback: return a random popular/featured item
      return await this.getFallbackSuggestion();
    }
  }

  private async getAISuggestion(items: any[]): Promise<MealSuggestion> {
    // Try to use OpenRouter AI model first (unified API for multiple models)
    try {
      // Check if OpenRouter API key is configured (recommended - supports many models)
      const openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY');
      if (openRouterApiKey) {
        return await this.getOpenRouterSuggestion(items, openRouterApiKey);
      }

      // Fallback to direct OpenAI if configured
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (openaiApiKey) {
        return await this.getOpenAISuggestion(items, openaiApiKey);
      }

      // Fallback to Anthropic if configured
      const anthropicApiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
      if (anthropicApiKey) {
        return await this.getAnthropicSuggestion(items, anthropicApiKey);
      }

      // Try Hugging Face as fallback
      const huggingFaceApiKey = this.configService.get<string>('HUGGING_FACE_API_KEY');
      return await this.getHuggingFaceSuggestion(items, huggingFaceApiKey);
    } catch (error) {
      this.logger.warn('AI suggestion failed, falling back to intelligent selection', error.message);
      // Fallback to intelligent selection if AI fails
      return await this.getIntelligentSuggestion(items);
    }
  }

  private async getOpenRouterSuggestion(items: any[], apiKey: string): Promise<MealSuggestion> {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = today.getHours();
    
    let mealTime = 'lunch';
    if (currentHour < 10) mealTime = 'breakfast';
    else if (currentHour >= 10 && currentHour < 15) mealTime = 'lunch';
    else if (currentHour >= 15 && currentHour < 20) mealTime = 'dinner';
    else mealTime = 'dinner';

    // Prepare items summary for AI
    const itemsSummary = items.slice(0, 20).map(item => {
      const isInternal = 'id' in item && 'restaurantName' in item;
      return {
        name: item.name,
        category: isInternal ? item.category : (item.categoryName || item.category || 'General'),
        price: isInternal ? parseFloat(item.price.toString()) : (item.price || 0),
        rating: isInternal ? parseFloat(item.rating.toString()) : (item.rating || 4.0),
        description: isInternal ? item.description.substring(0, 100) : (item.description || ''),
        isVegetarian: isInternal ? item.isVegetarian : (item.isVegetarian || false),
        isVegan: isInternal ? item.isVegan : (item.isVegan || false),
        isSpicy: isInternal ? item.isSpicy : (item.isSpicy || false),
        source: isInternal ? 'internal' : 'external',
      };
    });

    const prompt = `You are a food recommendation assistant. Today is ${dayOfWeek} and it's time for ${mealTime}.
    
Available food options:
${itemsSummary.map((item, idx) => 
  `${idx + 1}. ${item.name} - ${item.category} - $${item.price} - Rating: ${item.rating}/5 - ${item.description.substring(0, 80)}`
).join('\n')}

Based on the day (${dayOfWeek}), meal time (${mealTime}), ratings, and descriptions, suggest ONE best meal option.
Respond in JSON format:
{
  "selectedMealName": "exact name from list",
  "reason": "why this meal is perfect for today (be specific and appealing)",
  "suggestedPrice": price,
  "category": "category name"
}`;

    try {
      // Use OpenRouter unified API - supports multiple models with automatic fallback
      // Model preference: try cost-effective models first, fallback to more powerful ones
      const model = this.configService.get<string>('OPENROUTER_MODEL') || 'openai/gpt-3.5-turbo';
      
      const response = await this.httpClient.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful food recommendation assistant. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': this.configService.get<string>('APP_URL') || 'https://homemadefood.app',
            'X-Title': 'HomeMadeFood AI Meal Suggestions',
          },
          timeout: 20000,
        }
      );

      const aiContent = response.data.choices[0]?.message?.content || '';
      
      // Parse JSON response
      let aiResponse: any;
      try {
        // Try to extract JSON from response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI JSON response', aiContent);
        throw new Error('Invalid AI response format');
      }

      // Find the selected item
      const selectedItem = items.find(
        item => item.name.toLowerCase() === aiResponse.selectedMealName?.toLowerCase()
      ) || items[0];

      const isInternal = 'id' in selectedItem && 'restaurantName' in selectedItem;

      return {
        meal: {
          name: selectedItem.name,
          description: isInternal ? selectedItem.description : (selectedItem.description || 'Delicious meal recommendation'),
          category: isInternal ? selectedItem.category : (selectedItem.categoryName || selectedItem.category || 'General'),
          price: isInternal ? parseFloat(selectedItem.price.toString()) : (selectedItem.price || aiResponse.suggestedPrice || 15),
          restaurantName: isInternal ? selectedItem.restaurantName : (selectedItem.restaurantName || 'External Recommendation'),
          id: isInternal ? selectedItem.id : (selectedItem.id || `external-${Date.now()}`),
          image: isInternal ? selectedItem.image : (selectedItem.image || 'https://via.placeholder.com/400x300?text=Food+Image'),
          rating: isInternal ? parseFloat(selectedItem.rating.toString()) : (selectedItem.rating || 4.5),
        },
        reason: aiResponse.reason || `Perfect ${mealTime} choice for ${dayOfWeek}!`,
        nutritionalInfo: {
          calories: isInternal ? selectedItem.calories : (selectedItem.calories || undefined),
          isVegetarian: isInternal ? selectedItem.isVegetarian : (selectedItem.isVegetarian || false),
          isVegan: isInternal ? selectedItem.isVegan : (selectedItem.isVegan || false),
          isSpicy: isInternal ? selectedItem.isSpicy : (selectedItem.isSpicy || false),
        },
      };
    } catch (error: any) {
      this.logger.error('OpenRouter API error', error.message);
      throw error;
    }
  }

  private async getOpenAISuggestion(items: any[], apiKey: string): Promise<MealSuggestion> {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = today.getHours();
    
    let mealTime = 'lunch';
    if (currentHour < 10) mealTime = 'breakfast';
    else if (currentHour >= 10 && currentHour < 15) mealTime = 'lunch';
    else if (currentHour >= 15 && currentHour < 20) mealTime = 'dinner';
    else mealTime = 'dinner';

    // Prepare items summary for AI
    const itemsSummary = items.slice(0, 20).map(item => {
      const isInternal = 'id' in item && 'restaurantName' in item;
      return {
        name: item.name,
        category: isInternal ? item.category : (item.categoryName || item.category || 'General'),
        price: isInternal ? parseFloat(item.price.toString()) : (item.price || 0),
        rating: isInternal ? parseFloat(item.rating.toString()) : (item.rating || 4.0),
        description: isInternal ? item.description.substring(0, 100) : (item.description || ''),
        isVegetarian: isInternal ? item.isVegetarian : (item.isVegetarian || false),
        isVegan: isInternal ? item.isVegan : (item.isVegan || false),
        isSpicy: isInternal ? item.isSpicy : (item.isSpicy || false),
        source: isInternal ? 'internal' : 'external',
      };
    });

    const prompt = `You are a food recommendation assistant. Today is ${dayOfWeek} and it's time for ${mealTime}.
    
Available food options:
${itemsSummary.map((item, idx) => 
  `${idx + 1}. ${item.name} - ${item.category} - $${item.price} - Rating: ${item.rating}/5 - ${item.description.substring(0, 80)}`
).join('\n')}

Based on the day (${dayOfWeek}), meal time (${mealTime}), ratings, and descriptions, suggest ONE best meal option.
Respond in JSON format:
{
  "selectedMealName": "exact name from list",
  "reason": "why this meal is perfect for today (be specific and appealing)",
  "suggestedPrice": price,
  "category": "category name"
}`;

    try {
      const response = await this.httpClient.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful food recommendation assistant. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 20000,
        }
      );

      const aiContent = response.data.choices[0]?.message?.content || '';
      
      // Parse JSON response
      let aiResponse: any;
      try {
        // Try to extract JSON from response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI JSON response', aiContent);
        throw new Error('Invalid AI response format');
      }

      // Find the selected item
      const selectedItem = items.find(
        item => item.name.toLowerCase() === aiResponse.selectedMealName?.toLowerCase()
      ) || items[0];

      const isInternal = 'id' in selectedItem && 'restaurantName' in selectedItem;

      return {
        meal: {
          name: selectedItem.name,
          description: isInternal ? selectedItem.description : (selectedItem.description || 'Delicious meal recommendation'),
          category: isInternal ? selectedItem.category : (selectedItem.categoryName || selectedItem.category || 'General'),
          price: isInternal ? parseFloat(selectedItem.price.toString()) : (selectedItem.price || aiResponse.suggestedPrice || 15),
          restaurantName: isInternal ? selectedItem.restaurantName : (selectedItem.restaurantName || 'External Recommendation'),
          id: isInternal ? selectedItem.id : (selectedItem.id || `external-${Date.now()}`),
          image: isInternal ? selectedItem.image : (selectedItem.image || 'https://via.placeholder.com/400x300?text=Food+Image'),
          rating: isInternal ? parseFloat(selectedItem.rating.toString()) : (selectedItem.rating || 4.5),
        },
        reason: aiResponse.reason || `Perfect ${mealTime} choice for ${dayOfWeek}!`,
        nutritionalInfo: {
          calories: isInternal ? selectedItem.calories : (selectedItem.calories || undefined),
          isVegetarian: isInternal ? selectedItem.isVegetarian : (selectedItem.isVegetarian || false),
          isVegan: isInternal ? selectedItem.isVegan : (selectedItem.isVegan || false),
          isSpicy: isInternal ? selectedItem.isSpicy : (selectedItem.isSpicy || false),
        },
      };
    } catch (error: any) {
      this.logger.error('OpenAI API error', error.message);
      throw error;
    }
  }

  private async getAnthropicSuggestion(items: any[], apiKey: string): Promise<MealSuggestion> {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = today.getHours();
    
    let mealTime = 'lunch';
    if (currentHour < 10) mealTime = 'breakfast';
    else if (currentHour >= 10 && currentHour < 15) mealTime = 'lunch';
    else if (currentHour >= 15 && currentHour < 20) mealTime = 'dinner';
    else mealTime = 'dinner';

    const itemsSummary = items.slice(0, 20).map((item, idx) => {
      const isInternal = 'id' in item && 'restaurantName' in item;
      return `${idx + 1}. ${item.name} - ${isInternal ? item.category : (item.categoryName || item.category || 'General')} - $${isInternal ? parseFloat(item.price.toString()) : (item.price || 0)} - Rating: ${isInternal ? parseFloat(item.rating.toString()) : (item.rating || 4.0)}/5`;
    }).join('\n');

    const prompt = `Today is ${dayOfWeek} and it's ${mealTime} time. Suggest the best meal from these options:\n\n${itemsSummary}\n\nRespond with JSON: {"selectedMealName": "name", "reason": "why it's perfect for today"}`;

    try {
      const response = await this.httpClient.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          timeout: 20000,
        }
      );

      const aiContent = response.data.content[0]?.text || '';
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const aiResponse = JSON.parse(jsonMatch[0]);
      const selectedItem = items.find(
        item => item.name.toLowerCase() === aiResponse.selectedMealName?.toLowerCase()
      ) || items[0];

      const isInternal = 'id' in selectedItem && 'restaurantName' in selectedItem;

      return {
        meal: {
          name: selectedItem.name,
          description: isInternal ? selectedItem.description : (selectedItem.description || 'Delicious meal recommendation'),
          category: isInternal ? selectedItem.category : (selectedItem.categoryName || selectedItem.category || 'General'),
          price: isInternal ? parseFloat(selectedItem.price.toString()) : (selectedItem.price || 15),
          restaurantName: isInternal ? selectedItem.restaurantName : (selectedItem.restaurantName || 'External Recommendation'),
          id: isInternal ? selectedItem.id : (selectedItem.id || `external-${Date.now()}`),
          image: isInternal ? selectedItem.image : (selectedItem.image || 'https://via.placeholder.com/400x300?text=Food+Image'),
          rating: isInternal ? parseFloat(selectedItem.rating.toString()) : (selectedItem.rating || 4.5),
        },
        reason: aiResponse.reason || `Perfect ${mealTime} choice for ${dayOfWeek}!`,
        nutritionalInfo: {
          calories: isInternal ? selectedItem.calories : (selectedItem.calories || undefined),
          isVegetarian: isInternal ? selectedItem.isVegetarian : (selectedItem.isVegetarian || false),
          isVegan: isInternal ? selectedItem.isVegan : (selectedItem.isVegan || false),
          isSpicy: isInternal ? selectedItem.isSpicy : (selectedItem.isSpicy || false),
        },
      };
    } catch (error: any) {
      this.logger.error('Anthropic API error', error.message);
      throw error;
    }
  }

  private async searchExternalFoods(userPreferences?: {
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    maxPrice?: number;
  }): Promise<any[]> {
    const externalFoods: any[] = [];
    
    // Try Spoonacular API first
    const spoonacularApiKey = this.configService.get<string>('SPOONACULAR_API_KEY');
    if (spoonacularApiKey) {
      try {
        const spoonacularFoods = await this.searchSpoonacular(spoonacularApiKey, userPreferences);
        externalFoods.push(...spoonacularFoods);
      } catch (error) {
        this.logger.warn('Spoonacular search failed', error.message);
      }
    }

    // Try Edamam API as fallback
    const edamamAppId = this.configService.get<string>('EDAMAM_APP_ID');
    const edamamAppKey = this.configService.get<string>('EDAMAM_APP_KEY');
    if (edamamAppId && edamamAppKey && externalFoods.length < 5) {
      try {
        const edamamFoods = await this.searchEdamam(edamamAppId, edamamAppKey, userPreferences);
        externalFoods.push(...edamamFoods);
      } catch (error) {
        this.logger.warn('Edamam search failed', error.message);
      }
    }

    return externalFoods.slice(0, 10); // Limit to 10 external foods
  }

  private async searchSpoonacular(apiKey: string, userPreferences?: any): Promise<any[]> {
    const today = new Date();
    const currentHour = today.getHours();
    let mealType = 'lunch';
    if (currentHour < 10) mealType = 'breakfast';
    else if (currentHour >= 15) mealType = 'dinner';

    let diet = '';
    if (userPreferences?.dietaryRestrictions) {
      if (userPreferences.dietaryRestrictions.includes('vegan')) {
        diet = 'vegan';
      } else if (userPreferences.dietaryRestrictions.includes('vegetarian')) {
        diet = 'vegetarian';
      }
    }

    try {
      const response = await this.httpClient.get(
        'https://api.spoonacular.com/recipes/complexSearch',
        {
          params: {
            apiKey,
            type: mealType,
            number: 10,
            diet: diet || undefined,
            addRecipeInformation: true,
            sort: 'popularity',
          },
          timeout: 10000,
        }
      );

      return (response.data.results || []).map((recipe: any) => ({
        name: recipe.title,
        description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Delicious recipe',
        categoryName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        category: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        price: recipe.pricePerServing ? recipe.pricePerServing / 100 : (userPreferences?.maxPrice ? userPreferences.maxPrice * 0.8 : 12),
        rating: recipe.spoonacularScore ? recipe.spoonacularScore / 20 : 4.2,
        isVegetarian: recipe.vegetarian || false,
        isVegan: recipe.vegan || false,
        isSpicy: recipe.spicy || false,
        image: recipe.image || 'https://via.placeholder.com/400x300?text=Food+Image',
        calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || undefined,
        id: `spoonacular-${recipe.id}`,
        restaurantName: 'Recommended Recipe',
        source: 'spoonacular',
      }));
    } catch (error: any) {
      this.logger.warn('Spoonacular API error', error.message);
      return [];
    }
  }

  private async searchEdamam(appId: string, appKey: string, userPreferences?: any): Promise<any[]> {
    const today = new Date();
    const currentHour = today.getHours();
    let mealType = 'lunch';
    if (currentHour < 10) mealType = 'breakfast';
    else if (currentHour >= 15) mealType = 'dinner';

    let healthLabels = [];
    if (userPreferences?.dietaryRestrictions) {
      if (userPreferences.dietaryRestrictions.includes('vegan')) {
        healthLabels.push('vegan');
      } else if (userPreferences.dietaryRestrictions.includes('vegetarian')) {
        healthLabels.push('vegetarian');
      }
    }

    try {
      const response = await this.httpClient.get(
        'https://api.edamam.com/api/recipes/v2',
        {
          params: {
            type: 'public',
            q: mealType,
            app_id: appId,
            app_key: appKey,
            to: 10,
            health: healthLabels.join('&'),
          },
          timeout: 10000,
        }
      );

      return (response.data.hits || []).map((hit: any) => {
        const recipe = hit.recipe;
        return {
          name: recipe.label,
          description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Delicious recipe',
          categoryName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
          category: mealType.charAt(0).toUpperCase() + mealType.slice(1),
          price: userPreferences?.maxPrice ? userPreferences.maxPrice * 0.8 : 12,
          rating: 4.3,
          isVegetarian: recipe.healthLabels?.includes('Vegetarian') || false,
          isVegan: recipe.healthLabels?.includes('Vegan') || false,
          isSpicy: recipe.dietLabels?.some((label: string) => label.toLowerCase().includes('spicy')) || false,
          image: recipe.image || 'https://via.placeholder.com/400x300?text=Food+Image',
          calories: recipe.calories ? Math.round(recipe.calories) : undefined,
          id: `edamam-${recipe.uri.split('_').pop()}`,
          restaurantName: 'Recommended Recipe',
          source: 'edamam',
        };
      });
    } catch (error: any) {
      this.logger.warn('Edamam API error', error.message);
      return [];
    }
  }

  private async getFreePublicAISuggestion(items: FoodItemEntity[]): Promise<MealSuggestion> {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = today.getHours();
    
    // Determine meal time
    let mealTime = 'lunch';
    if (currentHour < 10) mealTime = 'breakfast';
    else if (currentHour >= 10 && currentHour < 15) mealTime = 'lunch';
    else if (currentHour >= 15 && currentHour < 20) mealTime = 'dinner';
    else mealTime = 'dinner';

    // Prepare items for AI
    const itemsSummary = items.slice(0, 15).map(item => ({
      name: item.name,
      category: item.category,
      price: parseFloat(item.price.toString()),
      rating: parseFloat(item.rating.toString()),
      description: item.description.substring(0, 80),
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isSpicy: item.isSpicy,
    }));

    try {
      // Use Hugging Face's public inference API (free, no key required)
      // Try multiple fast models that work without authentication
      const modelUrls = [
        'https://api-inference.huggingface.co/models/distilgpt2', // Faster, lighter model
        'https://api-inference.huggingface.co/models/gpt2',
      ];
      
      let modelUrl = modelUrls[0];
      
      const prompt = `Meal suggestion for ${mealTime} on ${dayOfWeek}. Options: ${itemsSummary.map(i => `${i.name} (${i.category}, rating: ${i.rating}/5, $${i.price})`).join('; ')}. Best choice:`;
      
      const response = await this.httpClient.post(
        modelUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.9,
            return_full_text: false,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      // Parse AI response and match with actual item
      let aiResponse = '';
      if (Array.isArray(response.data) && response.data.length > 0) {
        aiResponse = response.data[0].generated_text || response.data[0].text || '';
      } else if (response.data?.generated_text) {
        aiResponse = response.data.generated_text;
      }
      
      // Try to match item from AI response
      const selectedItem = this.matchItemFromAIResponse(items, aiResponse + prompt);

      // Generate personalized reason
      const reason = this.generatePersonalizedReason(selectedItem, dayOfWeek, mealTime);

      return {
        meal: {
          name: selectedItem.name,
          description: selectedItem.description,
          category: selectedItem.category,
          price: parseFloat(selectedItem.price.toString()),
          restaurantName: selectedItem.restaurantName,
          id: selectedItem.id,
          image: selectedItem.image,
          rating: parseFloat(selectedItem.rating.toString()),
        },
        reason: reason,
        nutritionalInfo: {
          calories: selectedItem.calories || undefined,
          isVegetarian: selectedItem.isVegetarian,
          isVegan: selectedItem.isVegan,
          isSpicy: selectedItem.isSpicy,
        },
      };
    } catch (error: any) {
      // If API returns 503 (model loading) or other errors, throw to use fallback
      if (error.response?.status === 503) {
        throw new Error('Model is loading, please use intelligent selection');
      }
      throw error;
    }
  }

  private async getHuggingFaceSuggestion(
    items: any[],
    apiKey?: string
  ): Promise<MealSuggestion> {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = today.getHours();
    
    // Determine meal time
    let mealTime = 'lunch';
    if (currentHour < 10) mealTime = 'breakfast';
    else if (currentHour >= 10 && currentHour < 15) mealTime = 'lunch';
    else if (currentHour >= 15 && currentHour < 20) mealTime = 'dinner';
    else mealTime = 'dinner';

    // Prepare items for AI
    const itemsSummary = items.slice(0, 10).map(item => {
      const isInternal = 'id' in item && 'restaurantName' in item;
      return {
        name: item.name,
        category: isInternal ? item.category : (item.categoryName || item.category || 'General'),
        price: isInternal ? parseFloat(item.price.toString()) : (item.price || 0),
        rating: isInternal ? parseFloat(item.rating.toString()) : (item.rating || 4.0),
        description: isInternal ? item.description.substring(0, 100) : (item.description?.substring(0, 100) || ''),
        isVegetarian: isInternal ? item.isVegetarian : (item.isVegetarian || false),
        isVegan: isInternal ? item.isVegan : (item.isVegan || false),
        isSpicy: isInternal ? item.isSpicy : (item.isSpicy || false),
      };
    });

    const prompt = `Given it's ${dayOfWeek} and time for ${mealTime}, suggest one meal from these options: ${JSON.stringify(itemsSummary)}. 
    Return a JSON object with: the selected meal name, a reason why it's perfect for today (consider day, time, and meal characteristics), 
    and suggest the best option. Make it personalized and appealing.`;

    try {
      // Using Hugging Face's free inference API
      // Using a smaller, faster model that works better with free tier
      const modelUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      // Use a simpler approach: generate a selection reason
      const simplePrompt = `Suggest a meal for ${mealTime} on ${dayOfWeek}. Here are options: ${itemsSummary.map(i => i.name).join(', ')}. Which one is best and why?`;
      
      const response = await this.httpClient.post(
        modelUrl,
        {
          inputs: simplePrompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.8,
            return_full_text: false,
          },
        },
        {
          headers,
          timeout: 15000, // 15 seconds timeout for free tier
        }
      );

      // Parse AI response and match with actual item
      // Handle different response formats from Hugging Face
      let aiResponse = '';
      if (Array.isArray(response.data) && response.data.length > 0) {
        aiResponse = response.data[0].generated_text || response.data[0].text || '';
      } else if (response.data?.generated_text) {
        aiResponse = response.data.generated_text;
      }
      
      const selectedItem = this.matchItemFromAIResponse(items, aiResponse);
      const isInternal = 'id' in selectedItem && 'restaurantName' in selectedItem;

      return {
        meal: {
          name: selectedItem.name,
          description: isInternal ? selectedItem.description : (selectedItem.description || 'Delicious meal recommendation'),
          category: isInternal ? selectedItem.category : (selectedItem.categoryName || selectedItem.category || 'General'),
          price: isInternal ? parseFloat(selectedItem.price.toString()) : (selectedItem.price || 15),
          restaurantName: isInternal ? selectedItem.restaurantName : (selectedItem.restaurantName || 'External Recommendation'),
          id: isInternal ? selectedItem.id : (selectedItem.id || `external-${Date.now()}`),
          image: isInternal ? selectedItem.image : (selectedItem.image || 'https://via.placeholder.com/400x300?text=Food+Image'),
          rating: isInternal ? parseFloat(selectedItem.rating.toString()) : (selectedItem.rating || 4.5),
        },
        reason: this.extractReasonFromAI(aiResponse) || `Perfect ${mealTime} choice for ${dayOfWeek}!`,
        nutritionalInfo: {
          calories: isInternal ? selectedItem.calories : (selectedItem.calories || undefined),
          isVegetarian: isInternal ? selectedItem.isVegetarian : (selectedItem.isVegetarian || false),
          isVegan: isInternal ? selectedItem.isVegan : (selectedItem.isVegan || false),
          isSpicy: isInternal ? selectedItem.isSpicy : (selectedItem.isSpicy || false),
        },
      };
    } catch (error) {
      this.logger.warn('Hugging Face API error', error.message);
      throw error;
    }
  }

  private async getIntelligentSuggestion(items: any[]): Promise<MealSuggestion> {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = today.getHours();
    
    let mealTime = 'lunch';
    if (currentHour < 10) mealTime = 'breakfast';
    else if (currentHour >= 10 && currentHour < 15) mealTime = 'lunch';
    else if (currentHour >= 15 && currentHour < 20) mealTime = 'dinner';
    else mealTime = 'dinner';

    // Intelligent selection based on:
    // 1. Featured items first (internal only)
    // 2. High ratings
    // 3. Popular items (internal only)
    // 4. Time-appropriate categories
    
    let selectedItem: any;
    
    // Try to find featured internal items first
    selectedItem = items.find(item => {
      const isInternal = 'id' in item && 'restaurantName' in item;
      const rating = isInternal ? parseFloat(item.rating.toString()) : (item.rating || 0);
      return isInternal && 'isFeatured' in item && item.isFeatured && rating >= 4.0;
    });
    
    if (!selectedItem) {
      // Try popular internal items
      selectedItem = items.find(item => {
        const isInternal = 'id' in item && 'restaurantName' in item;
        const rating = isInternal ? parseFloat(item.rating.toString()) : (item.rating || 0);
        return isInternal && 'isPopular' in item && item.isPopular && rating >= 4.0;
      });
    }
    
    if (!selectedItem) {
      // Sort by rating and select from top 3
      const sortedItems = [...items].sort((a, b) => {
        const isInternalA = 'id' in a && 'restaurantName' in a;
        const isInternalB = 'id' in b && 'restaurantName' in b;
        const ratingA = isInternalA ? parseFloat(a.rating.toString()) : (a.rating || 0);
        const ratingB = isInternalB ? parseFloat(b.rating.toString()) : (b.rating || 0);
        return ratingB - ratingA;
      });
      const topItems = sortedItems.slice(0, 3);
      selectedItem = topItems[Math.floor(Math.random() * topItems.length)];
    }

    if (!selectedItem) {
      selectedItem = items[Math.floor(Math.random() * items.length)];
    }

    const isInternal = 'id' in selectedItem && 'restaurantName' in selectedItem;

    // Generate personalized reason
    const reason = this.generatePersonalizedReason(selectedItem, dayOfWeek, mealTime);

    return {
      meal: {
        name: selectedItem.name,
        description: isInternal ? selectedItem.description : (selectedItem.description || 'Delicious meal recommendation'),
        category: isInternal ? selectedItem.category : (selectedItem.categoryName || selectedItem.category || 'General'),
        price: isInternal ? parseFloat(selectedItem.price.toString()) : (selectedItem.price || 15),
        restaurantName: isInternal ? selectedItem.restaurantName : (selectedItem.restaurantName || 'External Recommendation'),
        id: isInternal ? selectedItem.id : (selectedItem.id || `external-${Date.now()}`),
        image: isInternal ? selectedItem.image : (selectedItem.image || 'https://via.placeholder.com/400x300?text=Food+Image'),
        rating: isInternal ? parseFloat(selectedItem.rating.toString()) : (selectedItem.rating || 4.5),
      },
      reason: reason,
      nutritionalInfo: {
        calories: isInternal ? selectedItem.calories : (selectedItem.calories || undefined),
        isVegetarian: isInternal ? selectedItem.isVegetarian : (selectedItem.isVegetarian || false),
        isVegan: isInternal ? selectedItem.isVegan : (selectedItem.isVegan || false),
        isSpicy: isInternal ? selectedItem.isSpicy : (selectedItem.isSpicy || false),
      },
    };
  }

  private async getFallbackSuggestion(): Promise<MealSuggestion> {
    const items = await this.foodRepository.find({
      where: { isAvailable: true },
      take: 1,
      order: { rating: 'DESC' },
    });

    if (items.length === 0) {
      throw new Error('No food items available');
    }

    const item = items[0];
    return {
      meal: {
        name: item.name,
        description: item.description,
        category: item.category,
        price: parseFloat(item.price.toString()),
        restaurantName: item.restaurantName,
        id: item.id,
        image: item.image,
        rating: parseFloat(item.rating.toString()),
      },
      reason: 'Our top-rated meal recommendation for today!',
      nutritionalInfo: {
        calories: item.calories || undefined,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isSpicy: item.isSpicy,
      },
    };
  }

  private matchItemFromAIResponse(items: any[], aiResponse: string): any {
    // Try to find the item mentioned in AI response
    const lowerResponse = aiResponse.toLowerCase();
    
    for (const item of items) {
      if (lowerResponse.includes(item.name.toLowerCase())) {
        return item;
      }
    }

    // If no match, return top rated item
    const sortedItems = [...items].sort((a, b) => {
      const ratingA = 'rating' in a ? parseFloat(a.rating.toString()) : (a.rating || 0);
      const ratingB = 'rating' in b ? parseFloat(b.rating.toString()) : (b.rating || 0);
      return ratingB - ratingA;
    });
    return sortedItems[0];
  }

  private extractReasonFromAI(aiResponse: string): string {
    // Try to extract reason from AI response
    // This is a simple extraction - can be improved
    const lines = aiResponse.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('reason') || line.toLowerCase().includes('because')) {
        return line.trim();
      }
    }
    
    // Return first meaningful sentence
    const sentences = aiResponse.split(/[.!?]/).filter(s => s.trim().length > 20);
    return sentences[0]?.trim() || 'Great choice for today!';
  }

  private generatePersonalizedReason(item: any, dayOfWeek: string, mealTime: string): string {
    const reasons: string[] = [];
    
    // Day-specific reasons
    const weekendDays = ['Saturday', 'Sunday'];
    if (weekendDays.includes(dayOfWeek)) {
      reasons.push(`Perfect for a relaxing ${dayOfWeek} ${mealTime}!`);
      reasons.push(`A special treat for your ${dayOfWeek} ${mealTime}!`);
    } else {
      reasons.push(`Great ${mealTime} choice to fuel your ${dayOfWeek}!`);
      reasons.push(`Perfect ${mealTime} pick for a productive ${dayOfWeek}!`);
    }

    // Rating-based reasons
    const isInternal = 'id' in item && 'restaurantName' in item;
    const rating = isInternal ? parseFloat(item.rating.toString()) : (item.rating || 4.0);
    if (rating >= 4.5) {
      reasons.push(`Highly rated at ${rating.toFixed(1)}⭐ - a crowd favorite!`);
    } else if (rating >= 4.0) {
      reasons.push(`Rated ${rating.toFixed(1)}⭐ - consistently delicious!`);
    }

    // Category-based reasons
    const category = isInternal ? item.category : (item.categoryName || item.category || '');
    if (category && (category.toLowerCase().includes('healthy') || (isInternal ? item.isVegetarian : (item.isVegetarian || false)))) {
      reasons.push(`Nutritious and satisfying - perfect for a healthy ${mealTime}!`);
    }
    if (category && category.toLowerCase().includes('comfort')) {
      reasons.push(`Comfort food at its finest for your ${mealTime}!`);
    }

    // Time-based reasons
    if (mealTime === 'breakfast' && category && (category.toLowerCase().includes('breakfast') || category.toLowerCase().includes('egg'))) {
      reasons.push(`Start your day right with this delicious breakfast!`);
    }
    if (mealTime === 'dinner' && category && category.toLowerCase().includes('dinner')) {
      reasons.push(`A hearty dinner option to end your day on a high note!`);
    }

    // Featured/Popular reasons (internal only)
    if (isInternal && 'isFeatured' in item && item.isFeatured) {
      reasons.push(`Featured favorite - specially selected for today!`);
    }
    if (isInternal && 'isPopular' in item && item.isPopular) {
      reasons.push(`Popular choice - loved by many customers!`);
    }

    // Price-based reasons
    const price = isInternal ? parseFloat(item.price.toString()) : (item.price || 15);
    if (price < 10) {
      reasons.push(`Great value for an amazing ${mealTime}!`);
    } else if (price > 20) {
      reasons.push(`Premium quality worth every penny!`);
    }

    // Return a random personalized reason
    return reasons.length > 0 
      ? reasons[Math.floor(Math.random() * reasons.length)]
      : `Perfect ${mealTime} choice for ${dayOfWeek}!`;
  }
}

