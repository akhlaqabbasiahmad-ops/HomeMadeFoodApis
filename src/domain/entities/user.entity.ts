export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly password?: string,
    public readonly avatar?: string,
    public readonly addresses?: Address[],
    public readonly role: string = 'user',
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public updateProfile(name?: string, phone?: string, avatar?: string): User {
    return new User(
      this.id,
      name ?? this.name,
      this.email,
      phone ?? this.phone,
      this.password,
      avatar ?? this.avatar,
      this.addresses,
      this.role,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  public addAddress(address: Address): User {
    const updatedAddresses = [...(this.addresses || []), address];
    return new User(
      this.id,
      this.name,
      this.email,
      this.phone,
      this.password,
      this.avatar,
      updatedAddresses,
      this.role,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  public deactivate(): User {
    return new User(
      this.id,
      this.name,
      this.email,
      this.phone,
      this.password,
      this.avatar,
      this.addresses,
      this.role,
      false,
      this.createdAt,
      new Date(),
    );
  }
}

export class Address {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly isDefault: boolean = false,
    public readonly userId: string,
    public readonly createdAt: Date = new Date(),
  ) {}

  public makeDefault(): Address {
    return new Address(
      this.id,
      this.title,
      this.address,
      this.latitude,
      this.longitude,
      true,
      this.userId,
      this.createdAt,
    );
  }

  public update(title?: string, address?: string, latitude?: number, longitude?: number): Address {
    return new Address(
      this.id,
      title ?? this.title,
      address ?? this.address,
      latitude ?? this.latitude,
      longitude ?? this.longitude,
      this.isDefault,
      this.userId,
      this.createdAt,
    );
  }
}