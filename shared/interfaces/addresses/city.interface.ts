/**
 * City Interface
 * Interface for cities
 */
export interface ICity {
  id: string;
  value: string;
}

/**
 * City with relations
 */
export interface ICityWithRelations extends ICity {
  groups?: Array<{
    id: string;
    name: string;
  }>;
}
