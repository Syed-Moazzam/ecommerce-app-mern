import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/categories')
      .then(({ data }) => active && setCategories(data.categories))
      .catch(() => active && setCategories([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
};
