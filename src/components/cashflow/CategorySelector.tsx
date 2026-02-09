/**
 * CategorySelector - Cashflow Category Picker
 * Displays categories with icons for selection
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';
import type { CashflowCategory } from '@/types/database';

interface CategorySelectorProps {
  categories: CashflowCategory[];
  selectedId?: string;
  onSelect: (category: CashflowCategory) => void;
  type?: 'income' | 'expense';
  className?: string;
}

export function CategorySelector({
  categories,
  selectedId,
  onSelect,
  type,
  className,
}: CategorySelectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter by type if specified
  const filteredCategories = type
    ? categories.filter((c) => c.type === type)
    : categories;

  // Separate root and child categories
  const rootCategories = filteredCategories.filter((c) => !c.parent_id);
  const childrenMap = new Map<string, CashflowCategory[]>();

  filteredCategories.forEach((c) => {
    if (c.parent_id) {
      const children = childrenMap.get(c.parent_id) || [];
      children.push(c);
      childrenMap.set(c.parent_id, children);
    }
  });

  const handleCategoryClick = (category: CashflowCategory) => {
    const children = childrenMap.get(category.id);

    if (children && children.length > 0) {
      // Toggle expand if has children
      setExpandedId(expandedId === category.id ? null : category.id);
    } else {
      // Select if no children
      onSelect(category);
    }
  };

  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {rootCategories.map((category) => {
        const children = childrenMap.get(category.id);
        const hasChildren = children && children.length > 0;
        const isExpanded = expandedId === category.id;
        const isSelected = selectedId === category.id;

        return (
          <div key={category.id} className="contents">
            {/* Parent Category */}
            <button
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: category.color || '#E5E7EB' }}
              >
                {isSelected ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-white text-lg">
                    {category.icon || category.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">
                {category.name}
              </span>
              {hasChildren && (
                <ChevronRight
                  className={cn(
                    'h-3 w-3 mt-1 transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              )}
            </button>

            {/* Child Categories (if expanded) */}
            {isExpanded && hasChildren && (
              <div className="col-span-4 grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded-lg">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => onSelect(child)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg border transition-colors',
                      selectedId === child.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                      style={{ backgroundColor: child.color || category.color || '#E5E7EB' }}
                    >
                      {selectedId === child.id ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-sm">
                          {child.icon || child.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs truncate w-full text-center">
                      {child.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CategorySelector;
