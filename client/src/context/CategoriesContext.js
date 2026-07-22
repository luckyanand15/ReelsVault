import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCategories } from '../api/category.api';
import { mapCategory } from '../utils/mapCategory';

export const ALL_CATEGORY = { id: 'all', label: 'All', icon: '✨' };

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categoriesList, setCategoriesList] = useState([ALL_CATEGORY]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const categories = await fetchCategories();
        if (isMounted) {
          setCategoriesList([ALL_CATEGORY, ...categories.map(mapCategory)]);
        }
      } catch (error) {
        console.error('Failed to load categories:', error?.message);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CategoriesContext.Provider value={{ categoriesList, setCategoriesList }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
