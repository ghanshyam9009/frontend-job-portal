import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Bookmark, ChevronDown, ChevronUp, Menu, X, Filter } from 'lucide-react';

// function JobRoleCard({ title, image, link, isDark }) {
//   const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
//   const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
//   const cardHoverBorder = isDark ? 'hover:border-blue-600' : 'hover:border-blue-300';
//   const cardHoverShadow = isDark ? 'hover:shadow-blue-500/20' : 'hover:shadow-xl';
//   const iconBg = isDark ? 'bg-blue-900/40' : 'bg-blue-50';
//   const iconHoverBg = isDark ? 'group-hover:bg-blue-800/60' : 'group-hover:bg-blue-100';
//   const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
//   const textHoverColor = isDark ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600';
//   const imageBrightness = isDark ? 'brightness-110' : '';

//   return (
//     <a 
//       href={link}
//       className={`group ${cardBg} rounded-lg p-6 flex flex-col items-center justify-center gap-4 ${cardHoverShadow} transition-all duration-300 cursor-pointer border ${cardBorder} ${cardHoverBorder} min-h-[180px]`}
//     >
//       <div className={`${iconBg} p-4 rounded-lg ${iconHoverBg} transition-colors duration-300 w-16 h-16 flex items-center justify-center`}>
//         <img 
//           src={image} 
//           alt={title}
//           className={`w-10 h-10 object-contain ${imageBrightness}`}
//         />
//       </div>
//       <div className="text-center">
//         <h3 className={`font-medium text-base ${textColor} leading-snug ${textHoverColor} transition-colors duration-300`}>
//           {title}
//         </h3>
//       </div>
//     </a>
//   );
// }

export default function JobListing() {
  const [expandedSections, setExpandedSections] = useState({
    workMode: true,
    department: false,
    location: false,
    experience: false,
    salary: false,
    topCompanies: false,
    industry: false,
    role: false,
    stipend: false
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const departments = [
    { name: 'Engineering - Hardware', count: 1963, checked: true },
    { name: 'Engineering - Software', count: 28890, checked: true },
    { name: 'IT & Information Security', count: 4377, checked: true },
    { name: 'Sales & Business Development', count: 15214, checked: false }
  ];

  const workModes = [
    { name: 'Work from office', count: 31068 },
    { name: 'Hybrid', count: 3210 },
    { name: 'Remote', count: 952 }
  ];

  const jobs = [
    {
      id: 1,
      title: 'Cognizant Hiring UX Designer _6To9_Mumbai/Bangalore',
      company: 'Cognizant',
      rating: 3.7,
      reviews: 58307,
      experience: '6-9 Yrs',
      location: 'Navi Mumbai, Bengaluru',
      description: 'Dear Candidate_Name_Greetings from Cognizant!!Recently I got referral y...',
      skills: ['UI/UX Designer', 'Interaction Design', 'UX Designer', 'Product Design', 'Design', 'UX'],
      postedTime: '1 day ago',
      logo: '🔵'
    },
    {
      id: 2,
      title: 'Network Operations Engineer(network Engineer) - only ...',
      company: 'Randstad Digital',
      postedBy: 'Posted by Randstad',
      experience: '0-1 Yrs',
      location: 'Bangalore/Bengaluru',
      description: 'Job description: . Any Education qualification (2020-2025) passout . work f...',
      skills: ['networking', 'Linux', 'ccnp', 'CCNA', 'Network operations', 'Network'],
      postedTime: '1 day ago'
    },
    {
      id: 3,
      title: 'Dot Net Web Developer',
      company: 'Foreign IT Consulting MNC',
      rating: 3.5,
      tag: 'Foreign MNC',
      experience: '4-9 Yrs',
      location: 'Kolkata, Hodersh',
      postedTime: '2 days ago'
    }
  ];

  const featuredCompanies = [
    { name: 'The Hackett Group', logo: '🔵' },
    { name: 'kyndryl', logo: '🔴' },
    { name: 'Tech Mahindra', logo: '🔵' },
    { name: 'Capgemini', logo: '🔵' },
    { name: 'OPENTEXT', logo: '⬛' },
    { name: 'virtusa', logo: '🟦' }
  ];
const [filters, setFilters] = useState({
  jobType: "",
  category: "",
  salaryRange: "",
  remoteOnly: false,
});

const handleFilterChange = (field, value) => {
  setFilters((prev) => ({ ...prev, [field]: value }));
};

const clearFilters = () => {
  setFilters({ jobType: "", category: "", salaryRange: "", remoteOnly: false });
};
 const FilterContent = () => (
  <div className="space-y-8">
    {/* Job Type */}
    <div>
      <h3 className="text-gray-900 font-semibold mb-3 text-base flex items-center gap-2">
        <Filter className="w-4 h-4 text-blue-600" /> Job Type
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          "Full Time",
          "Part Time",
          "Contractual",
          "Intern",
          "Freelance",
          "Night Shift",
        ].map((type) => (
          <label
            key={type}
            className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border transition-all cursor-pointer ${
              filters.jobType === type
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="jobType"
              value={type}
              checked={filters.jobType === type}
              onChange={(e) => handleFilterChange("jobType", e.target.value)}
              className="accent-blue-600"
            />
            {type}
          </label>
        ))}
      </div>
    </div>

    {/* Category */}
    <div>
      <h3 className="text-gray-900 font-semibold mb-3 text-base flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-blue-600" /> Category
      </h3>
      <div className="relative">
        <select
          className="w-full appearance-none border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
                 <option value="">All Categories</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Accounting, Data Entry">Accounting, Data Entry</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Administration">Administration</option>
                  <option value="Administrative & Office Support">Administrative & Office Support</option>
                  <option value="Auto Mobile Sector">Auto Mobile Sector</option>
                  <option value="Automobile Industry">Automobile Industry</option>
                  <option value="Automotive Diagnostics">Automotive Diagnostics</option>
                  <option value="Automotive, Evaluation">Automotive, Evaluation</option>
                  <option value="Back Office Jobs">Back Office Jobs</option>
                  <option value="Back Office and Sales">Back Office and Sales</option>
                  <option value="Banking Sector">Banking Sector</option>
                  <option value="Beauty & Wellness, Hairdressing">Beauty & Wellness, Hairdressing</option>
                  <option value="Beauty Industry/Telecaller & Receptionist in Beauty Industry">Beauty Industry/Telecaller & Receptionist in Beauty Industry</option>
                  <option value="Bpo & kpo - Sector">Bpo & kpo - Sector</option>
                  <option value="Broking Firm">Broking Firm</option>
                  <option value="Construction">Construction</option>
                  <option value="Counseling Jobs">Counseling Jobs</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Customer Service and Telesales">Customer Service and Telesales</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Data Entry/ Administration">Data Entry/ Administration</option>
                  <option value="Delivery Services">Delivery Services</option>
                  <option value="Design/Creative">Design/Creative</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Distributor/Super Stockist">Distributor/Super Stockist</option>
                  <option value="Driving/Motor Technician">Driving/Motor Technician</option>
                  <option value="Education, Teaching">Education, Teaching</option>
                  <option value="Electronic Repair, Electronics Technician, Industrial Electronics">Electronic Repair, Electronics Technician, Industrial Electronics</option>
                  <option value="Energy/Solar Power / Consultation & Etc">Energy/Solar Power / Consultation & Etc</option>
                  <option value="Engineer/Architects">Engineer/Architects</option>
                  <option value="Engineering / Manufacturing">Engineering / Manufacturing</option>
                  <option value="Engineering/Design">Engineering/Design</option>
                  <option value="FInancial Consultancy">FInancial Consultancy</option>
                  <option value="FMCG Sales industry">FMCG Sales industry</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Finance/Administration">Finance/Administration</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Garments/Textile">Garments/Textile</option>
                  <option value="Glass industry">Glass industry</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="HR/Recruitment">HR/Recruitment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Helper">Helper</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="IT & Technology">IT & Technology</option>
                  <option value="IT & Telecommunication">IT & Telecommunication</option>
                  <option value="IT/Computer/Mis/System Work">IT/Computer/Mis/System Work</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Insurance, Sales">Insurance, Sales</option>
                  <option value="Internship">Internship</option>
                  <option value="Laboratories">Laboratories</option>
                  <option value="Law/Legal/Immigration Consultant,Legal Assistant">Law/Legal/Immigration Consultant,Legal Assistant</option>
                  <option value="Logistics and Supply Chain">Logistics and Supply Chain</option>
                  <option value="Logistics, Packaging">Logistics, Packaging</option>
                  <option value="Management">Management</option>
                  <option value="Manufacturer & Supplier">Manufacturer & Supplier</option>
                  <option value="Manufacturer of Polycarbonate">Manufacturer of Polycarbonate</option>
                  <option value="Manufacturing, Operations">Manufacturing, Operations</option>
                  <option value="Marketing & Media">Marketing & Media</option>
                  <option value="Marketing Jobs">Marketing Jobs</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Mechanical Fitter">Mechanical Fitter</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Medical/Pharma/pharmaceutica">Medical/Pharma/pharmaceutica</option>
                  <option value="Operations, Management">Operations, Management</option>
                  <option value="Others">Others</option>
                  <option value="Packaging Industries">Packaging Industries</option>
                  <option value="Packers & Movers">Packers & Movers</option>
                  <option value="Production/Manufacturing">Production/Manufacturing</option>
                  <option value="Quality Control/Inventory Jobs">Quality Control/Inventory Jobs</option>
                  <option value="Real Rstates">Real Rstates</option>
                  <option value="Real State Valuation">Real State Valuation</option>
                  <option value="Restaurant, Cafe, Food Service">Restaurant, Cafe, Food Service</option>
                  <option value="Retail industry services">Retail industry services</option>
                  <option value="Sales & Business Development">Sales & Business Development</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Sales & Marketing, Retail">Sales & Marketing, Retail</option>
                  <option value="Sales Jobs">Sales Jobs</option>
                  <option value="Sales, Marketing, Back Office">Sales, Marketing, Back Office</option>
                  <option value="Sales, Marketing, Design, E-commerce">Sales, Marketing, Design, E-commerce</option>
                  <option value="School/College">School/College</option>
                  <option value="Security Services">Security Services</option>
                  <option value="Service & Housekeeping">Service & Housekeeping</option>
                  <option value="Service & Trading">Service & Trading</option>
                  <option value="Software Operation">Software Operation</option>
                  <option value="Supervision Inspection Monitoring">Supervision Inspection Monitoring</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Support Staff/Office Services/Office Boy">Support Staff/Office Services/Office Boy</option>
                  <option value="Tax Consultants (Law Firm ) Legal Services">Tax Consultants (Law Firm ) Legal Services</option>
                  <option value="Technical">Technical</option>
                  <option value="Transport /Logistics">Transport /Logistics</option>
                  <option value="Transportation, Driving Jobs">Transportation, Driving Jobs</option>
                  <option value="Welding and Fabrication">Welding and Fabrication</option>
                  <option value="Workshop">Workshop</option>
                  <option value="kpo">kpo</option>
        </select>
        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>

    {/* Salary Range */}
    <div>
      <h3 className="text-gray-900 font-semibold mb-3 text-base flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-blue-600" /> Salary Range
      </h3>
      <div className="relative">
        <select
          className="w-full appearance-none border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          value={filters.salaryRange}
          onChange={(e) => handleFilterChange("salaryRange", e.target.value)}
        >
          <option value="">Any Salary</option>
          <option value="0-3">₹0 - ₹3L</option>
          <option value="3-5">₹3L - ₹5L</option>
          <option value="5-7">₹5L - ₹7L</option>
          <option value="7-10">₹7L - ₹10L</option>
          <option value="10-15">₹10L - ₹15L</option>
          <option value="15+">₹15L+</option>
        </select>
        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>

    {/* Remote Jobs */}
    <div className="pt-2 border-t border-gray-200">
      <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 rounded-lg p-2 transition">
        <input
          type="checkbox"
          checked={filters.remoteOnly}
          onChange={(e) => handleFilterChange("remoteOnly", e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm text-gray-700 font-medium">Remote Jobs Only</span>
      </label>
    </div>

    {/* Apply / Clear Buttons */}
    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
      <button
        onClick={clearFilters}
        className="text-sm font-semibold text-red-600 hover:text-red-700 transition"
      >
        Clear All
      </button>
      <button
        onClick={() => setMobileFilterOpen(false)}
        className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
      >
        Apply Filters
      </button>
    </div>
  </div>
);


  return (
    <div className="min-h-screen bg-gray-50">
     


      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">All Filters</h2>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* Job Listings */}
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {job.logo && <div className="text-2xl hidden md:block">{job.logo}</div>}
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 leading-tight">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm md:text-base text-gray-700">{job.company}</span>
                            {job.rating && (
                              <>
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-xs md:text-sm text-gray-600">{job.rating}</span>
                              </>
                            )}
                            {job.reviews && (
                              <span className="hidden md:inline text-sm text-gray-500">{job.reviews} Reviews</span>
                            )}
                          </div>
                          <div className="flex gap-3 md:gap-4 mb-3 text-xs md:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{job.experience}</span>
                            </div>
                          </div>
                          {job.skills && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs text-gray-600 bg-gray-50 px-2 md:px-3 py-1 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">{job.postedTime}</p>
                        </div>
                      </div>
                    </div>
                    <button className="ml-2 md:ml-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">⋮</div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-semibold mb-4">See 552 jobs in Featured Companies</h3>
              <div className="grid grid-cols-2 gap-3">
                {featuredCompanies.map((company, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-3 text-center hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="text-2xl mb-2">{company.logo}</div>
                    <p className="text-xs font-medium">{company.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg shadow-sm p-6">
              <div className="text-2xl mb-3">⚡ naukri FASTFORWARD</div>
              <h3 className="font-semibold mb-2">Get 3X more profile views from recruiters</h3>
              <p className="text-sm text-gray-600 mb-4">
                Increase your chances of callback with Naukri FastForward
              </p>
              <button className="text-blue-600 text-sm font-semibold">Know More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}