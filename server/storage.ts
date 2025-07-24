import type { Umbrella } from "@shared/schema";

// Storage interface for umbrella system
export interface IStorage {
  getUmbrella(id: number): Promise<Umbrella | undefined>;
  getAllUmbrellas(): Promise<Umbrella[]>;
  updateUmbrella(id: number, data: Partial<Umbrella>): Promise<Umbrella>;
}

export class MemStorage implements IStorage {
  private umbrellas: Map<number, Umbrella>;

  constructor() {
    this.umbrellas = new Map();
  }

  async getUmbrella(id: number): Promise<Umbrella | undefined> {
    return this.umbrellas.get(id);
  }

  async getAllUmbrellas(): Promise<Umbrella[]> {
    return Array.from(this.umbrellas.values());
  }

  async updateUmbrella(id: number, data: Partial<Umbrella>): Promise<Umbrella> {
    const existing = this.umbrellas.get(id);
    const updated = { ...existing, ...data } as Umbrella;
    this.umbrellas.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
