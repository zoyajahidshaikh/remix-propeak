import React from 'react';
// import Summary from '../../app/features/summary/summary.jsx';
import Summary from "~/features/summary/summary";
import Menu from "~/features/menu";
export const meta = () => {
  return [
    { title: 'Project Management' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <Summary />
      {/* <Menu /> */}
    </div>
  );
}
