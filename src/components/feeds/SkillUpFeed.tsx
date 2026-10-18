import SkillUpHeader from "./skillup/SkillUpHeader";
import ProfessionalBodiesCard from "./skillup/ProfessionalBodiesCard";

const SkillUpFeed = () => {
  return (
    <div className="core-vertical-grid">
      <SkillUpHeader />

      <div className="core-vertical-grid">
        <h2 className="py-4 text-center text-2xl font-bold text-primary sm:text-3xl">
          Coming Soon
        </h2>

        <ProfessionalBodiesCard />
      </div>
    </div>
  );
};

export default SkillUpFeed;
