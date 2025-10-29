export class Restaurant {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly image: string,
    public readonly rating: number,
    public readonly reviews: number,
    public readonly deliveryTime: string,
    public readonly deliveryFee: number,
    public readonly minimumOrder: number,
    public readonly categories: string[],
    public readonly isOpen: boolean,
    public readonly distance: number,
    public readonly coordinates: Coordinates,
    public readonly ownerId: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public update(updates: Partial<Omit<Restaurant, 'id' | 'ownerId' | 'createdAt'>>): Restaurant {
    return new Restaurant(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.image ?? this.image,
      updates.rating ?? this.rating,
      updates.reviews ?? this.reviews,
      updates.deliveryTime ?? this.deliveryTime,
      updates.deliveryFee ?? this.deliveryFee,
      updates.minimumOrder ?? this.minimumOrder,
      updates.categories ?? this.categories,
      updates.isOpen ?? this.isOpen,
      updates.distance ?? this.distance,
      updates.coordinates ?? this.coordinates,
      this.ownerId,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  public toggleStatus(): Restaurant {
    return this.update({ isOpen: !this.isOpen });
  }

  public updateRating(newRating: number, reviewCount: number): Restaurant {
    const totalRating = (this.rating * this.reviews + newRating) / (this.reviews + 1);
    return this.update({ 
      rating: Math.round(totalRating * 10) / 10, 
      reviews: reviewCount 
    });
  }
}

export class Coordinates {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}
}