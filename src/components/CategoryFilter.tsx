import React from 'react';
import { ProductCategory } from '../types';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface CategoryFilterProps {
  categories: (ProductCategory | 'All Items')[];
  selectedCategory: ProductCategory | 'All Items';
  onSelectCategory: (cat: ProductCategory | 'All Items') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
}) => {
  const dietaryTags = ['High Protein', 'Fiber Rich', 'Low Calorie', 'Vegan', 'Gluten Free'];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search healthy bowls, sandwiches, ingredients (e.g. oats, chia, avocado)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1C1613] border border-stone-200/90 dark:border-stone-800 rounded-xl text-xs sm:text-sm text-[#4A2414] dark:text-[#FFA756] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F47B16]/30 focus:border-[#F47B16] shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills (horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-[#4A2414] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1C1613] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Dietary filter tags */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] text-stone-500 dark:text-stone-400 pt-1">
        <span className="font-semibold text-stone-400 shrink-0">Filter by:</span>
        <button
          onClick={() => onSelectTag(null)}
          className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${
            selectedTag === null
              ? 'bg-[#2E7D32]/15 dark:bg-[#2E7D32]/30 text-[#2E7D32] dark:text-[#81C784] font-bold'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          All Diet
        </button>
        {dietaryTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
            className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${
              selectedTag === tag
                ? 'bg-[#2E7D32] text-white font-bold'
                : 'bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-transparent dark:border-stone-800'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
