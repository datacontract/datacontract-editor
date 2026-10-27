// Quality check icons: one glyph per ODCS quality dimension, plus a generic one for checks
// that declare no (recognized) dimension. Streamline Ultimate Light glyphs on a 24x24 grid,
// stroke only, so they inherit the badge's text color.
//
// Kept in sync with the schema view of the Entropy Data catalog, which renders the same badges.

// ODCS 3.1 allows a two-letter synonym for every dimension, so both spellings must resolve
// to the same icon.
const DIMENSION_ALIASES = {
  ac: 'accuracy',
  cp: 'completeness',
  cf: 'conformity',
  cs: 'consistency',
  cv: 'coverage',
  tm: 'timeliness',
  uq: 'uniqueness',
};

const DIMENSION_ICON_PATHS = {
  // Cog Approved 1
  generic: [
    'M23.5 0.5 12.74 13.6a1 1 0 0 1 -0.74 0.4 1 1 0 0 1 -0.77 -0.33L8 10',
    'M19.88 8.73a1.88 1.88 0 0 0 1.11 1l1.26 0.45a1.88 1.88 0 0 1 0 3.54l-1.25 0.5a1.88 1.88 0 0 0 -1.11 1 1.91 1.91 0 0 0 0 1.52L20.5 18a1.88 1.88 0 0 1 -2.5 2.5l-1.21 -0.58a1.91 1.91 0 0 0 -1.52 0 1.88 1.88 0 0 0 -1 1.11l-0.45 1.26a1.88 1.88 0 0 1 -3.54 0L9.78 21a1.88 1.88 0 0 0 -1 -1.11 1.91 1.91 0 0 0 -1.52 0L6 20.5A1.88 1.88 0 0 1 3.5 18l0.58 -1.21a1.91 1.91 0 0 0 0 -1.52 1.88 1.88 0 0 0 -1.11 -1l-1.26 -0.45a1.88 1.88 0 0 1 0 -3.54L3 9.78a1.88 1.88 0 0 0 1.11 -1 1.91 1.91 0 0 0 0 -1.52L3.5 6A1.88 1.88 0 0 1 6 3.5l1.21 0.58a1.91 1.91 0 0 0 1.52 0A1.88 1.88 0 0 0 9.78 3l0.45 -1.26a1.88 1.88 0 0 1 3.54 0L14.22 3a1.88 1.88 0 0 0 1 1.11',
  ],
  // Measure Ruler
  accuracy: [
    'M17.571 3.429A10 10 0 0 0 3.429 17.571l-1.768 1.768a0.5 0.5 0 0 0 0 0.707l3.308 3.308a0.5 0.5 0 0 0 0.707 0L23.354 5.676a0.5 0.5 0 0 0 0 -0.707l-3.308 -3.308a0.5 0.5 0 0 0 -0.707 0ZM6.257 14.743a6 6 0 0 1 8.486 -8.486Z',
    'm7.09 21.939 -1.768 -1.767',
    'M9.211 19.818 7.444 18.05',
    'm11.333 17.697 -1.768 -1.768',
    'm13.454 15.575 -1.768 -1.767',
    'm15.575 13.454 -1.767 -1.768',
    'm17.697 11.333 -1.768 -1.768',
    'M19.818 9.211 18.05 7.444',
    'm21.939 7.09 -1.767 -1.768',
  ],
  // Task List Check 1
  completeness: [
    'm14.5 9.5 0 -4 -11 0 0 12.999 5 0.001',
    'M17.5 8.5v-5a1 1 0 0 0 -1 -1h-4.448a3.329 3.329 0 0 0 -6.1 0H1.5a1 1 0 0 0 -1 1v17a1 1 0 0 0 1 1h8',
    'm6.5 8.5 5 0',
    'm6.5 11.5 5 0',
    'm6.5 14.5 3 0',
    'M11.5 17.5a6 6 0 1 0 12 0 6 6 0 1 0 -12 0Z',
    'm20.174 15.755 -2.905 3.874a0.751 0.751 0 0 1 -1.131 0.08l-1.5 -1.5',
  ],
  // Legal Scale Document
  conformity: [
    'M9.5 12H22',
    'M15.75 10.75v10',
    'M13.25 23.25c0 -0.663 0.2634 -1.2989 0.7322 -1.7678 0.4689 -0.4688 1.1048 -0.7322 1.7678 -0.7322s1.2989 0.2634 1.7678 0.7322c0.4688 0.4689 0.7322 1.1048 0.7322 1.7678z',
    'm8.25 17 2.5 -5 2.5 5',
    'm18.25 17 2.5 -5 2.5 5',
    'M13.25 17c0 0.663 -0.2634 1.2989 -0.7322 1.7678 -0.4689 0.4688 -1.1048 0.7322 -1.7678 0.7322s-1.29893 -0.2634 -1.76777 -0.7322C8.51339 18.2989 8.25 17.663 8.25 17z',
    'M23.25 17c0 0.663 -0.2634 1.2989 -0.7322 1.7678 -0.4689 0.4688 -1.1048 0.7322 -1.7678 0.7322s-1.2989 -0.2634 -1.7678 -0.7322C18.5134 18.2989 18.25 17.663 18.25 17z',
    'M7.875 21.25H2.25c-0.39782 0 -0.77936 -0.158 -1.06066 -0.4393C0.908035 20.5294 0.75 20.1478 0.75 19.75V2.25c0 -0.39782 0.158035 -0.77936 0.43934 -1.06066C1.47064 0.908035 1.85218 0.75 2.25 0.75h11.379c0.3977 0.00035 0.779 0.158615 1.06 0.44l2.872 2.871c0.1393 0.13936 0.2497 0.30478 0.325 0.48683 0.0754 0.18205 0.1141 0.37715 0.114 0.57417v3.503',
    'M13.4512 0.75v4.62769h4.541',
  ],
  // Duplicate
  consistency: [
    'M16.4999 5.5V1.50049c0 -0.552286 -0.4477 -1.000002 -1 -1.000002H1.49988C0.947593 0.500488 0.499878 0.948203 0.499878 1.50049V15.5005c0 0.5523 0.447715 1 1.000002 1H5.5',
    'M7.4999 8.49951c0 -0.55228 0.44772 -1 1 -1h14c0.5523 0 1 0.44772 1 1V22.4995c0 0.5523 -0.4477 1 -1 1h-14c-0.55228 0 -1 -0.4477 -1 -1V8.49951Z',
  ],
  // Rain Umbrella
  coverage: [
    'M12 14.5c0 -1.105 1.343 -2 3 -2s3 0.895 3 2a2.292 2.292 0 0 1 2.5 -2 2.292 2.292 0 0 1 2.5 2V14c0 -6.351 -4.649 -11.5 -11 -11.5S1 7.649 1 14v0.5a2.292 2.292 0 0 1 2.5 -2 2.292 2.292 0 0 1 2.5 2c0 -1.105 1.343 -2 3 -2s3 0.9 3 2Z',
    'm12 2.5 0 -2',
    'm12 14.5 0 7.5',
    'M12 22a1.5 1.5 0 0 0 3 0v-0.5',
  ],
  // Time Clock Circle
  timeliness: [
    'M0.499 12.001a11.5 11.5 0 1 0 23 0 11.5 11.5 0 1 0 -23 0Z',
    'm12 6.501 0 5.5 6 5.5',
  ],
  // Copy 1
  uniqueness: [
    'm0.993027 3.64642 0 -1.71492c0 -0.55228 0.447713 -0.999997 1.000003 -0.999997l1.71491 0M0.993027 8.2144l0 3.3396M8.27593 0.931503l3.33957 0m4.5147 0 1.5964 0c0.5522 0 1 0.447717 1 0.999997l0 1.71492M0.993027 16.0687l0 1.5963c0 0.5523 0.447713 1 1.000003 1l1.71491 0',
    'M23.0078 22.0684c0 0.5522 -0.4477 1 -1 1l-14.73046 0c-0.55228 0 -1 -0.4478 -1 -1l0 -14.73051c0 -0.55228 0.44772 -1 1 -1l14.73046 0c0.5523 0 1 0.44772 1 1l0 14.73051Z',
  ],
};

const createIcon = (paths) => {
  const Icon = ({className = 'w-3 h-3'}) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, index) => <path key={index} d={d}/>)}
    </svg>
  );
  return Icon;
};

const DIMENSION_ICONS = Object.fromEntries(
  Object.entries(DIMENSION_ICON_PATHS).map(([dimension, paths]) => [dimension, createIcon(paths)]),
);

export const normalizeQualityDimension = (dimension) => {
  if (!dimension) {
    return null;
  }
  const key = String(dimension).trim().toLowerCase();
  const resolved = DIMENSION_ALIASES[key] || key;
  return resolved !== 'generic' && DIMENSION_ICONS[resolved] ? resolved : null;
};

/**
 * Icon component for a quality check, picked by its dimension.
 *
 * @param {object} qualityCheck an ODCS quality object
 */
export const getQualityCheckIcon = (qualityCheck) => {
  const dimension = normalizeQualityDimension(qualityCheck?.dimension);
  return DIMENSION_ICONS[dimension] || DIMENSION_ICONS.generic;
};
