import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegion } from '../../contexts/RegionContext';
import { useCatalog } from '../../contexts/CatalogContext';
import GuideModal from '../../components/GuideModal';
import { EmptyState } from '../../components/ui';

// A real, crawlable URL for every estate and experience —
// /:regionId/estates/mr-edwards — rendering the same detail view the
// directory opens as a modal. Closing returns to the directory.

interface Props {
  kind: 'winery' | 'experience';
}

const DetailPage: React.FC<Props> = ({ kind }) => {
  const { itemId } = useParams<{ itemId: string }>();
  const { region, regionId, experiences } = useRegion();
  const { getWinery } = useCatalog();
  const navigate = useNavigate();

  const item = useMemo(() => {
    if (!itemId) return null;
    return kind === 'winery'
      ? getWinery(itemId) ?? null
      : experiences.find(e => e.id === itemId) ?? null;
  }, [kind, itemId, getWinery, experiences]);

  useEffect(() => {
    if (item) document.title = `${item.name} — ${region.name} | Somm`;
    return () => { document.title = `Somm — ${region.name}, properly`; };
  }, [item, region.name]);

  if (!item) {
    return (
      <div className="py-20">
        <EmptyState
          title="Nothing at this address"
          body="We couldn't find that listing in this region — it may have moved corners."
        />
      </div>
    );
  }

  return (
    <GuideModal
      item={item}
      type={kind}
      onClose={() =>
        navigate(`/${regionId}/guide${kind === 'experience' ? '/experiences' : ''}`)
      }
    />
  );
};

export default DetailPage;
