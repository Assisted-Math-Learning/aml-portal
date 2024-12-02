import { QuestionSet } from 'models/entities/QuestionSet';
import React, { useMemo } from 'react';

type SkillTaxonomyHeaderProps = {
  taxonomy?: QuestionSet['taxonomy'];
};

const SkillTaxonomyHeader: React.FC<SkillTaxonomyHeaderProps> = ({
  taxonomy,
}) => {
  const questionTaxonomySkills = useMemo(() => {
    const skillTaxonomy = [];

    if (taxonomy?.l1_skill) {
      skillTaxonomy.push(taxonomy.l1_skill);
    }

    if (taxonomy?.l2_skill.length) {
      skillTaxonomy.push(...taxonomy.l2_skill);
    }

    // TODO: Uncomment this when l3 skills are available, currently l3_skills are null[]
    // if (taxonomy?.l3_skill.length) {
    //   skillTaxonomy.push(...taxonomy.l3_skill);
    // }

    return skillTaxonomy;
  }, [taxonomy]);

  return questionTaxonomySkills.length > 0 ? (
    <div className='pt-6 text-2xl font-semibold text-headingTextColor'>
      {questionTaxonomySkills.map((skill, index) => (
        <React.Fragment key={skill?.identifier}>
          {index !== 0 && <span> &gt; </span>}
          <span>{skill?.name.en}</span>
        </React.Fragment>
      ))}
    </div>
  ) : null;
};

export default SkillTaxonomyHeader;
