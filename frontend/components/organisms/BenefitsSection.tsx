interface BenefitItem {
  iconClass: string;
  title: string;
  description: string;
}

const BENEFITS: BenefitItem[] = [
  {
    iconClass: 'fa-solid fa-paw',
    title: 'Wide Variety',
    description: 'Puppies, kittens & accessories for all pets',
  },
  {
    iconClass: 'fa-solid fa-heart',
    title: 'Expert Care',
    description: 'Our team is here to guide you',
  },
  {
    iconClass: 'fa-solid fa-shield-halved',
    title: 'Quality Products',
    description: 'Only the best for your beloved pets',
  },
  {
    iconClass: 'fa-solid fa-headphones',
    title: 'After-Sales Support',
    description: 'We care even after your purchase',
  },
];

export default function BenefitsSection() {
  return (
    <section className="mb-14">
      <div className="bg-[#FAF5FF] border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 lg:divide-x divide-purple-100/80">
          {cardItems()}
        </div>
      </div>
    </section>
  );

  function cardItems() {
    return BENEFITS.map((benefit, idx) => {
      return (
        <div
          key={benefit.title}
          className={`flex items-center gap-4 pt-4 md:pt-0 ${
            idx > 0 ? 'lg:pl-6' : ''
          }`}
        >
          {/* Circular Icon */}
          <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-purple-600 shadow-sm border border-purple-100 flex-shrink-0">
            <i className={`${benefit.iconClass} text-[18px]`}></i>
          </div>

          {/* Texts */}
          <div className="flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              {benefit.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug font-medium">
              {benefit.description}
            </p>
          </div>
        </div>
      );
    });
  }
}
