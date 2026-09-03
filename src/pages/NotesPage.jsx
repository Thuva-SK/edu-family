import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import ResourceCard from '../components/ResourceCard';

export default function NotesPage() {
  const { resources } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  const filteredResources = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sorted = [...resources].sort((a, b) =>
      sortOrder === 'latest'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

    return sorted.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const haystack = `${item.title} ${item.category} ${item.description}`.toLowerCase();
      return matchesCat && haystack.includes(term);
    });
  }, [resources, searchTerm, selectedCategory, sortOrder]);

  const pastPapers = filteredResources.filter((item) => item.category === "Past Papers");
  const notesList = filteredResources.filter((item) => item.category === "Notes");
  const gkList = filteredResources.filter((item) => item.category === "General Knowledge");

  const showPastPapers = selectedCategory === 'all' || selectedCategory === 'Past Papers';
  const showNotes = selectedCategory === 'all' || selectedCategory === 'Notes';
  const showGK = selectedCategory === 'all' || selectedCategory === 'General Knowledge';

  return (
    <main>
      <section className="page-hero section-pad">
        <div className="container reveal visible">
          <span className="eyebrow">Resource library</span>
          <h1>Notes, Past Papers and General Knowledge</h1>
          <p>
            Search, filter, sort, and view resources from a responsive library that updates instantly when administrators publish new content.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="toolbar reveal visible" role="search">
            <input
              id="resourceSearch"
              type="search"
              placeholder="Search by title, category or description"
              aria-label="Search resources"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              id="categoryFilter"
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Past Papers">Past Papers</option>
              <option value="Notes">Notes</option>
              <option value="General Knowledge">General Knowledge</option>
            </select>
            <select
              id="sortResources"
              aria-label="Sort resources"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {showPastPapers && (
            <section className="resource-section reveal visible" aria-labelledby="past-papers-title">
              <h2 id="past-papers-title">Past Papers</h2>
              <div className="resource-grid" id="pastPapersGrid">
                {pastPapers.length > 0 ? (
                  pastPapers.map((item) => <ResourceCard key={item.id} resource={item} />)
                ) : (
                  <div className="empty-state">No Past Papers resources found.</div>
                )}
              </div>
            </section>
          )}

          {showNotes && (
            <section className="resource-section reveal visible" aria-labelledby="notes-title">
              <h2 id="notes-title">Notes</h2>
              <div className="resource-grid" id="notesGrid">
                {notesList.length > 0 ? (
                  notesList.map((item) => <ResourceCard key={item.id} resource={item} />)
                ) : (
                  <div className="empty-state">No Notes resources found.</div>
                )}
              </div>
            </section>
          )}

          {showGK && (
            <section className="resource-section reveal visible" aria-labelledby="gk-title">
              <h2 id="gk-title">General Knowledge (GK)</h2>
              <div className="resource-grid" id="gkGrid">
                {gkList.length > 0 ? (
                  gkList.map((item) => <ResourceCard key={item.id} resource={item} />)
                ) : (
                  <div className="empty-state">No General Knowledge resources found.</div>
                )}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
