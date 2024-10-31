// stores/useStore.js
import { create } from "zustand";
import { IAnimeInfo } from "@consumet/extensions/dist/models/types"; // Adjust the path as necessary

interface StoreState {
  animeData: IAnimeInfo | null;
  setAnimeData: (data: IAnimeInfo) => void;
  clearAnimeData: () => void;
}
const useStore = create<StoreState>((set) => ({
  animeData: null,
  setAnimeData: (data) => set({ animeData: data }),
  clearAnimeData: () => set({ animeData: null }),
}));

export default useStore;
