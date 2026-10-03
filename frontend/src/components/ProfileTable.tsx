import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, ProfileStatus } from '../types/profile';
import {
  Edit3,
  Trash2,
  Search,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProfileTableProps {
  profiles: UserProfile[];
  onEdit: (profile: UserProfile) => void;
  onDelete: (profile: UserProfile) => void;
  onAddNew: () => void;
}

type SortField = 'fullName' | 'age' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const ProfileTable: React.FC<ProfileTableProps> = ({
  profiles,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProfileStatus>('All');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination states: default limit for the data table view is 20
  const [limit, setLimit] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((profile) => {
        const matchesStatus = statusFilter === 'All' || profile.status === statusFilter;
        if (!matchesStatus) return false;

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          profile.fullName.toLowerCase().includes(q) ||
          profile.email.toLowerCase().includes(q) ||
          profile.contactNumber.toLowerCase().includes(q) ||
          profile.address.toLowerCase().includes(q) ||
          profile.gender.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'fullName') {
          comparison = a.fullName.localeCompare(b.fullName);
        } else if (sortField === 'age') {
          comparison = Number(a.age) - Number(b.age);
        } else if (sortField === 'status') {
          comparison = a.status.localeCompare(b.status);
        } else if (sortField === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [profiles, searchTerm, statusFilter, sortField, sortOrder]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / limit));

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, limit]);

  // Ensure currentPage doesn't exceed totalPages if items are deleted
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Paginated slice for current page
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredProfiles.slice(start, start + limit);
  }, [filteredProfiles, currentPage, limit]);

  const startIndex = filteredProfiles.length === 0 ? 0 : (currentPage - 1) * limit;
  const endIndex = Math.min(currentPage * limit, filteredProfiles.length);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status: ProfileStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pending</span>
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Inactive</span>
          </span>
        );
    }
  };

  // Generate page numbers for navigation
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section id="profile-directory" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table Section Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Submitted Profiles
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-slate-100 text-slate-700">
              {filteredProfiles.length} of {profiles.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Directory of registered user profiles. You can search, filter, edit or remove profiles.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search profiles..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 transition-colors"
            />
          </div>

          {/* Status Filter Segmented Buttons */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
            {(['All', 'Active', 'Pending', 'Inactive'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  statusFilter === filter
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* View Toggle (Table vs Mobile Cards) */}
          <div className="hidden lg:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Card grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredProfiles.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No profiles found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'Try adjusting your search criteria or resetting your status filter.'
              : 'No profiles have been submitted yet. Use the form above to add your first profile.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {searchTerm || statusFilter !== 'All' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Search Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddNew}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Create Profile
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View (Alternative Dashboard presentation) */
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProfiles.map((profile) => (
            <div
              key={profile.id}
              className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-200">
                        {profile.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight">
                        {profile.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Age: {profile.age} · {profile.gender}
                      </p>
                    </div>
                  </div>
                  <div>{getStatusBadge(profile.status)}</div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{profile.contactNumber}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{profile.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(profile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Responsive Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th scope="col" className="py-3.5 px-5 w-16">
                  Profile
                </th>
                <th scope="col" className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('fullName')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    <span>Full Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4 w-20 text-center">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('age')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Email
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Contact Number
                </th>
                <th scope="col" className="py-3.5 px-4">
                  Gender
                </th>
                <th scope="col" className="py-3.5 px-4 max-w-[220px]">
                  Address
                </th>
                <th scope="col" className="py-3.5 px-4 w-28">
                  <button
                    type="button"
                    onClick={() => handleSortToggle('status')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors uppercase tracking-wider"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="py-3.5 px-5 text-right w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedProfiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Profile Image */}
                  <td className="py-3.5 px-5">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.fullName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 bg-slate-100">
                          {profile.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Full Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {profile.fullName}
                  </td>

                  {/* Age */}
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700 text-center">
                    {profile.age}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    <a
                      href={`mailto:${profile.email}`}
                      className="hover:text-indigo-600 hover:underline transition-colors block truncate max-w-[200px]"
                      title={profile.email}
                    >
                      {profile.email}
                    </a>
                  </td>

                  {/* Contact Number */}
                  <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-slate-700 whitespace-nowrap">
                    <a
                      href={`tel:${profile.contactNumber}`}
                      className="hover:text-indigo-600 hover:underline transition-colors"
                    >
                      {profile.contactNumber}
                    </a>
                  </td>

                  {/* Gender */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                    {profile.gender}
                  </td>

                  {/* Address */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[220px]">
                    <p className="truncate" title={profile.address}>
                      {profile.address}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(profile.status)}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(profile)}
                        title="Edit profile"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(profile)}
                        title="Delete profile"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer with Pagination & Limit Controls */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
        {/* Left: Summary Count */}
        <div className="flex items-center gap-1.5">
          <span>Showing</span>
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {filteredProfiles.length === 0 ? 0 : startIndex + 1}
          </span>
          <span>to</span>
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {endIndex}
          </span>
          <span>of</span>
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            {filteredProfiles.length}
          </span>
          <span>profiles</span>
        </div>

        {/* Right: Limit Selector + Page Navigation */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Limit / Rows Per Page Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="table-limit-select" className="text-slate-500 whitespace-nowrap">
              Limit:
            </label>
            <select
              id="table-limit-select"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-300 bg-white text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Page Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 mr-1 whitespace-nowrap">
              Page <span className="font-semibold text-slate-800 font-mono">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-800 font-mono">{totalPages}</span>
            </span>

            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numeric Page Buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) =>
                pageNum === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
