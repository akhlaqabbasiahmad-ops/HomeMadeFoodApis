export class FoodItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly image: string,
    public readonly price: number,
    public readonly originalPrice: number | null,
    public readonly rating: number,
    public readonly reviews: number,
    public readonly category: string,
    public readonly restaurantId: string,
    public readonly restaurantName: string,
    public readonly ingredients: string[],
    public readonly allergens: string[],
    public readonly isVegetarian: boolean,
    public readonly isVegan: boolean,
    public readonly isSpicy: boolean,
    public readonly preparationTime: number,
    public readonly calories: number | null,
    public readonly isAvailable: boolean = true,
    public readonly isFeatured: boolean = false,
    public readonly isPopular: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public update(updates: Partial<Omit<FoodItem, 'id' | 'restaurantId' | 'createdAt'>>): FoodItem {
    return new FoodItem(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.image ?? this.image,
      updates.price ?? this.price,
      updates.originalPrice ?? this.originalPrice,
      updates.rating ?? this.rating,
      updates.reviews ?? this.reviews,
      updates.category ?? this.category,
      this.restaurantId,
      updates.restaurantName ?? this.restaurantName,
      updates.ingredients ?? this.ingredients,
      updates.allergens ?? this.allergens,
      updates.isVegetarian ?? this.isVegetarian,
      updates.isVegan ?? this.isVegan,
      updates.isSpicy ?? this.isSpicy,
      updates.preparationTime ?? this.preparationTime,
      updates.calories ?? this.calories,
      updates.isAvailable ?? this.isAvailable,
      updates.isFeatured ?? this.isFeatured,
      updates.isPopular ?? this.isPopular,
      this.createdAt,
      new Date(),
    );
  }

  public updateRating(newRating: number): FoodItem {
    const totalRating = (this.rating * this.reviews + newRating) / (this.reviews + 1);
    return this.update({ 
      rating: Math.round(totalRating * 10) / 10, 
      reviews: this.reviews + 1 
    });
  }

  public toggleAvailability(): FoodItem {
    return this.update({ isAvailable: !this.isAvailable });
  }

  public markAsFeatured(): FoodItem {
    return this.update({ isFeatured: true });
  }

  public markAsPopular(): FoodItem {
    return this.update({ isPopular: true });
  }
}

export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly image: string,
    public readonly icon: string,
    public readonly isActive: boolean = true,
    public readonly sortOrder: number = 0,
    public readonly createdAt: Date = new Date(),
  ) {}

  public update(name?: string, image?: string, icon?: string, sortOrder?: number): Category {
    return new Category(
      this.id,
      name ?? this.name,
      image ?? this.image,
      icon ?? this.icon,
      this.isActive,
      sortOrder ?? this.sortOrder,
      this.createdAt,
    );
  }

  public toggleStatus(): Category {
    return new Category(
      this.id,
      this.name,
      this.image,
      this.icon,
      !this.isActive,
      this.sortOrder,
      this.createdAt,
    );
  }
}