
import { appPlans } from "../assets/assets";
import type { Plan } from "../types/index";

const Pricing = () => {
  return (
    <div className="w-full py-16 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-lg mb-8">
          Start for free and upgrade as you grow. Scale our services with your growing needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(appPlans as Plan[]).map((plan, index) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-8 border transition-all ${
              index === 1
                ? "border-indigo-500 bg-linear-to-br from-slate-900 to-slate-800 shadow-2xl shadow-indigo-500/20 scale-105"
                : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
            }`}
          >
            {/* Plan Badge */}
            {index === 1 && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wide border border-indigo-500/50">
                  Popular
                </span>
              </div>
            )}

            {/* Plan Name */}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

            {/* Price */}
            <div className="mb-2">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-400 text-sm">/month</span>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

            {/* CTA Button */}
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold mb-8 transition-all ${
                index === 1
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-slate-800 text-white border border-slate-700 hover:border-slate-600 hover:bg-slate-700"
              }`}
            >
              Buy Now
            </button>

            {/* Features */}
            <div className="space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                What's included
              </p>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-16">
        <p className="text-gray-400">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
};

export default Pricing;