// src/Components/JobDescriptionDetail.jsx
import React from 'react';

const JobDescriptionDetail = ({ description }) => {
  if (!description) {
    return <p>No description available.</p>;
  }

  // Helper to render sections
  const renderSection = (title, content) => (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="prose max-w-none prose-sm dark:prose-invert text-gray-700">
        {content}
      </div>
    </div>
  );

  // Helper to parse list items
  const parseList = (text) => {
    if (!text) return null;
    return (
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        {text.split('•').map((item, index) => {
          const trimmedItem = item.trim();
          if (trimmedItem) {
            // Handle nested lists (e.g., 'o Savings Accounts')
            const nestedItems = trimmedItem.split('o').map(subItem => subItem.trim()).filter(Boolean);
            if (nestedItems.length > 1) {
              return (
                <li key={index}>
                  {nestedItems[0]}
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    {nestedItems.slice(1).map((sub, i) => (
                      <li key={i}>{sub}</li>
                    ))}
                  </ul>
                </li>
              );
            }
            return <li key={index}>{trimmedItem}</li>;
          }
          return null;
        })}
      </ul>
    );
  };


  // Manual parsing based on the provided text structure
  const sections = {};
  const lines = description.split(/\d+\./).filter(line => line.trim());

  lines.forEach(line => {
    const [title, ...contentParts] = line.split(':');
    const content = contentParts.join(':').trim();

    if (title.includes('Job Profile Details')) {
      sections['Job Profile Details'] = parseList(content);
    } else if (title.includes('Role & Responsibility')) {
      sections['Role & Responsibility'] = <p>{content.split('•')[0].trim()}</p>; // Main paragraph
      sections['Key Responsibilities'] = parseList(content.substring(content.indexOf('•'))); // List items
    } else if (title.includes('Skills')) {
      sections['Skills'] = parseList(content);
    } else if (title.includes('Eligibility Criteria')) {
      sections['Eligibility Criteria'] = parseList(content);
    }
  });

  return (
    <div>
      {Object.entries(sections).map(([title, content]) => (
        renderSection(title, content)
      ))}
    </div>
  );
};

export default JobDescriptionDetail;
