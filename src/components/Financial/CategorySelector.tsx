import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  code: string;
  name: string;
  type: "RECEITA" | "DESPESA";
  parent_code: string | null;
  is_active: boolean;
}

interface CategorySelectorProps {
  type: "RECEITA" | "DESPESA";
  value?: string;
  onChange: (categoryCode: string, categoryName: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  type,
  value,
  onChange,
  label = "Categoria",
  required = false,
  className = "",
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  useEffect(() => {
    // Atualizar o nome da categoria selecionada
    if (value && categories.length > 0) {
      const selected = categories.find((c) => c.code === value);
      if (selected) {
        setSelectedName(selected.name);
      }
    }
  }, [value, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("financial_categories")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupCode: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupCode)) {
      newExpanded.delete(groupCode);
    } else {
      newExpanded.add(groupCode);
    }
    setExpandedGroups(newExpanded);
  };

  // Organizar categorias hierarquicamente
  const rootCategories = categories.filter((c) => !c.parent_code);

  const getChildCategories = (parentCode: string) => {
    return categories.filter((c) => c.parent_code === parentCode);
  };

  const handleSelect = (category: Category) => {
    onChange(category.code, category.name);
    setSelectedName(category.name);
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="animate-pulse bg-slate-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`w-full px-4 py-2 text-left border rounded-lg bg-white transition-colors ${
            showDropdown
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <div className="flex justify-between items-center">
            <span
              className={selectedName ? "text-slate-900" : "text-slate-500"}
            >
              {selectedName || "Selecionar categoria..."}
            </span>
            {showDropdown ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {rootCategories.length === 0 ? (
              <div className="px-4 py-3 text-slate-500 text-sm">
                Nenhuma categoria disponível
              </div>
            ) : (
              rootCategories.map((root) => {
                const children = getChildCategories(root.code);
                const isExpanded = expandedGroups.has(root.code);

                return (
                  <div
                    key={root.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    {/* Categoria raiz - não é selecionável */}
                    <button
                      type="button"
                      onClick={() =>
                        children.length > 0 && toggleGroup(root.code)
                      }
                      className={`w-full px-4 py-2 text-left font-semibold ${
                        children.length > 0
                          ? "bg-slate-50 hover:bg-slate-100 cursor-pointer flex justify-between items-center"
                          : "bg-slate-50"
                      }`}
                      disabled={children.length === 0}
                    >
                      <span
                        className={`text-sm ${
                          type === "RECEITA"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {root.code} - {root.name}
                      </span>
                      {children.length > 0 &&
                        (isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ))}
                    </button>

                    {/* Categorias filhas (1.1, 1.2, etc) */}
                    {isExpanded && children.length > 0 && (
                      <div className="bg-slate-50">
                        {children.map((child) => {
                          const grandchildren = getChildCategories(child.code);

                          return (
                            <div key={child.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  grandchildren.length > 0 &&
                                  toggleGroup(child.code)
                                }
                                className={`w-full px-6 py-2 text-left text-sm ${
                                  grandchildren.length > 0
                                    ? "bg-white hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                                    : "bg-white hover:bg-indigo-50"
                                }`}
                                disabled={grandchildren.length === 0}
                              >
                                <span className="text-slate-700 font-medium">
                                  {child.code} - {child.name}
                                </span>
                                {grandchildren.length > 0 &&
                                  (expandedGroups.has(child.code) ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  ))}
                              </button>

                              {/* Categorias finais (1.1.01, 1.1.03, etc) */}
                              {expandedGroups.has(child.code) &&
                                grandchildren.length > 0 && (
                                  <div className="bg-white">
                                    {grandchildren.map((leaf) => (
                                      <button
                                        key={leaf.id}
                                        type="button"
                                        onClick={() => handleSelect(leaf)}
                                        className={`w-full px-8 py-2 text-left text-sm hover:bg-indigo-50 transition-colors ${
                                          value === leaf.code
                                            ? "bg-indigo-100 border-l-4 border-indigo-500"
                                            : ""
                                        }`}
                                      >
                                        <span
                                          className={`${
                                            value === leaf.code
                                              ? "text-indigo-700 font-semibold"
                                              : "text-slate-600"
                                          }`}
                                        >
                                          {leaf.code} - {leaf.name}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {value && <p className="mt-1 text-xs text-slate-500">Código: {value}</p>}
    </div>
  );
};
