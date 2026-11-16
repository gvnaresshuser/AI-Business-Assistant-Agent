
import {
  getAllBusinesses,
  getBusinessById,
  Business
} from "../repositories/business.repository.js";

export const fetchAllBusinesses = async (): Promise<Business[]> => {
  return await getAllBusinesses();
};

export const fetchBusinessById = async (
  id: string
): Promise<Business | null> => {
  return await getBusinessById(id);
};
