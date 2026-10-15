import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Radio,
  Sparkles,
  Film,
  Layers,
  Armchair,
  Disc3,
  Cable,
  ArrowUpRight,
  Database,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { getEquipment, getCategories } from '../services/equipmentService';
import './EquipmentPage.css';

export function EquipmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filter state directly from URL search params
  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'default';

  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch equipment whenever filters change
  useEffect(() => {
    let isCancelled = false;
    async function fetchItems() {
      setIsLoading(true);
      try {
        const response = await getEquipment({
          category: selectedCategory,
          search: searchQuery,
          sortBy,
        });
        if (!isCancelled) {
          setEquipmentList(response.data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to fetch equipment', err);
          setEquipmentList([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchItems();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, searchQuery, sortBy]);

  // Update URL params when user changes filters
  const updateFilters = (newCat, newQuery, newSort) => {
    const params = new URLSearchParams();
    if (newCat && newCat !== 'all') params.set('category', newCat);
    if (newQuery) params.set('q', newQuery);
    if (newSort && newSort !== 'default') params.set('sort', newSort);
    setSearchParams(params);
  };

  const handleCategoryChange = (catId) => {
    updateFilters(catId, searchQuery, sortBy);
  };

  const handleSearchChange = (e) => {
    updateFilters(selectedCategory, e.target.value, sortBy);
  };

  const handleClearSearch = () => {
    updateFilters(selectedCategory, '', sortBy);
  };

  const handleSortChange = (e) => {
    updateFilters(selectedCategory, searchQuery, e.target.value);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'audio': return <Radio size={14} />;
      case 'lighting': return <Sparkles size={14} />;
      case 'projection': return <Film size={14} />;
      case 'stage': return <Layers size={14} />;
      case 'furniture': return <Armchair size={14} />;
      case 'dj': return <Disc3 size={14} />;
      case 'accessories': return <Cable size={14} />;
      default: return <SlidersHorizontal size={14} />;
    }
  };

  return (
    <div className="aura-catalogue">
      <div className="container">
        {/* Page Heading */}
        <div className="aura-catalogue__header">
          <div className="aura-catalogue__eyebrow">
            <Radio size={14} />
            <span>Master Inventory</span>
          </div>
          <h1 className="aura-catalogue__title">Event Equipment Catalogue</h1>
          <p className="aura-catalogue__desc">
            Browse our fleet of touring sound reinforcement, automated stage fixtures, 4K LED panels, and staging infrastructure.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="aura-catalogue__controls">
          <div className="aura-catalogue__search-box">
            <div className="aura-input-wrapper">
              <span className="aura-input-icon aura-input-icon--left">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by equipment name, brand, or model..."
                className="aura-input has-left-icon has-right-icon"
                aria-label="Search equipment"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="aura-catalogue__filters-row">
            <div className="aura-catalogue__sort-select">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="aura-input"
                aria-label="Sort equipment"
                style={{ cursor: 'pointer' }}
              >
                <option value="default">Featured & Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>

            {(selectedCategory !== 'all' || searchQuery || sortBy !== 'default') && (
              <Button variant="tertiary" size="sm" onClick={handleResetFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="aura-catalogue__categories" role="tablist" aria-label="Filter by equipment category">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className={`aura-catalogue__cat-btn ${selectedCategory === cat.id ? 'is-active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Results Metadata Bar */}
        <div className="aura-catalogue__meta">
          <div>
            Showing <span className="aura-catalogue__count">{equipmentList.length}</span> items
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.label || selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          <div className="aura-catalogue__demo-tag">
            <Database size={13} />
            <span>Mock Service Active</span>
          </div>
        </div>

        {/* Main Catalogue Grid / Loading / Empty States */}
        {isLoading ? (
          <Spinner size={36} text="Loading equipment inventory..." />
        ) : equipmentList.length === 0 ? (
          <EmptyState
            title="No matching equipment found"
            description="We couldn't find any equipment matching your active search or category filters. Try resetting your filters to view all available gear."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="aura-catalogue__grid">
            {equipmentList.map((item) => (
              <article key={item.id} className="aura-item-card">
                {/* Media with Fallback */}
                <div className="aura-item-card__media">
                  {!imageErrors[item.id] ? (
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                      alt={item.name}
                      className="aura-item-card__img"
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="aura-item-card__fallback">
                      {getCategoryIcon(item.category)}
                      <span>{item.name}</span>
                    </div>
                  )}
                  <div className="aura-item-card__gradient" />

                  <div className="aura-item-card__header-badges">
                    <span className="aura-item-card__cat-pill">{item.categoryLabel}</span>
                    <Badge variant={item.status} size="sm">{item.status}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="aura-item-card__content">
                  <div className="aura-item-card__brand-row">
                    <span className="aura-item-card__brand">{item.brand}</span>
                    <span className="aura-item-card__stock-tag">
                      {item.availableQuantity} of {item.stock} in stock
                    </span>
                  </div>

                  <h3 className="aura-item-card__name">{item.name}</h3>
                  <p className="aura-item-card__desc">{item.shortDesc}</p>

                  {/* Specs Chips */}
                  {item.specs && (
                    <div className="aura-item-card__specs-row">
                      {Object.entries(item.specs).slice(0, 2).map(([key, val]) => (
                        <span key={key} className="aura-item-card__spec-pill">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="aura-item-card__footer">
                    <div className="aura-item-card__price-wrap">
                      <span className="aura-item-card__price">${item.dailyRate}</span>
                      <span className="aura-item-card__unit">{item.unit}</span>
                    </div>

                    <div className="aura-item-card__actions">
                      <Link to={`/equipment/${item.id}`}>
                        <Button variant="outline" size="sm">
                          Specs
                        </Button>
                      </Link>
                      <Link to={`/book/${item.id}`}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowUpRight size={14} />}>
                          Reserve
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipmentPage;
