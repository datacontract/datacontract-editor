import {memo, useMemo} from 'react';

const Tags = memo(({tags, managedTags = []}) => {
  const managedTagsMap = useMemo(() => {
    return new Map(managedTags.map(tag => [tag.tag.toLowerCase(), tag]));
  }, [managedTags]);

  return (<div className="flex items-center flex-wrap">
    {tags.map(tag => {
      const managedTag = managedTagsMap.get(tag.toLowerCase());
      return managedTag ? (
        <a href={managedTag.href ?? null} target="_blank" className="badge--indigo m-0.5">
          <svg className="size-1.5 fill-indigo-500" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3"/>
          </svg>
          <span>{managedTag.tag}</span>
        </a>
      ) : (
        <span className="badge--gray tag-element m-0.5">
        <svg className="size-1.5 fill-gray-500" viewBox="0 0 6 6" aria-hidden="true">
          <circle cx="3" cy="3" r="3"/>
        </svg>
        <span>{tag}</span>
      </span>
      );
    })}
  </div>)
});

Tags.displayName = 'Tags';

export default Tags;
