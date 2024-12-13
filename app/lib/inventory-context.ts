import { Fruit } from "@prisma/client";
import { createContext } from "react";

export const InventoryContext = createContext({
  inventory: Array<Fruit>(0),
  isLoading: true,
  isError: false
});