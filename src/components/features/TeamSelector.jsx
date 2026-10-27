import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '../ui/Tooltip.jsx';
import QuestionMarkCircleIcon from '../ui/icons/QuestionMarkCircleIcon.jsx';
import TeamIcon from '../ui/icons/TeamIcon.jsx';
import { buildTeamTree, filterTeams } from '../../utils/teamTree.js';

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
  </svg>
);

const ChildBranchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M1 2v20h16" />
  </svg>
);

const TeamAvatar = ({ team, muted = false }) => (
  team?.icon
    ? <img src={team.icon} alt="" className="size-5 shrink-0 object-contain" />
    : <TeamIcon className={`size-5 shrink-0 ${muted ? 'text-gray-300' : 'text-gray-500'}`} />
);

const TeamLabel = ({ team, muted = false }) => (
  <span className="flex min-w-0 flex-1 flex-col">
    <span className="flex min-w-0 items-center gap-1.5">
      <span className={`truncate text-xs leading-4 ${muted ? 'font-medium text-gray-400' : 'font-medium text-gray-900'}`}>
        {team.name || team.id}
      </span>
      {team.type && (
        <span className="shrink-0 rounded bg-gray-50 px-1 text-[10px] leading-4 text-gray-500 ring-1 ring-inset ring-gray-500/10">
          {team.type}
        </span>
      )}
    </span>
    {team.description && (
      <span className="truncate text-[11px] leading-4 text-gray-500">{team.description}</span>
    )}
  </span>
);

/**
 * Picks the owning team from the host's team list, shown as a searchable tree with icons,
 * types and descriptions. The value is the team's id, written to `team.name`.
 * Parents the user may not assign (selectable: false) give the tree its structure but cannot be picked.
 */
const TeamSelector = ({ name, label, tooltip, teams, value, onChange, required = false }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const tree = useMemo(() => buildTeamTree(teams), [teams]);
  const visibleTeams = useMemo(() => filterTeams(tree, search), [tree, search]);
  const selectedTeam = tree.find((team) => team.id === value) || null;
  const isUnknown = !!value && !selectedTeam;
  const isMissing = required && !value;

  const close = () => {
    setOpen(false);
    setSearch('');
    setActiveIndex(-1);
  };

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const choose = (team) => {
    if (!team?.selectable) return;
    onChange(team.id);
    close();
    triggerRef.current?.focus();
  };

  const moveActive = (step) => {
    const count = visibleTeams.length;
    if (count === 0) return;
    let index = activeIndex;
    for (let i = 0; i < count; i++) {
      index = (index + step + count) % count;
      if (visibleTeams[index].selectable) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(visibleTeams[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
    }
  };

  const ringClass = isMissing || isUnknown
    ? 'ring-red-300'
    : open ? 'ring-2 ring-indigo-600' : 'ring-gray-300';

  return (
    <div ref={containerRef}>
      <div className="flex items-center gap-1 mb-1">
        <label htmlFor={name} className="block text-xs font-medium leading-4 text-gray-900">{label}</label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <QuestionMarkCircleIcon />
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">{t('input.requiredLabel')}</span>
        )}
      </div>

      <div className="relative">
        <button
          ref={triggerRef}
          id={name}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={isMissing || isUnknown}
          onClick={() => (open ? close() : setOpen(true))}
          className={`flex w-full items-center gap-2 rounded-md bg-white px-2 py-1.5 text-left shadow-sm ring-1 ring-inset ${ringClass} focus:outline-hidden focus:ring-2 focus:ring-indigo-600`}
        >
          {selectedTeam ? (
            <>
              <TeamAvatar team={selectedTeam} />
              <TeamLabel team={selectedTeam} />
            </>
          ) : isUnknown ? (
            <>
              <TeamIcon className="size-5 shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-xs leading-4 text-gray-900">{value}</span>
            </>
          ) : (
            <span className="flex-1 text-xs leading-4 text-gray-400">{t('team.selector.placeholder')}</span>
          )}
          <ChevronDownIcon className="size-4 shrink-0 text-gray-400" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md bg-white shadow-lg outline outline-black/5">
            <div className="border-b border-gray-100 p-1.5">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={t('team.selector.search')}
                aria-label={t('team.selector.search')}
                className="block w-full rounded-md border-0 py-1 px-2 text-xs leading-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </div>
            <ul ref={listRef} role="listbox" aria-label={label} className="max-h-72 overflow-y-auto overscroll-contain p-1">
              {visibleTeams.map((team, index) => {
                const isSelected = team.id === value;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={team.id}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={!team.selectable}
                    onClick={() => choose(team)}
                    onMouseEnter={() => team.selectable && setActiveIndex(index)}
                    style={{ paddingLeft: `${0.5 + team.level * 1.125}rem` }}
                    className={`flex items-center gap-1.5 rounded-md py-1.5 pr-2 ${
                      team.selectable ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${isSelected ? 'bg-gray-100' : isActive ? 'bg-gray-50' : ''}`}
                  >
                    {team.level > 0 && <ChildBranchIcon className="size-3.5 shrink-0 self-start mt-0.5 text-gray-300" />}
                    <TeamAvatar team={team} muted={!team.selectable} />
                    <TeamLabel team={team} muted={!team.selectable} />
                    {isSelected && <CheckIcon className="size-4 shrink-0 text-indigo-600" />}
                  </li>
                );
              })}
              {visibleTeams.length === 0 && (
                <li className="px-2 py-3 text-center text-xs text-gray-500">{t('team.selector.noResults')}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {isMissing && <p className="mt-1 text-xs text-red-600">{t('input.required')}</p>}
      {isUnknown && <p className="mt-1 text-xs text-red-600">{t('team.selector.unknown')}</p>}
    </div>
  );
};

export default TeamSelector;
